export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const upstream = await fetch("https://api.supertone.ai/v1/voices", {
      method: "GET",
      headers: {
        "x-sup-api-key": process.env.SUPERTONE_API_KEY
      }
    });

    if (!upstream.ok) {
      const errTxt = await upstream.text();
      return res.status(upstream.status).send(errTxt);
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).send(String(e));
  }
}
