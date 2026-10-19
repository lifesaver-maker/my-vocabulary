My Vocabulary 3.0 설치 안내

[필수: 먼저 2.0에서 '백업 파일 저장' 실행]

A. GitHub Pages 파일 교체
- site 폴더 안의 5개 파일을 GitHub 저장소 lifesaver-maker/my-vocabulary 의 최상위 위치에 업로드합니다.
- 기존 파일과 동일한 이름으로 덮어씁니다. 다른 파일을 삭제하거나 데이터를 초기화하지 마세요.
- 사이트 주소: https://lifesaver-maker.github.io/my-vocabulary/
- 기존 단어 저장 키(my-vocabulary-v1), 학습 통계/복습 키는 유지합니다.

B. Cloudflare Worker 설정
- https://dash.cloudflare.com 가입/로그인
- Workers & Pages > Create > Worker 만들기
- Worker 코드 편집에서 worker/worker.js 내용으로 교체 후 Deploy
- Worker > Settings > Variables and Secrets > Add > Secret
  이름 OPENAI_API_KEY, 값은 OpenAI API에서 생성한 비밀키
- 배포된 Worker URL(https://...workers.dev)을 복사
- 3.0 앱의 'AI 뜻·예문 자동 생성' 버튼을 처음 누를 때 Worker URL 입력
- 절대로 API 비밀키를 GitHub나 앱의 입력창에 입력하지 마세요.

C. 테스트
- 3.0 앱에서 영어 단어 achieve 입력 > AI 자동 생성 > 한국어 뜻 및 예문 10개 확인 > 단어 저장
- AI 예문 학습 메뉴 > achieve 선택 > 듣기/타이핑/손글씨 학습
- 이전 CSV/JSON 백업, 오답 복습, 플래시카드, 학습 기록도 확인

중요 보안 안내
- Origin/CORS 검사는 API 남용 방지용 사용자 인증이 아닙니다. Worker URL을 알면 직접 요청이 가능할 수 있습니다.
- Cloudflare WAF/Rate Limiting 또는 인증(Cloudflare Access 등)을 별도 설정하고 OpenAI API 사용량/예산 제한을 설정하세요.
- AI 생성 및 API 사용은 별도 과금될 수 있습니다.
- 스마트폰 음성 합성은 기기에 따라 음성 품질과 연속 재생 동작이 달라질 수 있습니다.
