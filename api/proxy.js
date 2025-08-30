export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { text, voice_id, language="ko", style="neutral", model="sona_speech_1" } = req.body || {};
    if (!text || !voice_id) return res.status(400).send("text and voice_id required");

    const resp = await fetch(`https://api.supertoneapi.com/v1/text-to-speech/${voice_id}`, {
      method: "POST",
      headers: {
        "x-sup-api-key": process.env.SUPERTONE_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, language, style, model })
    });

    if (!resp.ok) return res.status(resp.status).send(await resp.text());
    const buf = Buffer.from(await resp.arrayBuffer());
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buf);
  } catch (e) {
    console.error("tts proxy error:", e);
    return res.status(500).send("proxy fetch failed");
  }
}    const arrayBuf = await upstream.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(arrayBuf));
  } catch (e) {
    return res.status(500).send(String(e));
  }
}
