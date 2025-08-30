// Vercel Serverless Function
// GET /api/voices

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "GET") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        const upstreamResponse = await fetch("https://api.supertoneapi.com/v1/voices", {
            headers: {
                "x-sup-api-key": process.env.SUPERTONE_API_KEY,
            },
        });
        
        if (!upstreamResponse.ok) {
            const errorText = await upstreamResponse.text();
            return res.status(upstreamResponse.status).send(errorText);
        }

        const data = await upstreamResponse.json();
        return res.status(200).json(data);

    } catch (e) {
        console.error("Voices proxy error:", e);
        res.status(500).send("Proxy fetch failed");
    }
}
