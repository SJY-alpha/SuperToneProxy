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
  if (!process.env.SUPERTONE_API_KEY) {
    return res.status(500).json({ error: "서버 설정 오류: API 키가 누락되었습니다." });
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

