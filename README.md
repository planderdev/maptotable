# MAP TO TABLE · PHP 리뉴얼

PHP가 공통 콘텐츠와 컴포넌트를 렌더링하는 온라인 전시입니다. 메인, 공개 이야기 3개와 준비 상태, 5단계 참여 입력, 실제 소스를 공유하는 디자인시스템을 포함합니다. 기존 운영 사이트는 교체하지 않았습니다.

현재 실행 기준은 아래의 로컬 PHP 서버입니다. 이전 클라우드 미리보기 이력은 `docs/qa-report.md`에 기록했습니다.

## 실행

PHP 8.2 이상에서 프로젝트 루트에서 실행합니다. 데이터베이스나 Composer는 필요하지 않습니다.

```powershell
php -S 127.0.0.1:8080 -t public router.php
```

- 전시: http://127.0.0.1:8080/
- 이야기: http://127.0.0.1:8080/story.html?id=1
- 참여: http://127.0.0.1:8080/join.html
- 디자인시스템: http://127.0.0.1:8080/design-system.php

CSS·JS·폰트·미디어가 포함되어 있어 PHP만으로 실행할 수 있습니다. 개발 의존성을 다시 설치할 때는 Node.js 20.11 이상을 사용합니다.

```powershell
npm ci
npm run build
```

빌드는 로컬 GSAP·Swiper·AOS·Lucide와 원본 미디어를 준비하고 모든 PHP 문법, 콘텐츠 매핑, 브랜드 값, 필수 에셋을 검사합니다.

## PHP 호스팅

웹 서버의 DocumentRoot를 **public/**으로 지정합니다. 프로젝트 전체를 웹 루트로 공개하지 않습니다. Apache는 `mod_rewrite`, `AllowOverride All`과 포함된 `public/.htaccess`를 사용합니다. 가능하면 `mod_deflate`로 텍스트 리소스를 압축합니다. Nginx는 PHP-FPM 설정과 함께 다음 호환 규칙을 추가합니다.

```nginx
index index.php;
rewrite ^/index\.html$ /index.php last;
rewrite ^/story\.html$ /story.php last;
rewrite ^/join\.html$ /join.php last;
rewrite ^/design-system/?$ /design-system.php last;
```

기존 `.html` 주소, 쿼리 ID와 `#top`, `#say`, `#list`, `#join`, `#program`을 유지합니다. 배포 루트(`/`)를 기준으로 작성했습니다. 하위 폴더 호스팅에는 base-path 조정이 필요합니다.

## 수정 위치

| 대상 | 소스 |
| --- | --- |
| 원문, 공개 상태, 질문, 프로그램, 사진 초점 | `app/content.php` |
| primitive → semantic → component 토큰 | `app/design-tokens.php` |
| 버튼, 사진, 카드, 캐러셀, 입력, 빈 상태, 배경 영상 | `app/components.php` |
| Header, MobileMenu, Footer, HTML 공통부 | `app/bootstrap.php` |
| 메인·상세·참여·DS 조합 | `public/*.php` |
| 공통 스타일과 반응형 구도 | `public/assets/site.css` |
| 풀블리드 100vh 히어로와 아이콘 사용 기준 | `public/assets/hero.css` |
| 핀, 레일, 참여 단계, 검색·복사·데모 | `public/assets/site.js` |
| AOS 등장 효과와 읽기 대안 | `public/assets/aos-overrides.css` |
| 모바일 메뉴의 세 줄 회전·헤더 정렬 | `public/assets/menu.css` |
| DS 문서 스타일 | `public/assets/design-system.css` |

`public/assets/styles.php`는 실제 토큰, 폰트 선언, Swiper·AOS CSS와 공통 CSS를 한 응답으로 제공합니다. 개별 토큰 CSS는 `/assets/tokens.php`에서도 확인할 수 있습니다. DS에 별도의 복제 컴포넌트를 만들지 않았습니다.

## 사진·원고·공개 상태

원본 사진은 루트 `media/`에 보존했습니다. `media/s/`는 800px 변형, `media/cut/`는 기존 마스크입니다. 새 사진을 추가하면 `app/content.php`의 `photos`에 방향, 데스크톱 초점, 모바일 초점, 대체 텍스트를 등록하고 해당 이야기의 `photos` 배열에 연결합니다.

```powershell
npm run prepare
npm run optimize:images
npm run build
```

WebP는 원본을 바꾸지 않는 전송용 변형입니다. 주민 사진과 이야기 연결을 변경하지 않습니다. `sequence`의 오프닝 사진 6장은 각 소유 이야기의 ID에서 목적지를 계산합니다. 주민 6인, 공개 이야기 3개, 오프닝 사진 6장은 별개입니다.

이름·음식 이름·원고·해설·주민 영상은 아직 제공되지 않아 준비 상태를 유지합니다. 원고를 받으면 `app/content.php`에 실제 원문을 추가하고 `public/story.php`의 해당 준비 상태를 읽기 영역으로 교체합니다.

공개 상태는 이야기의 `status`입니다. 현재 `published` ID는 1, 2, 3이고 다음 이야기는 이 목록에서만 계산합니다. 4, 5, 6은 링크가 없고 직접 진입하면 준비 상태와 HTTP 404를 표시합니다. 실제 콘텐츠를 확인한 뒤에만 공개로 바꿉니다.

## 참여 입력의 범위

원본의 **전송·저장이 없는 시범 화면**을 보존했습니다. 질문 4개와 공개 동의 1개, 빈칸 허용, 글자 수 제한 없음, 기본 비공개, 이전 입력 유지를 구현했습니다. 이름·연락처 필드는 없습니다.

입력은 현재 페이지의 DOM에만 있습니다. 쿠키, PHP 세션, localStorage, 데이터베이스나 외부 API로 보내지 않습니다. 마지막 화면도 시범 화면임을 명시합니다. 추가한 내려받기는 사용자 기기에 UTF-8 텍스트 파일을 만드는 동작입니다. 새로고침·페이지 닫기로 입력이 사라집니다.

실제 접수에는 별도의 PHP 제출 API, 운영자 검토와 비공개 저장소를 연결해야 합니다. 현재 UI만으로 운영 접수가 활성화된 것은 아닙니다.

## 폰트와 모션

Unbounded 400-900과 Pretendard Variable 100-900을 로컬로 제공합니다. 초기 UI는 약 105KB Pretendard 서브셋을 사용하고, 다른 입력 글자는 전체 폰트를 추가로 불러옵니다. 라이선스와 출처는 `public/assets/fonts/` 및 `docs/font-sources.json`에 있습니다. 새 UI 문구를 추가하면 서브셋을 갱신할 수 있습니다. 일반 실행·빌드에는 Python이 필요하지 않습니다.

```powershell
python -m venv .runtime/font-tools
.runtime/font-tools/Scripts/python.exe -m pip install fonttools==4.65.0 brotli==1.2.1
.runtime/font-tools/Scripts/python.exe tools/optimize-fonts.py
```

히어로는 핀 없이 100svh 한 화면을 차지하는 Swiper 슬라이드입니다. 5초마다 자동으로 다음 사진을 재생하고 여섯 번째 뒤에는 첫 사진으로 돌아옵니다. Lucide 일시정지·재생 버튼을 제공하며 마우스 호버·키보드 초점·화면 밖·숨겨진 탭·열린 모바일 메뉴·모션 감소 설정에서는 자동재생을 멈춥니다. 수동 일시정지 상태는 스크롤 재진입에도 유지합니다. `site.js`의 `opening()`에서 드래그·터치·좌우 버튼·키보드 전환과 우측 하단 1 / 6 숫자, 진행 막대를 함께 갱신합니다. 라이브러리를 불러오지 못하면 CSS 스크롤 스냅과 기본 버튼을 사용합니다. 히어로에는 최대 120px 타이틀과 하단 서브카피, 진행 막대를 표시합니다. PC 헤더 로고는 20px이며 세 메뉴는 헤더의 정확한 가운데에 배치합니다. 모바일의 한 줄 로고를 유지합니다. `narrative.css`와 `narrative()`는 사진 없이 제목의 마스크와 opacity가 순서대로 열리는 소개 제목 핀을 구성합니다. ‘삶·계절·기억’에는 프라이머리 오렌지 배경과 진한 글자의 하이라이트를 적용해 마스크와 함께 드러나도록 합니다. `reading()`은 소개 문장·4:3 사진 마퀴·버튼을 한 화면의 sticky 무대에 함께 배치하고 문장만 가로로 교체합니다. PC 본문은 최대 38px이며, 문장 사이에 읽기 시간을 둡니다. ‘음식 이야기 둘러보기’ 버튼은 같은 고정 화면의 사진 마퀴 바로 아래에 있습니다. 하단 사진 마퀴는 왼쪽으로 연속 이동하고 호버·키보드 초점·화면 밖·모션 감소 설정에서 정지합니다. 모션 감소 시 히어로 전환 시간을 0으로 바꾸고 소개 제목·소개 본문의 핀과 스크럽을 제거하고 공개 이야기 링크를 그대로 제공합니다. 음식 이야기에서는 `stories.css`의 중앙 sticky 제목과 좌우 사진을 사용하고, `risingStories()`가 각 카드에 작은 스크롤 이동을 더합니다. 별도의 핀 스페이서나 강제 스크롤을 추가하지 않습니다. 이야기 영역은 흰색 배경과 음식 / 삶 / 기억 세 줄 제목을 사용합니다. 모바일은 제목을 화면 중앙에 고정하고 폭 절반 정도의 4:5 사진 카드를 우·좌·우로 배치합니다. PC·모바일의 카드 정보는 사진 하단에 겹쳐 표시합니다. 호버 시 카드 외곽과 텍스트를 고정하고 사진만 확대하며 밑줄은 표시하지 않습니다. 준비 중 4·5·6은 목록에 렌더링하지 않습니다. 내부 데이터와 404 경로는 보존합니다. 모션 감소 시 제목과 카드 모두 일반 목록으로 돌아옵니다. 그 외 본문은 일반 세로 스크롤입니다. 본문 사진·프로그램 레일은 420ms이며 자동 재생·무한 반복은 없습니다. 프로그램 레일은 `program.css`의 풀브리드 사진 카드입니다. Swiper `spaceBetween`은 모바일 16px, 768px 이상 24px, 1200px 이상 40px이며 `freeMode` 관성 스와이프와 양 끝의 반응형 여백을 사용합니다. 모션 감소 시 전환 시간과 관성을 제거합니다. 선택적 모션 라이브러리는 첫 사진과 폰트가 준비된 뒤 불러옵니다.

AOS 2.3.4는 CDN 없이 `public/assets/vendor/`에서 제공합니다. 참여 안내·질문 목록, 프로그램 제목·카드, 영상 오버레이, 이야기 상세의 읽기 구간, 참여 페이지 소개와 푸터가 한 번씩 등장합니다. 기본 650ms, 시작 여유 64px, 카드별 지연 50ms이며 상승 거리는 데스크톱 16px·모바일 12px입니다. 히어로·소개 핀·스크럽 요소·Swiper 이동 래퍼·참여 입력 단계는 기존 모션과 겹치지 않게 적용 대상에서 제외했습니다. 키보드 초점은 즉시 표시하고, 모션 감소·JS 미사용·AOS 로드 실패에서도 내용을 바로 읽을 수 있습니다. 스크롤 구간 높이가 바뀌면 ScrollTrigger 갱신 후 AOS 위치도 갱신합니다.

모바일 메뉴는 같은 Lucide 세 줄 SVG가 320ms 동안 회전해 X가 되며, 닫을 때 역방향 전환이 끝난 뒤 대화상자를 닫습니다. 메뉴 항목 이동도 전환 뒤 실행합니다. 로고와 44px 닫기 버튼은 헤더의 높이·여백·글자 크기를 공유하고 실제 헤더 폭에 맞춥니다. ESC·정방향/역방향 Tab·초점 복귀·데스크톱 리사이즈·모션 감소 설정을 처리합니다.

소개 본문 핀의 첫 읽기 구간에서 섹션 배경이 흰색에서 프라이머리 컬러 `#F0823A`로 스크롤에 맞춰 바뀝니다. 같은 타임라인에서 버튼 클래스를 `button--primary`에서 `button--dark`로 전환합니다. 역방향으로 시작점까지 돌아가거나 모션 감소 설정을 켜면 흰 배경과 프라이머리 버튼을 복원합니다. 문장 전환 시간과 문장·마퀴·버튼의 한 화면 배치는 유지합니다.

## 추가 에셋

- 생성 정물: `public/assets/images/food-memory.png` 원본과 `.webp` 전송본. 내장 ImageGen을 사용했습니다. 사용자의 후속 요청에 따라 화면의 설명·출처 문구는 생략하고 대체 텍스트를 유지합니다. 프롬프트는 `docs/generated-image-prompt.txt`입니다.
- 배경 영상: `public/assets/video/sea-waves-pixabay.mp4`, Pixabay의 Artvan93 영상. 메인의 풀브리드 100svh 영역에 기존 소개문을 겹쳐 배치합니다. 화면 진입 시 무음·인라인 자동 반복 재생, 화면 밖·백그라운드 일시정지, 버튼 없이 영상 클릭·스페이스/엔터 키로 재생 전환, 수동 정지 유지, 모션 감소 시 포스터와 수동 재생, 장면 설명 트랙을 제공합니다. 화면의 설명·출처 링크는 생략하고 내부 출처 기록은 보존합니다. 주민 기록 영상이나 제주 촬영 영상으로 표시하지 않습니다. 원본 주소는 `docs/video-source.json`입니다.

- 프로그램 카드: `media/generated/programs/`에 내장 ImageGen의 PNG 원본 네 장, `public/assets/images/programs/`에 480/960px WebP를 저장했습니다. 실제 프로그램 현장 사진으로 주장하지 않는 분위기 이미지입니다. 프롬프트와 파일 매핑은 `docs/program-image-prompts.json`에 있습니다.

## 검수와 재현

서버를 실행한 뒤:

```powershell
npm run build
npm test
npm run test:mobile
npm run test:menu
```

Chrome이 필요합니다. WebKit 검증은 `npx playwright install webkit`으로 엔진을 준비합니다. Windows WebKit과 Pixel 터치 에뮬레이션을 실제 iOS Safari·Android Chrome 기기 결과로 간주하지 않습니다.

범위와 성능 실측은 `docs/qa-report.md`, 콘텐츠 대조표는 `docs/content-preservation.md`, 캡처는 `docs/screenshots/`에 있습니다. 성능 상세는 `docs/lighthouse-mobile.report.html`입니다.

슬라이드·핀 재현: 첫 화면에서 스와이프·좌우 버튼으로 사진 1-6과 이야기 ID `1,1,2,2,3,3`, 숫자와 진행 막대를 확인합니다. 세로 스크롤은 히어로를 그대로 지나갑니다. 이후 소개 제목 마스크·고정된 문장의 좌우 교체·사진 마퀴의 왼쪽 이동, `/index.html#list` 직접 진입을 확인합니다. 히어로는 여백 없이 100svh를 채웁니다. 아이콘은 메뉴·닫기·캐러셀·코드 복사처럼 기능 식별에 필요한 경우에만 남겼습니다. CTA·카드·프로그램·푸터의 장식 화살표는 제거했습니다.
