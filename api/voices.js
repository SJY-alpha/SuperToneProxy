// 이 파일은 Vercel 프로젝트의 /api/voices.js 경로에 위치해야 합니다.
// 프론트엔드에서 페이지네이션을 위한 'cursor' 값을 받아서 Supertone API로 전달하는 기능이 추가되었습니다.

export default async function handler(req, res) {
  const API_KEY = process.env.SUPERTONE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ message: 'API key is not configured on the server.' });
  }

  // 프론트엔드에서 보낸 cursor 쿼리 파라미터를 가져옵니다.
  const { cursor } = req.query; 

  try {
    const url = new URL("https://supertoneapi.com/v1/voices");
    
    // cursor 값이 있으면 URL에 추가합니다.
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
    console.error("Error in /api/voices proxy:", error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
