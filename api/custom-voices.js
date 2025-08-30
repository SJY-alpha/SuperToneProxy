// 이 파일은 Vercel 프로젝트의 /api/custom-voices.js 경로에 위치해야 합니다.
export default async function handler(req, res) {
  const API_KEY = process.env.SUPERTONE_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ message: 'API key is not configured on the server.' });
  }

  const { cursor } = req.query;

  try {
    const url = new URL("https://supertoneapi.com/v1/custom-voices");
    
    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }
    
    const response = await fetch(url.toString(), {
      headers: { "x-sup-api-key": API_KEY }
    });

    const data = await response.json();

    if (!response.ok) {
        return res.status(response.status).json(data);
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Error in /api/custom-voices proxy:", error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}

