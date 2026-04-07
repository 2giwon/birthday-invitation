# 이지호 생일 초대장 웹페이지 SPEC

## 개요

2026년 4월 11일 이지호 학생의 생일 파티 디지털 초대장이다. 카카오톡으로 URL을 공유하면 모바일에서 파티 정보(일시, 장소, 집합, 준비물)를 한 눈에 확인할 수 있는 단일 정적 웹페이지를 구현한다. Vite + vanilla HTML/CSS/JS로 구성하며 Vercel에 배포한다.

## 영향 범위

### 수정할 파일

없음 (새 프로젝트)

### 생성할 파일

```
birthday-invitation/
├── index.html                # 메인 HTML (Vite 엔트리)
├── public/
│   ├── images/
│   │   └── hero.jpg         # 히어로 이미지 (480x320px, JPG, 500KB 이하)
│   ├── og-image.png         # OG 썸네일 이미지 (1200x630px, 300KB 이하)
│   └── favicon.ico          # 파비콘 (생일 테마)
├── src/
│   ├── style.css             # 전체 스타일시트
│   └── main.js               # 스크롤 애니메이션 JS
├── package.json
├── vite.config.js
├── vercel.json               # Vercel 배포 설정 (필요 시)
├── e2e/
│   └── invitation.spec.js   # Playwright e2e 테스트
├── playwright.config.js      # Playwright 설정
└── SPEC.md
```

### 영향받는 기존 기능

없음 (새 프로젝트)

---

## 확정 데이터

테스트에서 검증할 정확한 텍스트와 값을 여기에 정의한다. 구현과 테스트 모두 이 데이터를 기준으로 한다.

| 키 | 값 |
|---|---|
| 파티 날짜 | 2026년 4월 11일 (금) |
| 파티 시간 | 오후 2시 |
| 파티 장소명 | 원마운트 1층 |
| 파티 주소 | 경기 고양시 일산서구 한류월드로 300 |
| 집합 시간 | 오후 1시 |
| 집합 장소 설명 | 지호네 집 앞 (코오롱오투빌2차 아파트 앞) |
| 집합 주소 | 서울시 강서구 양천로 62길 41 |
| 준비물 | 미끄럼 방지용 양말 |
| 보호자 레이블 | 엄마 |
| 보호자 연락처 | 010-9921-3109 |
| 인사말 | 지호의 생일에 함께해 주세요! |
| OG 제목 | 이지호의 생일 파티에 초대합니다! |
| OG 설명 | 4월 11일(금) 오후 2시, 원마운트에서 만나요! |
| 집합 장소 네이버맵 URL | `https://map.naver.com/v5/search/서울시 강서구 양천로 62길 41` |
| 파티 장소 네이버맵 URL | `https://map.naver.com/v5/search/경기 고양시 일산서구 한류월드로 300 원마운트` |
| 전화 링크 | `tel:010-9921-3109` |

---

## 기능 목록

### F-1: 페이지 레이아웃 및 섹션 구조 (Must)

- **설명**: 모바일 청첩장 스타일의 세로 스크롤 단일 페이지. 7개 섹션을 정해진 순서로 배치한다.
- **사용자 스토리**: 초대받은 친구/부모님이 카카오톡 링크를 탭하면 세로 스크롤로 파티 정보를 순서대로 확인할 수 있다.

**섹션 순서 (data-section 속성으로 식별):**

| 순서 | 섹션 | data-section 값 |
|------|------|----------------|
| 1 | 히어로 섹션 | `hero` |
| 2 | 인사말 섹션 | `greeting` |
| 3 | 일시 섹션 | `datetime` |
| 4 | 집합 안내 섹션 | `gathering` |
| 5 | 파티 장소 섹션 | `venue` |
| 6 | 준비물 섹션 | `supplies` |
| 7 | 연락처/푸터 섹션 | `contact` |

**수용 기준 (정상):**
- [ ] AC-1-1: `[data-section]` 속성을 가진 요소가 정확히 7개 존재한다
- [ ] AC-1-2: 7개 섹션이 hero, greeting, datetime, gathering, venue, supplies, contact 순서로 DOM에 배치된다
- [ ] AC-1-3: 페이지 컨테이너의 max-width가 480px이다
- [ ] AC-1-4: 페이지 컨테이너가 화면 중앙에 정렬된다 (margin auto)
- [ ] AC-1-5: 섹션별로 시각적 구분이 있다 (배경색 또는 카드 형태)
- [ ] AC-1-6: 320px 뷰포트에서 가로 스크롤바가 발생하지 않는다
- [ ] AC-1-7: 320px 뷰포트에서 텍스트가 컨테이너를 overflow하지 않는다

**수용 기준 (비정상):**
- [ ] AC-1-8: 뷰포트 1024px에서 컨테이너 너비가 480px을 초과하지 않는다
- [ ] AC-1-9: 뷰포트 1440px 데스크톱에서 레이아웃이 깨지지 않고 중앙 정렬된다

**테스트 방법 (Playwright):**
- 각 `[data-section]` 요소의 존재와 순서를 `querySelectorAll`로 검증
- 컨테이너의 computed max-width 확인
- `setViewportSize(320, 568)` 후 `document.documentElement.scrollWidth <= 320` 검증
- `setViewportSize(1024, 768)` 후 컨테이너 `offsetWidth <= 480` 검증

---

### F-2: 파티 정보 표시 (Must)

- **설명**: 각 섹션에 확정된 파티 정보를 정확하게 표시한다.
- **사용자 스토리**: 초대받은 사람이 파티의 일시, 장소, 집합 정보, 준비물을 텍스트로 정확히 확인할 수 있다.

**수용 기준 (정상):**
- [ ] AC-2-1: `[data-section="datetime"]` 내에 "2026년 4월 11일" 텍스트가 포함된다
- [ ] AC-2-2: `[data-section="datetime"]` 내에 "오후 2시" 텍스트가 포함된다
- [ ] AC-2-3: `[data-section="gathering"]` 내에 "오후 1시" 텍스트가 포함된다
- [ ] AC-2-4: `[data-section="gathering"]` 내에 "서울시 강서구 양천로 62길 41" 텍스트가 포함된다
- [ ] AC-2-5: `[data-section="venue"]` 내에 "원마운트 1층" 텍스트가 포함된다
- [ ] AC-2-6: `[data-section="venue"]` 내에 "경기 고양시 일산서구 한류월드로 300" 텍스트가 포함된다
- [ ] AC-2-7: `[data-section="supplies"]` 내에 "미끄럼 방지용 양말" 텍스트가 포함된다
- [ ] AC-2-8: `[data-section="greeting"]` 내에 "지호의 생일에 함께해 주세요!" 텍스트가 포함된다
- [ ] AC-2-9: 본문 텍스트의 computed font-size가 최소 16px이다
- [ ] AC-2-10: 보조 텍스트(주소/캡션)의 font-size가 최소 14px이다

**수용 기준 (비정상):**
- [ ] AC-2-11: CSS에 font-display: swap이 선언되어 웹폰트 로딩 실패 시 시스템 폰트로 폴백된다
- [ ] AC-2-12: HTML의 lang 속성이 "ko"이다

**테스트 방법 (Playwright):**
- 각 섹션 셀렉터의 `textContent`에 정확한 텍스트가 포함되는지 검증
- `window.getComputedStyle()`로 font-size 값 검증
- CSS 파일 내용에서 `font-display: swap` 존재 여부 검증

---

### F-3: 네이버맵 지도 링크 (Must)

- **설명**: 집합 장소와 파티 장소 각각에 네이버맵 웹 링크 버튼을 제공한다.
- **사용자 스토리**: 친구 부모님이 집합 장소/파티 장소의 "지도 보기" 버튼을 탭하면 네이버맵에서 위치를 확인할 수 있다.

**수용 기준 (정상):**
- [ ] AC-3-1: `[data-section="gathering"]` 내에 "지도 보기" 텍스트를 포함하는 `<a>` 태그가 존재한다
- [ ] AC-3-2: 집합 장소 지도 링크의 href가 `https://map.naver.com/v5/search/`로 시작한다
- [ ] AC-3-3: `[data-section="venue"]` 내에 "지도 보기" 텍스트를 포함하는 `<a>` 태그가 존재한다
- [ ] AC-3-4: 파티 장소 지도 링크의 href가 `https://map.naver.com/v5/search/`로 시작한다
- [ ] AC-3-5: 페이지 전체에서 `https://map.naver.com/v5/search/`로 시작하는 href를 가진 `<a>` 태그가 정확히 2개 존재한다
- [ ] AC-3-6: 지도 링크 버튼의 클릭 가능 영역이 최소 44x44px이다

**수용 기준 (비정상):**
- [ ] AC-3-7: 지도 링크가 `nmap://`이 아닌 `https://` 프로토콜을 사용한다 (앱 딥링크 아님, 앱 미설치 시에도 동작 보장)
- [ ] AC-3-8: 지도 링크에 `target="_blank"` 또는 동등한 속성이 있어 현재 페이지를 벗어나지 않는다

**테스트 방법 (Playwright):**
- `locator('[data-section="gathering"] a')` / `locator('[data-section="venue"] a')` 로 링크 존재 검증
- `getAttribute('href')`로 URL 패턴 검증
- `boundingBox()`로 버튼 크기 최소 44x44px 검증

---

### F-4: OG 메타태그 - 카카오톡 미리보기 (Must)

- **설명**: 카카오톡에 URL 공유 시 미리보기(제목, 설명, 썸네일)가 정상 표시되도록 OG 메타태그를 설정한다.
- **사용자 스토리**: 보호자(엄마)가 카카오톡에 URL을 붙여넣기하면 "이지호의 생일 파티에 초대합니다!" 제목과 썸네일이 미리보기로 나타난다.

**OG 메타태그 정확한 값:**
```html
<meta property="og:title" content="이지호의 생일 파티에 초대합니다!" />
<meta property="og:description" content="4월 11일(금) 오후 2시, 원마운트에서 만나요!" />
<meta property="og:image" content="{배포URL}/og-image.png" />
<meta property="og:url" content="{배포URL}" />
<meta property="og:type" content="website" />
```

**수용 기준 (정상):**
- [ ] AC-4-1: `<head>` 내에 `<meta property="og:title">` 태그가 존재하고 content가 "이지호의 생일 파티에 초대합니다!"이다
- [ ] AC-4-2: `<head>` 내에 `<meta property="og:description">` 태그가 존재하고 content가 "4월 11일(금) 오후 2시, 원마운트에서 만나요!"이다
- [ ] AC-4-3: `<head>` 내에 `<meta property="og:image">` 태그가 존재하고 content가 비어있지 않다
- [ ] AC-4-4: `<head>` 내에 `<meta property="og:url">` 태그가 존재한다
- [ ] AC-4-5: `<head>` 내에 `<meta property="og:type" content="website">` 태그가 존재한다
- [ ] AC-4-6: `public/og-image.png` 파일이 존재한다

**수용 기준 (비정상):**
- [ ] AC-4-7: og:image가 참조하는 이미지 경로에 실제 파일이 존재한다 (404 아님)
- [ ] AC-4-8: og:title과 og:description이 있으므로 이미지 로딩 실패 시에도 텍스트 미리보기는 가능하다

**수용 기준 (배포 후 수동 검증):**
- [ ] AC-4-9: 카카오 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 OG 캐시 초기화 후 미리보기가 정상 표시된다

**테스트 방법 (Playwright):**
- `locator('meta[property="og:title"]').getAttribute('content')` 값 검증
- 나머지 OG 태그도 동일 패턴으로 검증
- `/og-image.png` 경로에 HTTP GET 요청하여 200 응답 확인

---

### F-5: 보호자 연락처 + 전화 걸기 (Should)

- **설명**: 페이지 하단 연락처/푸터 섹션에 보호자 연락처와 전화 걸기 기능을 제공한다.
- **사용자 스토리**: 친구 부모님이 보호자에게 연락이 필요할 때 전화 걸기 버튼을 탭하여 바로 전화할 수 있다.

**수용 기준 (정상):**
- [ ] AC-5-1: `[data-section="contact"]` 내에 "엄마" 텍스트가 포함된다
- [ ] AC-5-2: `[data-section="contact"]` 내에 "010-9921-3109" 텍스트가 포함된다
- [ ] AC-5-3: `href="tel:010-9921-3109"` 속성을 가진 `<a>` 태그가 존재한다
- [ ] AC-5-4: 전화 걸기 링크/버튼의 클릭 가능 영역이 최소 44x44px이다

**수용 기준 (비정상):**
- [ ] AC-5-5: 전화 걸기를 지원하지 않는 환경(데스크톱)에서도 연락처 번호가 텍스트로 표시되어 확인 가능하다

**테스트 방법 (Playwright):**
- `locator('[data-section="contact"]')` 의 textContent에 "엄마", "010-9921-3109" 포함 여부
- `locator('a[href="tel:010-9921-3109"]')` 존재 여부
- `boundingBox()`로 터치 타겟 크기 검증

---

### F-6: 히어로 이미지 (Should)

- **설명**: 초대장 상단 히어로 섹션에 이미지를 표시한다. 현재는 생일 테마 기본 이미지를 사용하고, 추후 실제 사진으로 교체 가능하게 한다.
- **사용자 스토리**: 초대장을 열면 상단에 생일 테마 이미지가 보여 축하 분위기를 느낄 수 있다.

**수용 기준 (정상):**
- [ ] AC-6-1: `[data-section="hero"]` 내에 `<img>` 태그가 존재한다
- [ ] AC-6-2: 히어로 이미지의 src 경로에 `hero` 키워드가 포함된다 (파일명으로 식별 가능)
- [ ] AC-6-3: 히어로 이미지에 alt 속성이 존재하고 비어있지 않다
- [ ] AC-6-4: 히어로 이미지가 컨테이너 너비(최대 480px)에 맞게 표시된다 (가로 잘림 없음)
- [ ] AC-6-5: `public/images/hero.jpg` 파일이 존재한다

**수용 기준 (비정상):**
- [ ] AC-6-6: 이미지 로딩 실패 시 alt 텍스트가 표시되어야 하므로 alt 값이 의미 있는 텍스트이다 (빈 문자열이 아님)
- [ ] AC-6-7: 이미지 로딩 실패 시에도 히어로 섹션의 레이아웃이 유지된다 (다음 섹션이 정상 위치에 표시됨)

**테스트 방법 (Playwright):**
- `locator('[data-section="hero"] img')` 존재 확인
- `getAttribute('alt')`가 비어있지 않은 문자열인지 검증
- 이미지 src를 잘못된 경로로 변경 후에도 greeting 섹션이 정상 위치에 렌더링되는지 검증 (레이아웃 붕괴 방지)

---

### F-7: 스크롤 애니메이션 (Could)

- **설명**: 각 섹션이 스크롤에 따라 부드럽게 나타나는 fade-in 애니메이션을 적용한다.
- **사용자 스토리**: 초대장을 스크롤할 때 각 섹션이 자연스럽게 나타나면서 세련된 느낌을 받는다.

**수용 기준 (정상):**
- [ ] AC-7-1: JavaScript에서 IntersectionObserver를 사용하여 섹션 진입 시 fade-in 클래스를 추가한다
- [ ] AC-7-2: fade-in 애니메이션의 duration이 0.3s ~ 0.6s 범위이다 (CSS에서 확인)
- [ ] AC-7-3: 초기 상태에서 히어로 섹션 아래의 섹션들은 opacity가 0이다 (뷰포트 밖)

**수용 기준 (비정상):**
- [ ] AC-7-4: `prefers-reduced-motion: reduce` 미디어 쿼리가 CSS에 존재하여, 해당 설정 시 애니메이션이 비활성화된다
- [ ] AC-7-5: IntersectionObserver 미지원 시 모든 섹션이 즉시 표시된다 (opacity: 1, 빈 화면 방지)

**테스트 방법 (Playwright):**
- CSS 파일 내에 `prefers-reduced-motion` 미디어 쿼리 존재 확인
- `main.js` 내에 `IntersectionObserver` 사용 확인
- `emulateMedia({ reducedMotion: 'reduce' })` 후 모든 섹션의 opacity가 1인지 검증

---

## 비기능 요구사항

### NFR-1: 성능
- [ ] NFR-1-1: 총 페이지 용량(HTML + CSS + JS + 이미지)이 3MB 이하이다
- [ ] NFR-1-2: CSS에 `font-display: swap`이 선언되어 폰트 로딩 전에도 텍스트가 표시된다
- [ ] NFR-1-3: Lighthouse Performance 점수 80 이상 (배포 후 검증)

### NFR-2: 호환성
- [ ] NFR-2-1: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` 태그가 존재한다
- [ ] NFR-2-2: 320px 뷰포트에서 가로 스크롤 없이 모든 콘텐츠가 표시된다
- [ ] NFR-2-3: 1440px 데스크톱 뷰포트에서 레이아웃이 깨지지 않는다

### NFR-3: 접근성
- [ ] NFR-3-1: 본문 텍스트(#333333) on 배경(#FFF8F0 또는 #FFF0F5 또는 #F0FFF4) 색상 대비가 WCAG AA (4.5:1) 이상이다
- [ ] NFR-3-2: 모든 `<img>` 태그에 비어있지 않은 alt 속성이 존재한다
- [ ] NFR-3-3: `<html lang="ko">` 속성이 설정되어 있다
- [ ] NFR-3-4: `public/favicon.ico` 파일이 존재하고 `<link rel="icon">` 태그가 있다

### NFR-4: 보안
- [ ] NFR-4-1: 연락처가 `tel:` 링크로 제공된다 (별도 난독화 없음)
- [ ] NFR-4-2: 외부 링크(네이버맵)에 `rel="noopener noreferrer"` 속성이 존재한다

---

## 디자인 명세

### 색상 팔레트

| 용도 | 코드 |
|------|------|
| 메인 배경 | #FFF8F0 |
| 섹션 배경 (교차 A) | #FFF0F5 |
| 섹션 배경 (교차 B) | #F0FFF4 |
| 포인트/버튼 | #FFB4A2 |
| 본문 텍스트 | #333333 |
| 보조 텍스트 | #666666 |

### 타이포그래피

| 용도 | 크기 | 굵기 |
|------|------|------|
| 히어로 제목 | 28px | Bold (700) |
| 섹션 제목 | 22px | Bold (700) |
| 본문 | 16px | Regular (400) |
| 보조 텍스트 (주소/캡션) | 14px | Regular (400) |

폰트: `'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif` (font-display: swap)

### 레이아웃

| 속성 | 값 |
|------|---|
| 최대 너비 | 480px |
| 좌우 패딩 | 24px |
| 섹션 간 간격 | 48px |
| 카드 border-radius | 16px |

---

## 기술 제약

### 프로젝트 컨벤션
- Vite + vanilla HTML/CSS/JS (React, 프레임워크 사용하지 않음)
- 모든 섹션에 `data-section` 속성을 부여하여 테스트에서 안정적으로 셀렉터 사용
- Prettier 적용 (2-space indent, single quotes)

### 기존 아키텍처 제약
- 새 프로젝트이므로 기존 제약 없음
- 단, Vite의 정적 에셋 처리 규칙 준수: `public/` 디렉토리 파일은 빌드 시 루트로 복사됨

### 의존성
- 외부 라이브러리: 없음 (vanilla JS만 사용)
- 외부 서비스: Google Fonts CDN (Noto Sans KR), 네이버맵 웹 URL (API 키 불필요)
- 빌드 도구: Vite
- 테스트: Playwright
- 배포: Vercel

### 이미지 에셋 요구사항
- `public/images/hero.jpg`: 480x320px 권장, 500KB 이하, 생일 테마 기본 이미지
- `public/og-image.png`: 1200x630px 권장 (최소 800x400px), 300KB 이하
- `public/favicon.ico`: 생일 테마 아이콘

> 참고: 이미지 에셋은 개발 초기에 placeholder로 생성하고, 실제 이미지는 추후 교체한다.

---

## Feature Flag

- **필요 여부**: 불필요
- **근거**: 일회성 이벤트 프로젝트이며, 배포 = 공개이므로 Feature Flag로 제어할 기능이 없다.

---

## 테스트 전략

### e2e 테스트 범위 (Playwright)

모든 수용 기준(AC-*)을 Playwright e2e 테스트로 검증한다. 테스트 파일은 `e2e/invitation.spec.js`에 작성한다.

**테스트 그룹:**

| 그룹 | 검증 항목 | 관련 AC |
|------|----------|---------|
| 레이아웃 | 섹션 수, 순서, max-width, 반응형 | AC-1-* |
| 파티 정보 | 각 섹션의 텍스트 정확성, 폰트 크기 | AC-2-* |
| 지도 링크 | 링크 수, URL 패턴, 터치 타겟 크기 | AC-3-* |
| OG 메타태그 | 5개 메타태그 존재/값, 이미지 파일 존재 | AC-4-* |
| 연락처 | 텍스트, tel: 링크, 터치 타겟 크기 | AC-5-* |
| 히어로 이미지 | img 존재, alt 속성, 이미지 파일 존재 | AC-6-* |
| 애니메이션 | reduced-motion 대응, IntersectionObserver 사용 | AC-7-* |
| 비기능 | viewport 메타, lang 속성, favicon, font-display | NFR-* |

### 테스트 환경 요구사항
- Vite dev 서버 실행 필요 (`yarn dev` 또는 `npx vite`)
- Playwright config에서 `webServer` 옵션으로 자동 실행 설정
- 뷰포트 테스트: 320px (iPhone SE), 480px (모바일 기준), 1024px/1440px (데스크톱)
- `emulateMedia({ reducedMotion: 'reduce' })` 사용 (F-7 테스트)

### 수동 검증 체크리스트 (배포 후)
- [ ] 카카오톡 인앱 브라우저 (iOS) 정상 표시
- [ ] 카카오톡 인앱 브라우저 (Android) 정상 표시
- [ ] 카카오톡 URL 공유 시 OG 미리보기 정상 (카카오 디버거 확인)
- [ ] 네이버맵 링크 탭 시 지도 정상 열림 (2개 장소)
- [ ] 전화 걸기 버튼 탭 시 전화 앱 실행 (모바일)
- [ ] iPhone SE (320px) 실기기 레이아웃 확인

---

## 우선순위 및 구현 순서

| 순서 | 우선순위 | 기능 | 비고 |
|------|---------|------|------|
| 1 | Must | F-1: 레이아웃 + F-2: 파티 정보 | 함께 구현 (HTML 구조 + 텍스트) |
| 2 | Must | F-4: OG 메타태그 | HTML head 영역 |
| 3 | Must | F-3: 네이버맵 링크 | 지도 버튼 추가 |
| 4 | Should | F-5: 연락처 + F-6: 히어로 이미지 | 함께 구현 |
| 5 | Could | F-7: 스크롤 애니메이션 | 4/9까지 Must/Should 미완료 시 드롭 |

**마감 리스크 관리:**
- 4/9까지 Must/Should 미완료 시 F-7 드롭
- Must만 구현해도 초대장으로서 기능함 (MVP)
