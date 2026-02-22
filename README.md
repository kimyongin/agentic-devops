# AgenticDevOps

PRD → DESIGN → TASK → CODE → PR → RELEASE 파이프라인을 따르는 AI 기반 소프트웨어 개발 운영 스킬.

## 설치

```bash
npx skills add <user>/ai-driven-devops-skills
```

Cursor, Claude Code 등 Agent Skills 표준을 지원하는 AI 도구에 자동 설치됩니다.

## 구조

```
skills/agentic-devops/
├── SKILL.md                         # 핵심 원칙 + 작업별 라우팅 테이블
└── references/
    ├── prd-writer.md                # PRD(요구사항 정의서) 작성 가이드
    ├── design-writer.md             # 헥사고날 아키텍처 기반 설계 문서 가이드
    ├── task-writer.md               # WBS/마일스톤 작업 계획 가이드
    ├── code-writer.md               # 코드 생성 가이드 (컨벤션, 테스트, CI)
    ├── pr-manager.md                # PR 라이프사이클 관리 가이드
    ├── code-reviewer.md             # AI 생성 코드 리뷰 가이드
    ├── release-manager.md           # 릴리스/배포/롤백 관리 가이드
    └── gate-keeper.md               # 파이프라인 게이트 검증 가이드
```

## 동작 방식

1. 개발 관련 요청 시 `SKILL.md`가 자동 로드됩니다.
2. `SKILL.md`의 라우팅 테이블에 따라 해당 작업의 레퍼런스만 선택적으로 읽습니다.
3. 핵심 원칙(계약 없는 코드 금지, 범위 이탈 금지, 산출물 추적)이 모든 작업에 적용됩니다.

## 포함된 가이드

| 작업 | 레퍼런스 | 설명 |
|------|----------|------|
| PRD 작성 | `prd-writer.md` | 배경, 목표, 사용자 스토리, 범위, 제약사항을 구조화 |
| 설계 | `design-writer.md` | 헥사고날 아키텍처, 계약, 테스트 전략, SLO/SLI |
| 작업 계획 | `task-writer.md` | WBS 분해, 마일스톤, 맥락 노트, 작업 기억 프로토콜 |
| 코드 생성 | `code-writer.md` | 레이어 의존 규칙, 브랜칭, 컨벤션, CI 게이트, PR 템플릿 |
| PR 관리 | `pr-manager.md` | PR 생성, CI 확인, 리뷰 조율, 충돌 해결, 머지 |
| 코드 리뷰 | `code-reviewer.md` | 환각 검증, 로직/보안/성능/테스트/라이센스 검증 |
| 릴리스 관리 | `release-manager.md` | 릴리스 문서, 단계 배포, 검증, 롤백, 핫픽스 |
| 게이트 검증 | `gate-keeper.md` | 파이프라인 게이트 정의, 프로세스 일관성, KPI |

## 핵심 원칙

- **계약 없는 코드 금지**: 신규 API/이벤트/스키마는 반드시 계약 문서에 반영 후 구현
- **작업 범위 이탈 금지**: 승인 범위 밖 변경은 `CHANGE_REQUEST` 발행
- **산출물 추적**: 모든 산출물은 ID/버전을 가지며 이전 단계를 참조

## 라이센스

MIT
