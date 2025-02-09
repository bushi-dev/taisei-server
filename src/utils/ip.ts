export const getIp = (c: any): string => {
  return (
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "unknown"
  );
};
