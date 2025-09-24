import { RequestHandler } from "express";

export const handleProxyWebhook: RequestHandler = (req, res) => {
  const webhook = process.env.VITE_WEBHOOK_URL || process.env.WEBHOOK_URL;
  if (!webhook) {
    return res.status(500).json({ error: "Webhook not configured on server." });
  }

  // Forward the incoming request body (stream) to the configured webhook.
  // Preserve the content-type so multipart/form-data works correctly.
  const headers: Record<string, string> = {};
  const ct = req.headers["content-type"];
  if (typeof ct === "string") headers["content-type"] = ct;

  // Use global fetch available in modern Node to proxy the request stream
  fetch(webhook, {
    method: "POST",
    headers,
    body: req,
  })
    .then(async (r) => {
      const contentType = r.headers.get("content-type") || "";
      const buffer = Buffer.from(await r.arrayBuffer());
      res.status(r.status);
      if (contentType.includes("application/json")) {
        try {
          const json = JSON.parse(buffer.toString("utf-8"));
          res.json(json);
        } catch (e) {
          res.type("text").send(buffer);
        }
      } else {
        if (contentType) res.setHeader("content-type", contentType);
        res.send(buffer);
      }
    })
    .catch((err) => {
      console.error("Proxy error:", err);
      res.status(502).json({ error: "Proxy request failed", message: String(err) });
    });
};
