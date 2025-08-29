// Node.js Serverless Function
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { text, voice } = req.body || {};
    if (!text || !voice) return res.status(400).send("text and voice required");

    const apiKey = process.env.SUPERTONE_API_KEY;
    if (!apiKey) return res.status(500).send("SUPERTONE_API_KEY missing");

    // 예: Supertone TTS API 엔드포인트 가정
    const upstream = await fetch("https://api.supertone.ai/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        voice_id: voice,   // 필요에 맞게 필드명 조정
        format: "mp3"
      })
    });

    if (!upstream.ok) {
      const errTxt = await upstream.text();
      return res.status(upstream.status).send(errTxt);
    }

    const arrayBuf = await upstream.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(arrayBuf));
  } catch (e) {
    return res.status(500).send(String(e));
  }
}
