// api/proxy.js
export default async function handler(req, res) {
  const SUPERTONE_BASE = "https://api.supertoneapi.com/v1";
  const key = process.env.SUPERTONE_API_KEY;
  const { op = "", callback } = req.query || {};

  const jsonp = (data, status = 200) => {
    const body = callback ? `${callback}(${JSON.stringify(data)});` : JSON.stringify(data);
    res.status(status);
    res.setHeader("Content-Type", callback ? "application/javascript; charset=utf-8" : "application/json; charset=utf-8");
    res.send(body);
  };

  if (!key) return jsonp({ error: true, message: "missing SUPERTONE_API_KEY" }, 500);

  const headers = {
    "Authorization": `Bearer ${key}`,
    "x-sup-api-key": key,
    "Accept": "application/json"
  };

  try {
    if (op === "ping") return jsonp({ ok: true });

    if (op === "voices") {
      const r = await fetch(`${SUPERTONE_BASE}/voices`, { headers });
      const text = await r.text();
      if (!r.ok) return jsonp({ error: true, message: text || "voices error" }, r.status);

      // 응답 정규화: 배열만 내려주기
      let data;
      try { data = JSON.parse(text); } catch { data = []; }
      let list = Array.isArray(data) ? data : (Array.isArray(data?.voices) ? data.voices : []);
      const norm = list.map(v => ({
        voice_id: v.voice_id || v.id,
        name: v.name,
        age: v.age,
        gender: v.gender,
        language: v.language,
        styles: v.styles || [],
        samples: v.samples || []
      })).filter(v => v.voice_id);

      return jsonp(norm);
    }

    if (op === "tts") {
      const { voiceId = "", text = "", language = "ko", style = "neutral", model = "sona_speech_1", output = "mp3" } = req.query || {};
      if (!voiceId) return jsonp({ error: true, message: "missing voiceId" }, 400);

      const r = await fetch(`${SUPERTONE_BASE}/text-to-speech/${encodeURIComponent(voiceId)}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json", "Accept": "*/*" },
        body: JSON.stringify({ text, language, style, model, output_format: output })
      });

      const buf = Buffer.from(await r.arrayBuffer());
      const ct = r.headers.get("content-type") || "audio/mpeg";
      const len = r.headers.get("x-audio-length") || null;
      const payload = { status: r.status, contentType: ct, base64: buf.toString("base64"), audioLength: len };

      if (!r.ok) return jsonp({ error: true, message: "tts error", ...payload }, r.status);
      return jsonp(payload);
    }

    return jsonp({ error: true, message: "op not allowed" }, 400);
  } catch (e) {
    return jsonp({ error: true, message: String(e) }, 500);
  }
}
