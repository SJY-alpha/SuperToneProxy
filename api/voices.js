// Vercel Serverless Function

export default async function handler(req, res) {
  // 1. Vercel 환경 변수에 API 키가 설정되어 있는지 먼저 확인합니다.
  if (!process.env.SUPERTONE_API_KEY) {
    console.error("SUPERTONE_API_KEY is not set in Vercel environment variables.");
    // 만약 키가 없다면, 클라이언트에 명확한 에러 메시지를 보냅니다.
    return res.status(500).json({ error: "서버 설정 오류: API 키가 누락되었습니다. Vercel 대시보드에서 환경 변수를 확인하세요." });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const upstreamResponse = await fetch('https://api.supertoneapi.com/v1/voices', {
      headers: {
        'x-sup-api-key': process.env.SUPERTONE_API_KEY,
      },
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      // Supertone API로부터 받은 에러를 그대로 전달합니다.
      return res.status(upstreamResponse.status).send(errorText);
    }
    
    const data = await upstreamResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Voices proxy error:', error);
    return res.status(500).json({ error: '프록시 서버 내부 오류가 발생했습니다.' });
  }
}

