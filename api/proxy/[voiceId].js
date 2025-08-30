// Vercel Serverless Function
// CORS 헤더는 vercel.json에서 전역으로 처리하므로 여기서는 제거합니다.

export default async function handler(req, res) {
  // URL 경로에서 동적 voiceId를 추출합니다.
  const { voiceId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!voiceId) {
    return res.status(400).json({ error: 'Voice ID is required in the URL path.' });
  }

  try {
    const upstreamResponse = await fetch(`https://api.supertoneapi.com/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'x-sup-api-key': process.env.SUPERTONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return res.status(upstreamResponse.status).send(errorText);
    }
    
    // Supertone API로부터 받은 오디오 데이터를 Buffer로 변환합니다.
    const audioBuffer = Buffer.from(await upstreamResponse.arrayBuffer());

    // 응답 헤더를 설정하고 오디오 데이터를 클라이언트에 전송합니다.
    res.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'audio/wav');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);

  } catch (error) {
    console.error('TTS proxy error:', error);
    return res.status(500).json({ error: 'Proxy fetch failed' });
  }
}

