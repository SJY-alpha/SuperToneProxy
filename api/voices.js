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
    const pageSize = 100; // Load 100 voices per page for efficiency.

    do {
      let targetUrl = `https://supertoneapi.com/v1/voices?page_size=${pageSize}`;
      // If there's a cursor from the previous page, add it to the URL.
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
      
      // Update the cursor for the next loop iteration. If it's null, the loop will end.
      cursor = pageData.next_cursor; 

    } while (cursor); // Continue as long as there is a next_cursor.

    console.log(`Successfully fetched a total of ${allVoices.length} voices.`);
    // Return the complete list of voices.
    return res.status(200).json({ voices: allVoices });

  } catch (error) {
    console.error('Voices proxy internal error:', error);
    return res.status(500).json({ error: `An internal error occurred: ${error.message}` });
  }
}

