// Vercel Serverless Function
export default async function handler(req, res) {
  // CORS Preflight 요청 및 헤더를 명시적으로 처리
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 도메인에서의 요청을 허용
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 브라우저가 보내는 예비 요청(OPTIONS)에 즉시 200 (OK)로 응답하여 통신을 허가
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- 기존의 핵심 로직 ---
  const { voiceId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const upstreamResponse = await fetch(`https://supertoneapi.com/v1/text-to-speech/${voiceId}`, {
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

    const audioBuffer = await upstreamResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/wav');
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('TTS proxy error:', error);
    return res.status(500).json({ error: '프록시 서버 내부 오류가 발생했습니다.' });
  }
}

