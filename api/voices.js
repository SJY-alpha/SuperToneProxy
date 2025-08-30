// Vercel Serverless Function to fetch ALL voices from Supertone API, handling pagination correctly.

export default async function handler(req, res) {
  // Handle CORS Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sup-api-key');
    return res.status(200).end();
  }

  // Set CORS headers for the actual request
  res.setHeader('Access-control-allow-origin', '*');

  if (!process.env.SUPERTONE_API_KEY) {
    console.error("SUPERTONE_API_KEY is not set.");
    return res.status(500).json({ error: "Server Configuration Error: API key is missing." });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    let allVoices = [];
    // Supertone API's pagination system uses a 'cursor' to get the next page.
    let cursor = null; 
    const pageSize = 100; // 효율성을 위해 페이지당 100개씩 로드

    do {
      let targetUrl = `https://supertoneapi.com/v1/voices?page_size=${pageSize}`;
      // 이전 페이지에서 커서가 있으면 URL에 추가합니다.
      if (cursor) {
        targetUrl += `&cursor=${cursor}`;
      }
      
      console.log(`Fetching voices from: ${targetUrl}`);
      const response = await fetch(targetUrl, {
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
      if(voicesOnPage.length > 0) {
        allVoices = allVoices.concat(voicesOnPage);
      }
      
      // 다음 반복을 위해 커서를 업데이트합니다. null이면 루프가 종료됩니다.
      cursor = pageData.next_cursor; 

    } while (cursor); // next_cursor가 있는 동안 계속합니다.

    console.log(`Successfully fetched a total of ${allVoices.length} voices.`);
    // 전체 목소리 목록을 반환합니다.
    return res.status(200).json({ voices: allVoices });

  } catch (error) {
    console.error('Voices proxy internal error:', error);
    return res.status(500).json({ error: `An internal error occurred: ${error.message}` });
  }
}

