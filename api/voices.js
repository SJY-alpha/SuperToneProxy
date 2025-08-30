// Vercel Serverless Function
// CORS 헤더는 vercel.json에서 전역으로 처리하므로 여기서는 제거합니다.

export default async function handler(req, res) {
  // OPTIONS 요청은 vercel.json이 자동으로 처리합니다.
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
      // Supertone API의 상태 코드와 에러 메시지를 그대로 클라이언트에 전달
      return res.status(upstreamResponse.status).send(errorText);
    }

    const data = await upstreamResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Voices proxy error:', error);
    return res.status(500).json({ error: 'Proxy fetch failed' });
  }
}

