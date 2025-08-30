// Vercel Serverless Function

export default async function handler(req, res) {
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
