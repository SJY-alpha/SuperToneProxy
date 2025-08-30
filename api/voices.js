export default async function handler(req, res) {
  const API_KEY = process.env.SUPERTONE_API_KEY;
  try {
    const response = await fetch("https://supertoneapi.com/v1/voices", {
      headers: { "x-sup-api-key": API_KEY }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

**`api/custom-voices.js` (사용자 정의 음성 목록)**
```javascript
export default async function handler(req, res) {
  const API_KEY = process.env.SUPERTONE_API_KEY;
  try {
    const response = await fetch("https://supertoneapi.com/v1/custom-voices", {
      headers: { "x-sup-api-key": API_KEY }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

**`api/tts/[voiceId].js` (TTS 요청)**
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { voiceId } = req.query;
  const API_KEY = process.env.SUPERTONE_API_KEY;

  try {
    const response = await fetch(`https://supertoneapi.com/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sup-api-key': API_KEY
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
    }
    
    // 오디오 스트림을 클라이언트로 직접 파이핑
    res.setHeader('Content-Type', response.headers.get('content-type'));
    response.body.pipe(res);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

**3. Vercel에 환경변수 설정하기**

1.  Vercel 대시보드에서 프로젝트를 선택합니다.
2.  `Settings` > `Environment Variables` 메뉴로 이동합니다.
3.  `SUPERTONE_API_KEY` 라는 이름으로 변수를 추가하고, 값에는 Supertone 콘솔에서 발급받은 API Key를 입력합니다.

이제 GitHub에 변경사항을 커밋하면 Vercel이 자동으로 프로젝트를 빌드하고 배포합니다. 배포가 완료되면 Vercel에서 제공하는 URL로 접속하여 직접 만든 Voice Player를 사용해볼 수 있습니다.
