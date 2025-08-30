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
    // Start with the first page URL
    let nextUrl = 'https://supertoneapi.com/v1/voices?page_size=100'; 

    // Loop as long as there is a next page URL
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
      
      // Find the array of voices on the current page
      const voicesOnPage = pageData.data || [];
      if(voicesOnPage.length > 0) {
        allVoices = allVoices.concat(voicesOnPage);
      }
      
      // The Supertone API provides the full URL for the next page in the 'next' field.
      // If 'next' is null or doesn't exist, the loop will terminate.
      nextUrl = pageData.next; 

    }

    console.log(`Successfully fetched a total of ${allVoices.length} voices.`);
    // Return the complete list of all voices found
    return res.status(200).json({ voices: allVoices });

  } catch (error) {
    console.error('Voices proxy internal error:', error);
    return res.status(500).json({ error: `An internal error occurred: ${error.message}` });
  }
}

