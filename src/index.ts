import { Hono } from "hono";
import { getIp } from "./utils/ip";

interface TakaraData {
  ip: string;
  takara: number[];
}

interface DbData {
  value: TakaraData[];
}

const app = new Hono<{ Bindings: { mydb: KVNamespace } }>();

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
