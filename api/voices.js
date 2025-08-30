// 이 파일은 Vercel 프로젝트의 /api/voices.js 경로에 위치해야 합니다.
export default async function handler(req, res) {
  const API_KEY = process.env.SUPERTONE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ message: 'API key is not configured on the server. Please set SUPERTONE_API_KEY in Vercel environment variables.' });
  }

  const { cursor } = req.query; 

  try {
    // [수정] API 문서를 기반으로 엔드포인트를 /voices/search 로 변경합니다.
    const url = new URL("https://supertoneapi.com/v1/voices/search");
    
    // 페이지네이션을 위한 cursor 파라미터는 그대로 사용합니다.
    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    const response = await fetch(url.toString(), {
      headers: { "x-sup-api-key": API_KEY }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        // Supertone API에서 온 오류를 그대로 클라이언트에 전달
        return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);

  } catch (error) {
    console.error("Error in /api/voices proxy:", error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}

