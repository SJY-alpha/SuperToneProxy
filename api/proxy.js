// node-fetch v2를 사용해야 Vercel에서 호환성 문제 없이 동작합니다.
// package.json에 "node-fetch": "^2.6.7" 로 명시해주세요.
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // ✨ CORS 허가증(헤더) 설정 ✨
    // 어떤 도메인からの 요청이든 허용합니다 ('*').
    res.setHeader('Access-Control-Allow-Origin', '*');
    // GET, POST 등 지정된 방식의 요청만 허용합니다.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    // 요청에 포함될 수 있는 헤더 종류를 지정합니다.
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 브라우저가 본 요청을 보내기 전에 OPTIONS 메소드로 사전 확인(preflight) 요청을 보냅니다.
    // 이때 200 OK 응답을 보내줘야 본 요청이 정상적으로 진행됩니다.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // --- 기존 프록시 로직 ---
    const { op, voiceId, text, language, style, model, output } = req.query;
    const baseUrl = 'https://api.supertone.io/v1';
    let apiUrl;

    if (op === 'voices') {
        apiUrl = `${baseUrl}/voices`;
    } else if (op === 'tts') {
        apiUrl = `${baseUrl}/tts`;
    } else {
        return res.status(400).json({ error: 'Invalid operation' });
    }

    try {
        const headers = {
            'X-SUPERTONE-API-KEY': process.env.SUPERTONE_API_KEY,
            'Content-Type': 'application/json'
        };

        let response;
        if (op === 'voices') {
            response = await fetch(apiUrl, { method: 'GET', headers: headers });
        } else { // op === 'tts'
            const body = JSON.stringify({ voice_id: voiceId, text, language, style, model, output });
            response = await fetch(apiUrl, { method: 'POST', headers: headers, body: body });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `API Error with status ${response.status}` }));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        
        if (op === 'voices') {
            const data = await response.json();
            res.status(200).json(data);
        } else { // op === 'tts'
            const audioBuffer = await response.arrayBuffer();
            const contentType = response.headers.get('content-type');
            const base64 = Buffer.from(audioBuffer).toString('base64');
            res.status(200).json({ base64, contentType });
        }

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Proxy Server Error', message: error.message });
    }
};
      let data;
      try { data = JSON.parse(text); } catch { data = []; }
      const list = Array.isArray(data) ? data : (Array.isArray(data?.voices) ? data.voices : []);
      const norm = list.map(v => ({
        voice_id: v.voice_id || v.id,
        name: v.name, age: v.age, gender: v.gender,
        language: v.language, styles: v.styles || [], samples: v.samples || []
      })).filter(v => v.voice_id);

      return send(norm);
    }

    if (op === "tts") {
      const { voiceId = "", text = "", language = "ko", style = "neutral", model = "sona_speech_1", output = "mp3" } = req.query || {};
      if (!voiceId) return send({ error: true, message: "missing voiceId" }, 400);

      const r = await fetch(`${SUPERTONE_BASE}/text-to-speech/${encodeURIComponent(voiceId)}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify({ text, language, style, model, output_format: output }),
      });

      const buf = Buffer.from(await r.arrayBuffer());
      const ct = r.headers.get("content-type") || "audio/mpeg";
      const len = r.headers.get("x-audio-length") || null;
      const payload = { status: r.status, contentType: ct, base64: buf.toString("base64"), audioLength: len };

      if (!r.ok) return send({ error: true, message: "tts error", ...payload }, r.status);
      return send(payload);
    }

    return send({ error: true, message: "op not allowed" }, 400);
  } catch (e) {
    return send({ error: true, message: String(e) }, 500);
  }
}
