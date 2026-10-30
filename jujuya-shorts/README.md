# 아 줴줴이야 — 금요일 퇴근 쇼츠

30초 세로 쇼츠(1080×1920). 점묘화 스타일 키네틱 타이포와 트럼펫 비트를 모두 코드로 만들었습니다. [HyperFrames](https://github.com/heygen-com/hyperframes)로 렌더링합니다.

저장소에는 소스만 있습니다. 영상(`*.mp4`)과 음악(`assets/music.wav`)은 아래 명령으로 다시 만듭니다.

- `player.html` — **브라우저에서 바로 보는 플레이어** (음악도 브라우저에서 합성)
- `index.html` — 캔버스 점묘화 + 키네틱 타이포 (`CUES` 목록에서 문구·타이밍·색 수정)
- `tools/synth.js` — 트럼펫 비트 합성 (플레이어와 `music.cjs`가 같이 사용)
- `tools/music.cjs` — 합성한 음악을 WAV 파일로 저장

## 브라우저에서 보기

`player.html`은 웹 서버로 열어야 합니다(파일을 더블클릭하면 브라우저 보안 정책 때문에 동작하지 않음).

- GitHub Pages: 저장소 Settings → Pages → `main` 브랜치를 켜면 `https://yyssskk.github.io/stopwatch/jujuya-shorts/player.html`
- 로컬: 이 폴더에서 `python -m http.server` 실행 후 `http://localhost:8000/player.html`

한글은 시스템 글꼴(Windows 맑은 고딕, Mac Apple SD Gothic Neo)로 표시됩니다.

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
