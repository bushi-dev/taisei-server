import { Hono } from "hono";

const app = new Hono<{ Bindings: { mydb: KVNamespace } }>();

app.post("/set", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const data = await c.req.json();
  const { key, value } = data;

  if (!key || !value) {
    return c.json({ error: "Key and value are required" }, 400);
  }

  await kv.put(key, JSON.stringify(value));
  return c.text("Value set!");
});

app.get("/get/:key", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const key = c.req.param("key");
  const value = await kv.get(key);

  if (!value) {
    return c.json({ error: "Key not found" }, 404);
  }

  return c.json({ key, value: JSON.parse(value) });
});

app.get("/list", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const { keys } = await kv.list();
  const results = [];

  for (const { name } of keys) {
    const value = await kv.get(name);
    if (value) {
      results.push({ key: name, value: JSON.parse(value) });
    }
  }

  return c.json(results);
});
app.get("/", (c) => {
  return c.json({ test: "成功" });
});

//TODO {"key":"fdd51a117f784c8487a43abed0d9fd34","value":"test2"}で送りたい
// fdd51a117f784c8487a43abed0d9fd34は.envから取得
app.get("/add", async (c) => {
  const kv = c.env.mydb;
  if (!kv) {
    return c.json({ error: "KV namespace is not bound" }, 500);
  }

  const data = { key: "fdd51a117f784c8487a43abed0d9fd34", value: "test2" };
  const { key, value } = data;

  if (!key || !value) {
    return c.json({ error: "Key and value are required" }, 400);
  }

  await kv.put(key, JSON.stringify(value));
  return c.text("Value set!");
});

export default app;
