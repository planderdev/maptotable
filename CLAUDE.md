# MAP TO TABLE

실행·구조·배포 방법은 `README.md`를 본다. 계정에 닿는 작업(배포, 푸시, 도메인, 환경 변수, 외부 서비스) 전에는 아래 카드를 먼저 읽는다.

## 플랜더 프로젝트 카드

- 운영 방식: A. 플랜더 운영형
- 클라이언트: 미정 (회사명 / 담당자 / 계정용 공용 이메일 미기재)
- 결정 기록:
  - 2026-11-22 Vercel 프로젝트 `maptotable`을 플랜더 팀에 만들고 GitHub `planderdev/maptotable`과 연결 (`main` 푸시 시 운영 배포)
  - 2026-11-23 운영 방식을 A로 확정하고 카드 작성

| 서비스 | 소유 | 계정·팀 | 플랜더 권한 | 상태 |
|---|---|---|---|---|
| 도메인 | 클라이언트 | 미정 | DNS 관리 | 미연결. 현재 `maptotable.vercel.app`만 사용 |
| GitHub | 플랜더 | `planderdev/maptotable` | 소유 | 운영 중. 운영 브랜치 `main` |
| Vercel | 플랜더 | 팀 `planderdevs-projects`, 프로젝트 `maptotable` | 소유 | 운영 중. 검색 노출 차단(`X-Robots-Tag: noindex`) |
| Resend | — | 사용 안 함 | — | 메일 발송 기능 없음 |

- 환경 변수: 없음
- 미정 항목: 클라이언트 정보, 도메인. 도메인 연결이나 문의·메일 기능을 붙이기 전에 이 카드를 먼저 채운다.
