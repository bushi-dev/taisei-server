import { Hono } from "hono";
import { getIp } from "./utils/ip";
import { cors } from "hono/cors";

interface TakaraData {
  ip: string;
  takara: number[];
}

interface DbData {
  value: TakaraData[];
}

const app = new Hono<{ Bindings: { mydb: KVNamespace; DB: D1Database } }>();

app.use(
  cors({
    origin: "https://taisei.pages.dev",
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: [
      "X-Custom-Header",
      "Upgrade-Insecure-Requests",
      "Content-Type", // 追加
      "Authorization", // 追加(必要なら)
    ],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    credentials: true, // `credentials: "include"` を使うために必要
    maxAge: 600,
  })
);
app.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  await next();
});

app.get("/list", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const ip = getIp(c);
  const key = "fdd51a117f784c8487a43abed0d9fd34";
  const value = await kv.get(key);

  if (!value) {
    return c.json([]);
  }

  const parsed = JSON.parse(value);
  const data = {
    value: Array.isArray(parsed.value) ? parsed.value : [],
  } as DbData;
  const ipData = data.value.find((item) => item.ip === ip);
  return c.json(ipData?.takara || []);
});

app.get("/listAll", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const key = "fdd51a117f784c8487a43abed0d9fd34";
  const value = await kv.get(key);

  if (!value) {
    return c.json({ value: [] });
  }

  const parsed = JSON.parse(value);
  const data = {
    value: Array.isArray(parsed.value) ? parsed.value : [],
  } as DbData;
  return c.json(data);
});

app.get("/test", async (c) => {
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: "D1 database is not bound" }, 500);
  }
  const ip = getIp(c);
  const { results } = await db
    .prepare("SELECT ip,takara FROM TAKARA WHERE ip = ?")
    .bind(ip)
    .all();
  return c.json(results);
});

app.get("/add-db/:id", async (c) => {
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: "D1 database is not bound" }, 500);
  }
  const ip = getIp(c);

  //既存データ
  const { results: existing } = await db
    .prepare("SELECT ip,takara FROM TAKARA WHERE ip = ?")
    .bind(ip)
    .all();

  //existingとtakaraNoをマージする
  const takaraNoStr = c.req.param("id");
  const takaraNo = parseInt(takaraNoStr);
  if (isNaN(takaraNo)) {
    return c.json({ error: "Invalid takaraNo" }, 400);
  }
  let takara: number[] = [takaraNo];

  if (existing && existing.length > 0) {
    const existingTakara = Array.isArray(
      existing[0].takara as unknown as string[]
    )
      ? (existing[0].takara as number[])
      : (existing[0].takara as string).split(",").map(Number);
    takara = [...new Set([...existingTakara, takaraNo])];
  }

  const { results } = await db
    .prepare("INSERT OR REPLACE INTO TAKARA (ip, takara) VALUES (?, ?)")
    .bind(ip, takara.toString())
    .all();
  return c.json(results);
});

app.get("/", (c) => {
  return c.json({ test: "成功" });
});

app.get("/deleteAll", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const key = "fdd51a117f784c8487a43abed0d9fd34";
  await kv.put(key, JSON.stringify({ value: [] }));
  return c.json({ message: "Success" });
});

app.get("/add/:id", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const takaraNo = parseInt(c.req.param("id"));
  const takara = [takaraNo];

  const ip = getIp(c);
  const key = "fdd51a117f784c8487a43abed0d9fd34";
  const existingValue = await kv.get(key);
  let data: DbData = { value: [] };

  if (existingValue) {
    const parsed = JSON.parse(existingValue);
    data = { value: Array.isArray(parsed.value) ? parsed.value : [] };
    const index = data.value.findIndex((item) => item.ip === ip);
    if (index >= 0) {
      data.value[index].takara = [
        ...new Set([...data.value[index].takara, ...takara]),
      ];
    } else {
      data.value.push({ ip, takara });
    }
  } else {
    data.value.push({ ip, takara });
  }

  await kv.put(key, JSON.stringify(data));
  return c.json({ message: "Success" });
});

export default app;
