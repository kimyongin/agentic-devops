# AgenticDevOps

AI 에이전트와 함께 소프트웨어를 설계하고, 구현하고, 배포하기 위한 Claude Code Plugin.

## 왜 만들었나

AI 에이전트는 코드를 잘 작성하지만, 혼자 놔두면 설계 없이 코드를 짜고, 범위를 넘어서 변경하고, 문서 없이 배포한다. 사람이 매번 "설계 먼저 해", "계약 문서 갱신해", "테스트 빠졌어"를 지시하는 건 비효율적이다.

이 플러그인은 AI 에이전트에게 **개발 프로세스 자체를 가르쳐서**, 사람은 의사결정과 승인에 집중하고 AI가 프로세스를 스스로 따르게 한다.

## 설계 컨셉

### 산출물 기반 파이프라인

모든 개발을 6단계 파이프라인으로 구조화한다. 각 단계는 이전 단계의 **승인된 산출물**을 입력으로 받으며, 승인 없이 다음 단계로 넘어갈 수 없다.

```
PRD → DESIGN → TASK → CODE → PR → RELEASE
```

- **PRD**: 무엇을 만들 것인가 (요구사항)
- **DESIGN**: 어떻게 만들 것인가 (아키텍처, 계약, 테스트 전략)
- **TASK**: 어떤 순서로 만들 것인가 (WBS, 마일스톤)
- **CODE → PR**: 구현하고 머지한다
- **RELEASE**: 배포하고 검증한다

### AI가 쓰고, AI가 검증하고, 사람이 승인한다

AI Writer가 산출물을 생성하면, Gate Keeper(역시 AI)가 체크리스트로 검증하고 보고서를 작성한다. 사람은 보고서를 참고하여 승인/반려만 하면 된다.

### 오케스트레이터 + 전문 서브에이전트 구조

`/agentic-devops:run` 커맨드가 파이프라인을 조율하고, 각 단계는 해당 역할에 특화된 서브에이전트가 처리한다. 에이전트마다 필요한 지식(skills)이 미리 주입되어 있다.

## 기본 권장 기술 스택 (예시)

PRD에 기술 스택 섹션이 명시되어 있으면 해당 내용을 따른다. 명시되지ㄱ 않은 경우 아래 기본값을 권장한다.


| 영역    | 아키텍처                            | 비고                |
| ----- | ------------------------------- | ----------------- |
| 백엔드   | 헥사고날 아키텍처 (Ports & Adapters)    | 도메인 순수성, 모듈 경계 분리 |
| 프론트엔드 | Feature-Sliced Design (FSD)     | 레이어 기반, 의존 방향 강제  |
| 인프라   | Kubernetes                      | 매니페스트/Helm, IaC   |
| 배포 단위 | 모듈러 모놀리스 (기본) → 모노레포 MSA (필요 시) | 헥사고날 포트 교체로 자연 전환 |


## 설치

### 방법 1: 마켓플레이스 (권장)

클론 없이 바로 설치한다.

```shell
/plugin marketplace add kimyongin/agentic-devops
/plugin install agentic-devops@kimyongin
```

### 방법 2: 로컬 클론

```bash
git clone https://github.com/kimyongin/agentic-devops
claude --plugin-dir ./agentic-devops
```

## 사용법

### 파이프라인 시작

```
/agentic-devops:run "온라인 쇼핑몰을 만들고 싶어"
  → 오케스트레이터: 파이프라인 현황 스캔
  → prd-writer 에이전트 스폰 → PRD-0001-shopping-mall.md 생성
  → gate-keeper 에이전트 스폰 → 검증 보고서
  → 승인 요청

승인
  → design-writer 에이전트 스폰 → DESIGN-0001-auth-domain.md 생성
  → gate-keeper 검증 → 승인 요청

승인
  → task-writer 에이전트 스폰 → TASK-0001-login-api.md + CONTEXT 생성
  → gate-keeper 검증 → 승인 요청

승인
  → code-writer 에이전트 스폰 → 코드/테스트 구현 + PR 생성
  → gate-keeper 에이전트 스폰 → 프로세스 검증 → 사람 승인
  → code-reviewer 에이전트 스폰 → 코드 품질 검증
  → 사람 리뷰어가 PR 직접 머지

머지 후
  → release-manager 에이전트 스폰 → RELEASE-0001-v1.0.0.md 생성
  → gate-keeper 검증 → 승인 요청 → 배포
```

### 특정 단계만 실행

```
/agentic-devops:run design PRD-0001-user-auth
/agentic-devops:run task DESIGN-0001-auth-domain
/agentic-devops:run status
```

### 기존 기능 변경

```
/agentic-devops:run "인증에 OAuth를 추가하고 싶어"
  → 오케스트레이터: 기존 DESIGN DRAFT로 되돌림
  → design-writer 에이전트 스폰 → DESIGN 갱신
  → gate-keeper 검증 → 승인 → TASK → CODE → PR → RELEASE
```

## 구조

```
agentic-devops/                      # Plugin 루트
├── .claude-plugin/
│   └── plugin.json                  # Plugin 메타데이터
├── skills/
│   ├── agentic-devops/
│   │   └── SKILL.md                 # 파이프라인 공통 규칙 (모든 에이전트 preload)
│   ├── run/
│   │   └── SKILL.md                 # /agentic-devops:run user-invocable skill (오케스트레이터)
│   ├── prd-writer/SKILL.md          # PRD 작성 가이드
│   ├── design-writer/SKILL.md       # 설계 문서 가이드
│   ├── task-writer/SKILL.md         # 작업 계획 가이드
│   ├── code-writer/SKILL.md         # 코드 구현/PR 관리 가이드
│   ├── code-reviewer/SKILL.md       # 코드 리뷰 가이드
│   ├── release-manager/SKILL.md     # 릴리스/배포 가이드
│   └── gate-keeper/SKILL.md         # 게이트 검증 가이드
├── agents/                          # 서브에이전트 정의
│   ├── prd-writer.md
│   ├── design-writer.md
│   ├── task-writer.md
│   ├── code-writer.md
│   ├── code-reviewer.md
│   ├── release-manager.md
│   └── gate-keeper.md
├── hooks/
│   └── hooks.json                   # SubagentStop 자동화 훅
└── scripts/
    └── subagent-stop-handler.js     # 에이전트 완료 → 다음 단계 안내
```

## 4개 컴포넌트 역할


| 컴포넌트                     | 호출 방식                                                      | 역할            |
| ------------------------ | ---------------------------------------------------------- | ------------- |
| `skills/[role]/SKILL.md` | 에이전트 시작 시 자동 preload                                       | 역할별 지식 주입     |
| `agents/[role].md`       | 오케스트레이터가 Task tool로 스폰                                     | 전담 서브에이전트     |
| `skills/run/SKILL.md`    | user-invocable skill, 사용자 `/agentic-devops:run` 호출 시 자동 로드 | 파이프라인 오케스트레이션 |
| `hooks/hooks.json`       | 에이전트 종료(SubagentStop) 시 자동                                 | 다음 단계 자동 안내   |


## Hooks 자동화 흐름

```
prd-writer 에이전트 종료
  └─ SubagentStop hook → subagent-stop-handler.js
        └─ "prd-writer 완료, gate-keeper 실행 필요"

design-writer 에이전트 종료
  └─ SubagentStop hook → subagent-stop-handler.js
        └─ "design-writer 완료, gate-keeper 실행 필요"

task-writer 에이전트 종료
  └─ SubagentStop hook → subagent-stop-handler.js
        └─ "task-writer 완료, gate-keeper 실행 필요"

code-writer 에이전트 종료
  └─ SubagentStop hook → subagent-stop-handler.js
        └─ "code-writer 완료, code-reviewer 실행 필요"

code-reviewer 에이전트 종료
  └─ SubagentStop hook → subagent-stop-handler.js
        └─ "code-reviewer 완료, 사람 리뷰어 PR 머지 필요"

release-manager 에이전트 종료
  └─ SubagentStop hook → subagent-stop-handler.js
        └─ "release-manager 완료, gate-keeper 실행 필요"
```

## 라이센스

MIT