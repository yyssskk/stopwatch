# 아 줴줴이야 — 금요일 퇴근 쇼츠

30초 세로 쇼츠(1080×1920). 점묘화 스타일 키네틱 타이포와 트럼펫 비트를 모두 코드로 만들었습니다. [HyperFrames](https://github.com/heygen-com/hyperframes)로 렌더링합니다.

저장소에는 소스만 있습니다. 영상(`*.mp4`)과 음악(`assets/music.wav`)은 아래 명령으로 다시 만듭니다.

- `index.html` — 캔버스 점묘화 + 키네틱 타이포 (`CUES` 목록에서 문구·타이밍·색 수정)
- `tools/music.cjs` — 트럼펫 비트 합성 스크립트

## 렌더링

필요한 것: Node.js 22+, FFmpeg, Chrome

1. 글꼴: 라이선스 때문에 저장소에 넣지 않았습니다. Windows의 `C:\Windows\Fonts\malgunbd.ttf`를 `assets/fonts/`에 복사합니다.
2. 음악 생성:

   ```bash
   node tools/music.cjs assets/music.wav
   ```

3. 영상 렌더링:

   ```bash
   npx hyperframes render --output jujuya.mp4
   ```
