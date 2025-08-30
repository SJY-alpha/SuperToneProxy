// Vercel Serverless Function to proxy voice list requests, with corrected search handling.

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
  
  // Vercel automatically parses query parameters into req.query. We use this object.
  const queryParams = req.query;
  
  const baseUrl = 'https://supertoneapi.com/v1/voices';
  let targetUrl = baseUrl;

  // If there are any query parameters from the client, use the /search endpoint.
  if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams);
      targetUrl = `${baseUrl}/search?${searchParams.toString()}`;
  }
  
  console.log(`Forwarding request to: ${targetUrl}`);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        'x-sup-api-key': process.env.SUPERTONE_API_KEY,
      },
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      console.error(`Error from Supertone API: ${upstreamResponse.status} ${errorText}`);
      return res.status(upstreamResponse.status).send(errorText);
    }
    
    const data = await upstreamResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Voices proxy internal error:', error);
    return res.status(500).json({ error: 'An internal error occurred in the proxy server.' });
  }
}

