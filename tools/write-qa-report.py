import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
read=lambda name:json.loads((root/'docs'/name).read_text(encoding='utf-8'))
browser=read('browser-results.json')
mobile=read('mobile-results.json')
mobile_lcp=read('lighthouse-mobile.report.json')['audits']['largest-contentful-paint']['numericValue']/1000
mobile_goal='충족합니다' if mobile_lcp<=2.5 else '조금 못 미칩니다'
rows=[]
for name,filename in [('모바일 / Slow 4G 시뮬레이션','lighthouse-mobile.report.json'),('데스크톱 / Lighthouse desktop preset','lighthouse-desktop.report.json')]:
    report=read(filename)
    a=report['audits'];c=report['categories']
    rows.append(f"| {name} | {round(c['performance']['score']*100)} | {round(c['accessibility']['score']*100)} | {a['largest-contentful-paint']['numericValue']/1000:.2f}초 | {a['cumulative-layout-shift']['numericValue']:.3f} | {a['total-blocking-time']['numericValue']:.0f}ms |")
text=f'''# 검수 결과

검수일: 2026-11-20 (Asia/Seoul). Windows, PHP 8.5.5, Playwright 1.56.1, 설치된 Chrome과 WebKit 26.0에서 로컬 PHP 서버를 검사했습니다. 운영 사이트에 배포하거나 검수 입력을 게시하지 않았습니다.

## 실행 검사

- `npm run build`: 정적 에셋 준비, PHP 13개 문법 검사, 사진 소유 ID·질문 원문·브랜드 값·주소 파일·폰트 존재 검사 통과.
- `npm test`: {len(browser['checks'])}개 검사 통과. 네 화면의 axe WCAG 2 A/AA, 2.1 AA 자동 검사에서 위반 0개.
- `npm run test:mobile`: {sum(len(x['checks']) for x in mobile)}개 검사 통과. Pixel 7의 Chrome 터치 에뮬레이션과 Windows WebKit의 iPhone 13 뷰포트를 사용했습니다.
- `npm run test:media`: 최종 최적화 후 6개 검사 통과. 초기 주민 사진 1장만 요청, 화면 밖 포스터 지연, 실제 영상 재생·화면 밖 중지·라벨 동기화를 확인했습니다.
- 클라우드 미리보기: 별도 정적 호스팅용 PHP 렌더링 결과에서 30개 검사 통과. 이야기 ID, 참여 문맥, 기존 주소의 호환 이동, 이미지·CSS·JavaScript를 확인했습니다.
- `npm audit`: 알려진 취약점 0개. 고정 의존성 버전은 package-lock.json에 있습니다.

## 실제 확인 범위

| 영역 | 확인 내용 |
| --- | --- |
| 반응형 | 360, 390, 768, 1024, 1440, 1920px에서 메인·상세·참여·DS의 페이지 가로 넘침 없음, 폰트 로드, 깨진 이미지 없음. 히어로의 가로 100%·세로 100svh·좌상단 여백 0 확인 |
| 콘텐츠 | 이야기 6개, 공개 링크 3개, 준비 중 링크 없음, 사진 6장 소유 ID 1,1,2,2,3,3 |
| 핀 | 정·역방향과 빠른 점프에서 사진·표시·CTA ID 일치, 소개 건너뛰기, #list 직접 진입 시 인트로 재생 없음 |
| 레일 | 키보드·버튼·마우스 드래그, Chrome CDP의 실제 에뮬레이트된 터치 스와이프, WebKit 버튼 탐색 |
| 상세 | 공개 ID 1·2·3과 다음 링크 순환, 이야기별 참여 연결, 준비 중 ID 4의 HTTP 404 |
| 참여 | 질문 순서, 빈칸 허용, 이전 입력 유지, 기본 비공개, 선택 유지, 단계 제목 포커스, HTML 입력 이스케이프 |
| 참여의 저장 범위 | POST 없음, 서버 저장 주장 없음, 텍스트 내려받기 동작, 검수 내용 게시 없음 |
| 메뉴 | dialog 열기·ESC 닫기·포커스 복귀, WebKit에서도 확인 |
| DS | 한글·영문 검색, 키보드 검색 결과 진입, 목차·해시, 실제 코드 복사, 모션 재생·초기화·감소 모드 |
| 배경 영상 | Pixabay 로컬 MP4 재생·일시정지, source 출처 기록, 포스터·장면 설명 트랙 |
| 접근성 | 네 화면 axe 자동 위반 0개, 실제 색 대비 계산, 포커스·레이블·비공개 기본값 확인 |
| 모션 대안 | reduced-motion에서 핀 제거와 수동 사진 탐색, JS 비활성의 콘텐츠·링크·모든 질문, 라이브러리 실패 시 읽기 가능 |
| 런타임 | 검사 과정 JS 오류 0개, 의도한 준비 상태 404를 제외한 로컬 요청 오류 0개 |

모션 라이브러리는 첫 사진과 폰트가 준비된 뒤 추가합니다. 숨겨진 오프닝 사진은 선택 시 template에서 활성화합니다. JPEG 원본을 유지하고 WebP, 소개 이미지 480/960px 변형, 약 105KB 한글 UI 서브셋을 사용합니다. 배경 영상은 자동 재생하지 않으며 포스터도 화면 근처에서 불러옵니다.

## 성능 실측

Lighthouse 13.6.0, headless Chrome, `http://127.0.0.1:8080/`, 기본 simulated throttling, 로컬 PHP 개발 서버의 gzip 응답을 사용했습니다. 아래는 단일 실험실 실행이며 사용자 실측 데이터가 아닙니다.

| 환경 | 성능 | 접근성 | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: |
{chr(10).join(rows)}

성능 목표는 LCP 2.5초 이하, CLS 0.1 이하입니다. 모바일 LCP는 {mobile_lcp:.2f}초로 목표를 {mobile_goal}. CLS는 목표를 충족합니다. TBT는 실험실 지표이며 INP가 아닙니다. 실제 사용자 INP 데이터는 없습니다. 위 수치는 로컬 원본 측정으로 클라우드 미리보기의 모바일 실사용 성능과 구분합니다.

상세 원본: `docs/lighthouse-mobile.report.html`, `docs/lighthouse-mobile.report.json`, `docs/lighthouse-desktop.report.html`, `docs/lighthouse-desktop.report.json`.

## 증빙과 재현

- `docs/screenshots/home-1440.png`, `home-390.png`: 새 오프닝.
- `introduction-1440.png`, `stories-1440.png`, `participation-1440.png`, `programs-1440.png`: 주요 구획. 같은 이름의 390px 캡처도 있습니다.
- `story-1440.png`, `story-390.png`, `join-1440.png`, `join-390.png`: 상세와 참여.
- `design-system-1440.png`, `design-system-390.png`, `components-1440.png`, `components-390.png`: 문서와 실제 컴포넌트.
- 원본 JSON: `docs/browser-results.json`, `docs/mobile-results.json`.

1. README의 PHP 서버를 실행합니다.
2. `/index.html`에서 정·역방향 스크롤과 텍스트 이전·다음 조작을 사용합니다. 현재 이야기와 링크 목적지가 같은지 확인합니다.
3. 소개 건너뛰기, `/index.html#list` 직접 진입, 메뉴 앵커를 확인합니다.
4. `/story.html?id=1`에서 갤러리를 드래그·터치·버튼·포커스 후 방향키로 탐색합니다.
5. `/join.html?id=1`에서 입력·이전·다음·기본 비공개·시범 완료·로컬 내려받기를 확인합니다. 네트워크 POST가 발생하지 않습니다.
6. `/design-system.php`에서 검색·코드 복사·모션 데모를 확인하고 운영체제 모션 감소 설정에서도 반복합니다.

## 미확인 및 제한

- 실제 iPhone/iPad의 iOS Safari와 실제 Android 기기는 연결되지 않았습니다. Windows WebKit 및 Chrome 에뮬레이션을 실기 검증으로 보고하지 않습니다.
- 실제 모바일 키보드, VoiceOver·TalkBack의 전체 낭독, 실사용 INP는 미확인입니다. 폼은 고정 하단 버튼 없이 일반 문서 흐름으로 구현했습니다.
- 실제 운영 접수·데이터베이스·관리자 검토 API는 원본에 없었습니다. 따라서 저장 성공·실패·재시도 서버 시나리오는 해당하지 않습니다. 프론트의 처리 중 중복 동작 방지와 로컬 파일 실패 피드백만 구현했습니다.
- Apache/Nginx 운영 호스팅 설정은 안내를 제공했으나 이 환경에서 실제 배포하지 않았습니다.
- 별도 Sites 클라우드 미리보기 배포는 성공했습니다. 본인 계정 전용이라 실제 원격 브라우저는 로그인 안내까지 확인했습니다. 로그인 후 콘텐츠의 원격 실기 동작은 미확인입니다. 같은 렌더링 결과를 로컬 정적 서버에서 30개 항목으로 검증했습니다.
- 주민 이름·음식 이름·원고·해설·주민 영상·자막·확정 문의 창구는 미제공으로 준비 상태입니다.

자동 접근성 검사 통과는 모든 보조기기·실기 환경의 접근성 완전 검증을 의미하지 않습니다.
'''
(root/'docs/qa-report.md').write_text(text,encoding='utf-8')
print('Wrote QA report from actual result files.')
