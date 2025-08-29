export default async function handler(req, res) {
  const { op, voiceId, text, language = "ko", style = "neutral", model = "sona_speech_1", output = "mp3", callback } = req.query;
  const API_KEY = process.env.SUPERTONE_API_KEY;

  const jsonp = (data) => {
    if (callback) {
      res.setHeader("Content-Type", "application/javascript");
      res.status(200).send(`${callback}(${JSON.stringify(data)});`);
    } else {
      res.status(200).json(data);
    }
  };

  try {
    if (op === "ping") {
      return jsonp({ ok: true });
    }

    if (op === "voices") {
      const r = await fetch("https://api.supertone.ai/v1/voices", {
        headers: {
          "authorization": `Bearer ${API_KEY}`,
          "x-sup-api-key": API_KEY,
          "accept": "application/json"
        }
      });
      const data = await r.json();
      return jsonp(data.voices || []);
    }

    if (op === "tts") {
      if (!voiceId) return jsonp({ error: true, message: "missing voiceId" });

      const body = { text, language, style, model, output_format: output };

      const r = await fetch(`https://api.supertone.ai/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${API_KEY}`,
          "x-sup-api-key": API_KEY,
          "accept": "*/*"
        },
        body: JSON.stringify(body)
      });

      const buf = Buffer.from(await r.arrayBuffer());
      const b64 = buf.toString("base64");
      const ct = r.headers.get("content-type") || "audio/mpeg";

      return jsonp({ status: r.status, contentType: ct, base64: b64 });
    }

    return jsonp({ error: true, message: "op not allowed" });
  } catch (e) {
    return jsonp({ error: true, message: String(e) });
  }
}
