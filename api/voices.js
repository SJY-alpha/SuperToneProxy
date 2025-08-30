export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const upstream = await fetch("https://api.supertoneapi.com/v1/voices", {
      headers: { "x-sup-api-key": process.env.SUPERTONE_API_KEY }
    });
    if (!upstream.ok) return res.status(upstream.status).send(await upstream.text());
    return res.status(200).json(await upstream.json());
  } catch (e) {
    console.error("voices proxy error:", e);
    return res.status(500).send("proxy fetch failed");
  }
}
