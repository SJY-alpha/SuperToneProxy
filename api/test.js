// Vercel Serverless Function for diagnostics

export default function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  // Set CORS headers for the main request
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send a simple success response
  res.status(200).json({ message: '테스트 성공! Vercel 서버가 정상적으로 응답했습니다.' });
}
