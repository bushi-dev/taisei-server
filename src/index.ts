import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.get("/test", (c) => {
  return c.json({ test: "成功" });
});
app.get("/add", (c) => {
  return c.json({ test: "成功" });
});

export default app;
