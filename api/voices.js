// Vercel Serverless Function to fetch ALL voices from Supertone API, handling pagination.

export default async function handler(req, res) {
  // Handle CORS Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sup-api-key');
    return res.status(200).end();
  }

  // Set CORS headers for the actual request
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!process.env.SUPERTONE_API_KEY) {
    console.error("SUPERTONE_API_KEY is not set.");
    return res.status(500).json({ error: "Server Configuration Error: API key is missing." });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    let allVoices = [];
    let nextUrl = 'https://supertoneapi.com/v1/voices?page_size=100'; // 효율성을 위해 페이지당 100개씩 로드

    // 다음 페이지가 없을 때까지 반복
    while (nextUrl) {
      console.log(`Fetching voices from: ${nextUrl}`);
      const response = await fetch(nextUrl, {
        headers: {
          'x-sup-api-key': process.env.SUPERTONE_API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supertone API Error: ${response.status} ${errorText}`);
      }

      const pageData = await response.json();
      
      const voicesOnPage = pageData.data || pageData.voices || [];
      allVoices = allVoices.concat(voicesOnPage);
      
      // Supertone API는 응답에 다음 페이지 URL을 'next' 필드로 제공합니다.
      nextUrl = pageData.next; 
    }

    console.log(`Successfully fetched a total of ${allVoices.length} voices.`);
    // 전체 목소리 목록을 구조화된 형식으로 반환
    return res.status(200).json({ voices: allVoices });

  } catch (error) {
    console.error('Voices proxy internal error:', error);
    return res.status(500).json({ error: `An internal error occurred: ${error.message}` });
  }
}

