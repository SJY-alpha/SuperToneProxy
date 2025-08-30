// Vercel Serverless Function
// POST /api/proxy/[voiceId]

export default async function handler(req, res) {
    // 1. CORS 헤더 설정 (기존과 동일)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        // 2. (핵심 수정) URL 경로에서 voiceId 추출
        const { voiceId } = req.query;
        
        // 3. (핵심 수정) 요청 본문(body)에서는 text 등 나머지 정보만 추출
        const { text, language = "ko", style = "neutral", model = "sona_speech_1" } = req.body;

        if (!text || !voiceId) {
            return res.status(400).send("text and voiceId are required");
        }
        
        // 4. Supertone API 최종 URL 조립
        const supertoneApiUrl = `https://api.supertoneapi.com/v1/text-to-speech/${voiceId}`;
        
        // 5. Supertone API로 요청 전달
        const upstreamResponse = await fetch(supertoneApiUrl, {
            method: "POST",
            headers: {
                "x-sup-api-key": process.env.SUPERTONE_API_KEY,
                "Content-Type": "application/json",
            },
            // 6. (핵심 수정) body에는 voice_id를 제외한 정보만 포함
            body: JSON.stringify({ text, language, style, model }),
        });

        // 7. Supertone API의 응답을 클라이언트로 그대로 전달
        if (!upstreamResponse.ok) {
            const errorText = await upstreamResponse.text();
            return res.status(upstreamResponse.status).send(errorText);
        }

        const audioBuffer = await upstreamResponse.arrayBuffer();
        
        res.setHeader("Content-Type", upstreamResponse.headers.get("content-type") || "audio/wav");
        res.status(200).send(Buffer.from(audioBuffer));

    } catch (e) {
        console.error("TTS proxy error:", e);
        res.status(500).send("Proxy fetch failed");
    }
}
