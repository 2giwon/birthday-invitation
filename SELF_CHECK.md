# Developer 자체 점검

## SPEC 기능 체크
- [x] F-1: 페이지 레이아웃 및 섹션 구조 — 7개 섹션, 순서, max-width, 중앙정렬, 반응형 (AC-1-1 ~ AC-1-9)
- [x] F-2: 파티 정보 표시 — 모든 텍스트 정확히 표시, 폰트 크기, font-display:swap, lang="ko" (AC-2-1 ~ AC-2-12)
- [x] F-3: 네이버맵 지도 링크 — 2개 링크, href 패턴, target="_blank", rel="noopener noreferrer", 44x44px 터치타겟 (AC-3-1 ~ AC-3-8)
- [x] F-4: OG 메타태그 — og:title, og:description, og:image, og:url, og:type 모두 존재 및 값 검증 (AC-4-1 ~ AC-4-7)
- [x] F-5: 보호자 연락처 + 전화 걸기 — "엄마", 전화번호, tel: 링크, 44x44px 터치타겟 (AC-5-1 ~ AC-5-5)
- [x] F-6: 히어로 이미지 — img 존재, src에 hero 포함, alt 속성, 이미지 파일 존재, 레이아웃 붕괴 방지 (AC-6-1 ~ AC-6-7)
- [x] F-7: 스크롤 애니메이션 — IntersectionObserver, 0.5s duration, prefers-reduced-motion 대응, 미지원 폴백 (AC-7-1 ~ AC-7-5)
- [x] NFR: viewport 메타태그, 320px/1440px 반응형, img alt, lang="ko", favicon, rel="noopener noreferrer"

## 작성한 테스트
- e2e/sections.spec.js — F-1: 레이아웃 및 섹션 구조 (10개)
- e2e/party-info.spec.js — F-2: 파티 정보 표시 (12개)
- e2e/map-links.spec.js — F-3: 네이버맵 지도 링크 (9개)
- e2e/og-meta.spec.js — F-4: OG 메타태그 (7개)
- e2e/contact.spec.js — F-5: 보호자 연락처 (5개)
- e2e/hero-image.spec.js — F-6: 히어로 이미지 (7개)
- e2e/animation.spec.js — F-7: 스크롤 애니메이션 (5개)
- e2e/responsive.spec.js — NFR: 비기능 요구사항 (6개)
- 테스트 파일: 8개
- 테스트 수: 60개 (중복 AC 포함 일부 테스트에서 여러 AC 커버)
- 통과: 60개 / 실패: 0개

## 테스트 실행 명령
```bash
npx playwright test
```

결과:
```
Running 60 tests using 5 workers
60 passed (10.6s)
```

## 알려진 제한사항
- placeholder 이미지는 1x1px 최소 바이너리이다. 실제 이미지로 교체 필요
- og:url이 상대경로 "/"로 설정됨. 배포 시 절대 URL로 변경 필요
- og:image도 상대경로. 배포 시 절대 URL로 변경 필요
- AC-4-9 (카카오 디버거 검증)는 배포 후 수동 검증 필요
- NFR-1-3 (Lighthouse 80점 이상)은 배포 후 검증 필요
- Google Fonts CDN이 cross-origin이라 font-display:swap은 link 태그의 display=swap 파라미터로 검증

## 변경/생성한 파일
- index.html (메인 HTML)
- src/style.css (스타일시트)
- src/main.js (IntersectionObserver 애니메이션)
- playwright.config.js (Playwright 설정)
- e2e/sections.spec.js
- e2e/party-info.spec.js
- e2e/map-links.spec.js
- e2e/og-meta.spec.js
- e2e/contact.spec.js
- e2e/hero-image.spec.js
- e2e/animation.spec.js
- e2e/responsive.spec.js
- public/images/hero.jpg (placeholder)
- public/og-image.png (placeholder)
- public/favicon.ico (placeholder)
- scripts/generate-placeholders.js (이미지 생성 스크립트)
- package.json (Vite + Playwright 의존성)
