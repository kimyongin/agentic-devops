---
name: agentic-devops
description: >
  AgenticDevOps 파이프라인 규칙. 산출물 체계, 문서 상태/버전 관리, 역할 분담,
  승인 프로세스, 변경 처리 규칙을 정의한다.
  파이프라인 에이전트(prd-writer, design-writer, task-writer, code-writer,
  code-reviewer, release-manager, gate-keeper)에 preload되어 공통 규칙을 주입한다.
user-invocable: false
---

# AgenticDevOps

> **이 스킬의 목적**: 파이프라인 서브에이전트(prd-writer, design-writer, task-writer,
> code-writer, code-reviewer, release-manager, gate-keeper)를 위한 **공통 규칙집**이다.
> 오케스트레이션 로직(에이전트 스폰 조건, 승인 처리)은 `run` 스킬이 담당한다.

이 프로젝트는 **PRD → DESIGN → TASK → CODE → PR → RELEASE** 파이프라인을 따른다.
모든 단계는 이전 단계의 승인된 산출물을 입력으로 받으며, 승인 없이 다음 단계로 진행할 수 없다.

## 산출물 기반 파이프라인

각 단계는 **관리되는 문서**를 산출물로 생성하며, **Gate Keeper 검증 → 사람 승인** 2단계를 거쳐야 다음 단계로 진행한다.
AI Writer가 산출물을 생성하고, Gate Keeper가 검증 및 보고서를 작성하고, 사람이 이를 참고하여 최종 승인한다.

### 파이프라인 흐름

```
PRD(DRAFT) →[승인]→ DESIGN(DRAFT) →[승인]→ TASK(DRAFT) →[승인]→ CODE → PR →[승인]→ RELEASE(DRAFT) →[승인]→ 배포

[승인] = Gate Keeper 검증 → 사람 최종 승인
```

### 산출물 체계

| 단계 | 산출물 ID | 입력 | 산출물 위치 |
|------|-----------|------|-------------|
| PRD | `PRD-xxxx-slug` | 사용자 요구사항 | `docs/ai-devops/PRD/` |
| DESIGN | `DESIGN-xxxx-slug` | 승인된 PRD | `docs/ai-devops/DESIGN/` |
| TASK | `TASK-xxxx-slug` + `CONTEXT-xxxx-slug` | 승인된 DESIGN | `docs/ai-devops/TASK/` |
| CODE | 코드/테스트 | 승인된 TASK | `src/`, `test/` |
| PR | `PR-xxxx` | 구현 코드 | Git PR |
| RELEASE | `RELEASE-xxxx-slug` | 머지된 PR 목록 | `docs/ai-devops/RELEASE/` |

> - `xxxx`는 **산출물 유형별 독립 순번**(0001, 0002, ...)이며, `slug`는 소문자 kebab-case로 핵심 주제를 요약한다.
> - 예: `PRD-0001-user-auth`, `DESIGN-0001-auth-domain`, `TASK-0001-login-api`

### 산출물 간 관계

| 관계 | 카디널리티 | 설명 |
|------|------|------|
| PRD : DESIGN | 1 : N | 하나의 PRD에서 도메인/모듈별로 설계를 분리 |
| DESIGN : TASK | 1 : M | 하나의 설계에서 작업 단위로 분해 |
| TASK : PR | 1 : 1 | 1 PR = 1 TASK |
| PR : RELEASE | N : 1 | 여러 머지된 PR을 하나의 릴리스로 묶음 |

### 문서 상태 흐름

```
기본: DRAFT → APPROVED → (변경 시 DRAFT로 회귀, 재승인 필요) → DEPRECATED
RELEASE 전용: DRAFT → APPROVED → RELEASED → DEPRECATED
                              ↘ ROLLED_BACK → (수정 후 새 RELEASE 생성)
```

> **상태 관리 위치**: 문서 상태는 본문 메타데이터 섹션의 `상태` 필드에서 단일 관리한다. YAML frontmatter에 `status` 필드를 별도로 추가하지 않는다.

- APPROVED 상태의 문서를 변경하면 메타데이터의 `상태` 필드를 DRAFT로 되돌리고 재승인한다.
- 변경 이력(Changelog) 섹션에 버전별 변경 사유를 반드시 기록한다.
- 산출물이 더 이상 유효하지 않으면 `DEPRECATED`로 전환한다.
- RELEASE 문서는 배포 완료 시 `RELEASED`, 롤백 시 `ROLLED_BACK`으로 전환한다.

### 문서 버전 관리 규칙

버전은 **vX.Y.Z**(SemVer 3자리) 형식을 사용한다. 초안은 `v0.1.0`으로 시작한다.

| 변경 유형 | 버전 증분 | 예시 |
|---|---|---|
| 계약/경계/데이터 모델 변경 | Major (X 증가) | v1.0.0 → v2.0.0 |
| 범위/일정/전략 변경 | Minor (Y 증가) | v1.0.0 → v1.1.0 |
| 오타/포맷/표현 수정 | Patch (Z 증가) | v1.1.0 → v1.1.1 |

### 역할 분담

- **Owner(사람)**: PRD 작성/승인, 설계 승인, 작업 계획 승인, 최종 릴리스 승인
- **AI Writer(도구)**: 가이드 기반 산출물 생성, 변경 제안, 보고
- **Gate Keeper(도구)**: 산출물 검증, 프로세스 일관성 검증, 게이트 판정 보고
- **code-reviewer(도구)**: PR 단계에서 AI 생성 코드를 교차 검증하고 리뷰 보고서를 작성
- **Reviewer(사람)**: AI Reviewer 보고서를 참고하여 최종 승인/반려 결정

### 승인 프로세스

모든 산출물은 다음 2단계를 거쳐 승인된다:

1. **Gate Keeper 검증** — 해당 단계 체크리스트로 셀프 체크 + 프로세스 일관성 검증, 보고서 생성
2. **사람 승인** — Gate Keeper 보고서를 참고하여 최종 승인/반려/재작업 결정

CODE/PR 단계에서는 4단계로 확장된다:

1. **CI 자동 게이트** — 포맷/린트, 테스트, 보안 스캔 등 자동 검증
2. **Gate Keeper 검증 → 사람 승인** — 프로세스 준수 검증 후 사람 승인
3. **code-reviewer 교차 검증** — AI 생성 코드의 품질(환각, 로직, 보안, 성능) 검증
4. **사람 리뷰어 최종 승인** — code-reviewer 보고서를 참고하여 최소 1인 이상 사람 리뷰어가 PR 직접 머지

### 변경 처리 규칙

승인 범위를 벗어나는 변경은 `CHANGE_REQUEST`를 발행한다.

- **PRD 변경**: 요구사항/범위/우선순위 변경 → PRD 갱신 재승인 → 영향받는 DESIGN 갱신 재승인 → TASK 갱신 → 코드 반영
- **설계 변경**: 도메인 경계/계약/데이터 모델/유즈케이스 변경 → DESIGN 갱신 재승인 → TASK 갱신 → 코드 반영
- **작업 변경**: 작업 범위/순서/마일스톤/전략 변경 → TASK 갱신 재승인 → 코드 반영
- **코드 변경**: 작업 범위 내 구현 수정 → PR 리뷰 및 승인만으로 반영 가능

### CHANGE_REQUEST 형식

```
## CHANGE_REQUEST
- 변경 대상: (산출물 ID — PRD/DESIGN/TASK)
- 변경 사유: (왜 변경이 필요한가)
- 영향 범위: (어떤 하위 산출물이 영향받는가)
- 제안 내용: (변경 내용 요약)
```

- 발행 즉시 사람에게 보고하고, 승인을 받은 뒤 해당 산출물을 갱신한다.

## 핵심 원칙

- **계약 없는 코드 금지**: 신규 API/이벤트/스키마는 반드시 계약 문서에 반영 후 구현한다.
- **작업 범위 이탈 금지**: 승인된 범위를 벗어나는 변경이 필요하면 `CHANGE_REQUEST`를 발행한다.
- **산출물 추적**: 모든 산출물은 ID/버전을 가지며, 이전 단계 산출물 ID를 참조한다.
- **증분 개발**: 한 번에 완성하지 않는다. 기능 단위로 증분 갱신하고, 승인된 범위만 다음 단계로 진행한다.

## 범위 밖

핫픽스/인시던트 관리, 프로젝트 부트스트래핑, 인프라 프로비저닝, 모니터링 도구 설치/설정, 시크릿 관리 도구 운영, 성능/부하 테스트, DR/백업, Feature Flag 운영, 의존성 자동 업데이트 도구 운영은 본 파이프라인 범위 밖이다.
