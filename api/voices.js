// Vercel Serverless Function to fetch a large, single page of voices from Supertone API.
// This avoids pagination errors by requesting up to 100 voices at once.

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
    // Request a single page with a large number of items (up to 100 is a safe max).
    const pageSize = 100;
    const targetUrl = `https://supertoneapi.com/v1/voices?page_size=${pageSize}`;
    
    console.log(`Fetching a single page of voices from: ${targetUrl}`);
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
    
    // Forward the entire successful response to the client.
    return res.status(200).json(pageData);

  } catch (error) {
    console.error('Voices proxy internal error:', error);
    return res.status(500).json({ error: `An internal error occurred: ${error.message}` });
  }
}

