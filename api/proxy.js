const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 1. 클라이언트가 보낸 쿼리 파라미터 가져오기
    const { op, voiceId, text, language, style, model, output } = req.query;

    // 2. Supertone API의 기본 URL
    const baseUrl = 'https://api.supertone.io/v1';
    let apiUrl;

    // 3. 'op' (operation) 값에 따라 API 경로 분기
    if (op === 'voices') {
        apiUrl = `${baseUrl}/voices`;
    } else if (op === 'tts') {
        apiUrl = `${baseUrl}/tts`;
    } else {
        return res.status(400).json({ error: 'Invalid operation' });
    }

    try {
        let response;
        const headers = {
            'X-SUPERTONE-API-KEY': process.env.SUPERTONE_API_KEY, // Vercel 환경 변수 사용
            'Content-Type': 'application/json'
        };

        if (op === 'voices') {
            // 목소리 목록 요청 (GET)
            response = await fetch(apiUrl, {
                method: 'GET',
                headers: headers
            });
        } else { // op === 'tts'
            // TTS 요청 (POST)
            const body = JSON.stringify({
                voice_id: voiceId,
                text: text,
                language: language,
                style: style,
                model: model,
                output: output
            });
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: body
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        
        // 4. 응답 형식에 맞게 클라이언트로 전달
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
};        age: v.age,
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
