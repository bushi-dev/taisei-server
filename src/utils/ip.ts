export const getIp = (c: any): string => {
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "unknown";
  if (ip.includes(":")) {
    // IPv6の場合、最初の4ブロックを取得
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":");
  }
  return ip;
};
