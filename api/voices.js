// Vercel Serverless Function

export default async function handler(req, res) {
  if (!process.env.SUPERTONE_API_KEY) {
    console.error("SUPERTONE_API_KEY is not set in Vercel environment variables.");
    return res.status(500).json({ error: "서버 설정 오류: API 키가 누락되었습니다. Vercel 대시보드에서 환경 변수를 확인하세요." });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const upstreamResponse = await fetch('https://supertoneapi.com/v1/voices', {
      headers: {
        'x-sup-api-key': process.env.SUPERTONE_API_KEY,
      },
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return res.status(upstreamResponse.status).send(errorText);
    }
    
    const data = await upstreamResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Voices proxy error:', error);
    return res.status(500).json({ error: '프록시 서버 내부 오류가 발생했습니다.' });
  }
}
