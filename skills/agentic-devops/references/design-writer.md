# Design Writer

## 프로세스 규칙

- 파이프라인: PRD → **DESIGN** → TASK → CODE. 승인된 PRD를 입력으로 받는다.
- 산출물 ID: `DESIGN-xxxx` 형식. 메타데이터에 참조 PRD를 필수 기재.
- 버전: 계약/경계/데이터 모델 변경 → Major, 범위/일정 변경 → Minor, 오타/포맷 → Patch.
- APPROVED 문서를 변경하면 DRAFT로 되돌리고 재승인. 승인 범위 이탈 시 `CHANGE_REQUEST` 발행.
- 증분 원칙: 기능 단위로 DESIGN을 증분 갱신. 이전 스프린트 DESIGN은 누적(Living Document)으로 관리.

## 실행 절차

### 1단계: 입력 확인

1. 입력 PRD(`PRD-xxxx`)를 읽고 내용을 파악한다.
2. PRD 상태가 APPROVED인지 확인한다. DRAFT이면 사용자에게 승인 필요를 알린다.
3. 기존 DESIGN이 있으면 읽고 증분 갱신 여부를 판단한다.

### 2단계: 설계 문서 생성

아래 **설계 원칙**과 **템플릿**을 따라 `docs/ai-devops/DESIGN/DESIGN-xxxx.md`를 생성한다.

### 3단계: 셀프 체크

- [ ] 도메인 경계가 명확한가?
- [ ] 포트/어댑터가 분리되어 있는가?
- [ ] 계약(API/이벤트/스키마)이 문서화되었는가?
- [ ] 테스트 전략과 관측성이 포함되었는가?
- [ ] SLO/SLI가 정의되었는가?
- [ ] 마이그레이션/롤백이 고려되었는가?
- [ ] 멀티 서비스 변경 시 배포 순서와 호환성 정책이 명시되었는가?
- [ ] 데이터 거버넌스(PII/보존/분류)가 검토되었는가?
- [ ] 리스크/가정/오픈 이슈가 기록되었는가?

### 4단계: 보고

```
## 설계 에이전트 보고서
- 생성 문서: DESIGN-xxxx
- 발견 사항: (PRD에서 모호하거나 추가 확인이 필요한 부분)
- 오픈 이슈: (해결되지 않은 질문)
- 판단 근거: (주요 설계 결정과 근거)
- 잔여 리스크: (남아 있는 위험 요소)
```

---

## 설계 원칙

### 경계 먼저(Boundary-first)

- 도메인/서브도메인 경계를 먼저 정하고(바운디드 컨텍스트), 경계 사이 통신은 **계약(Contract)**으로만 한다.
- "편해서" 다른 레이어/모듈을 직접 참조하는 것을 금지한다.

### 계약 우선(Contract-first)

- 외부 노출(API), 비동기 이벤트, 저장 스키마 변경은 항상 **계약 문서화 + 버전 규칙**을 가진다.
- 계약 없는 신규 엔드포인트/이벤트/컬럼 추가를 금지한다.

### 검증 가능성(Verifiability)

- 설계는 "구현 방법"이 아니라 "검증 가능한 약속"을 포함해야 한다.
- 각 유즈케이스마다 **Acceptance Criteria(인수 기준) + 테스트 전략**을 명시한다.

### 선택의 기록(ADR)

- 중요한 트레이드오프는 ADR로 남긴다(예: 동기 API vs 이벤트, 일관성 전략, 캐시 전략).

### 멀티 서비스 조율(Cross-service Coordination)

- 여러 서비스에 걸친 변경은 **단일 DESIGN 안에 영향 범위를 모두 명시**한다.
- 크로스 서비스 계약 변경 시 배포 순서: Consumer 하위호환 배포 → Producer 변경 배포 → Consumer 전환 배포.
- 서비스 간 계약은 **독립 버전**을 가지며, Breaking change가 상대방에 전파되지 않도록 호환성 정책을 수립한다.
- 조율 필요 서비스가 3개 이상이면 **ADR로 배포 전략을 기록**한다.

---

## 설계 문서 템플릿

`docs/ai-devops/DESIGN/DESIGN-xxxx.md` 형태로 생성한다.

### [DESIGN-xxxx] 설계 문서 제목

#### 메타데이터
- 문서 ID: `DESIGN-xxxx`
- 버전: `v0.1`
- 참조 PRD: `PRD-xxxx`
- 작성일: `YYYY-MM-DD`
- 상태: `DRAFT | APPROVED | DEPRECATED`
- 오너(승인자): `@name`
- 관련 ADR: `ADR-xxxx (있다면 링크)`

#### 1) 배경(Problem Context)
- 현상/문제:
- 왜 지금:
- 범위(Scope):
- 비범위(Non-goals):

#### 2) 목표(Goals) & 성공 기준(Success Metrics)
- 기능 목표:
- 비기능 목표(NFR): (성능/가용성/보안/비용/운영)
- KPI/측정 방법:

#### 3) 도메인 모델(Domain)
- 핵심 용어(Glossary):
- 엔티티/값객체/애그리게잇:
- 불변 조건(Invariants):
- 상태 전이(간단한 상태 머신이 있으면 명시):

#### 4) 유즈케이스(Use Cases)

> 각 유즈케이스는 "입력 → 처리 → 출력"이 명확해야 하며, 경계 밖 동작은 포트로만 호출한다.

##### UC-1: (유즈케이스 이름)
- 주체(Actor):
- 트리거:
- 사전 조건(Preconditions):
- 기본 흐름(Main flow):
- 예외 흐름(Exceptions):
- 결과(Outcome):
- Acceptance Criteria:
- 테스트 전략: Unit / Integration / Contract / E2E 중 무엇으로 검증할지

(UC-2, UC-3 ... 반복)

#### 5) 헥사고날 아키텍처(Ports & Adapters)

##### 5.1 레이어 정의
- Domain: 순수 도메인 규칙(외부 의존 금지)
- Application: 유즈케이스 오케스트레이션(포트 인터페이스 의존)
- Adapters: 외부 시스템 연동/입출력(UI, API, DB, MQ 등)
- Infrastructure: 구현 세부(HTTP client, DB driver 등)

##### 5.2 포트(Ports)
- Inbound Ports(Use case 인터페이스):
  - `CreateXxxUseCase`
  - `GetXxxUseCase`
- Outbound Ports(의존 인터페이스):
  - `XxxRepository`
  - `EventPublisher`
  - `ExternalFooClient`

##### 5.3 어댑터(Adapters)
- Inbound Adapters:
  - REST Controller / gRPC / CLI / Consumer
- Outbound Adapters:
  - DB Repository 구현
  - MQ Publisher/Producer
  - External API Client

#### 6) 계약(Contracts)

##### 6.1 API 계약(필요 시)
- 엔드포인트 목록:
- 요청/응답 스키마:
- 오류 모델:
- 버전 규칙: (예: `/v1`, header versioning 등)
- 호환성 정책: (Breaking change 금지, deprecate 절차)

##### 6.2 이벤트 계약(필요 시)
- 이벤트 이름/버전:
- 스키마(필드/타입/필수 여부):
- 발행 조건/빈도:
- 컨슈머 기대치(Exactly-once? at-least-once?):
- 재처리/멱등성 키:

##### 6.3 데이터/스키마 계약(필요 시)
- 테이블/컬렉션:
- 키 설계:
- 인덱스:
- 마이그레이션 전략:
- 롤백 전략:

#### 7) 데이터 흐름 & 시퀀스(권장)
- 핵심 시퀀스 다이어그램(텍스트로라도):
- 동기/비동기 경로 구분:
- 트랜잭션 경계:

#### 8) 보안/권한/데이터 거버넌스(필수)
- 인증/인가 방식:
- 시크릿 보관:
- 감사 로그:

##### 8.1 데이터 거버넌스
- 데이터 분류(Classification): 공개/내부/기밀/극비 등급 지정
- PII(개인식별정보) 목록 및 처리 방침:
  - 수집 항목/근거/보존 기간:
  - 마스킹/암호화 정책:
  - 삭제(Right to be forgotten) 절차:
- 개인정보보호법/GDPR 준수 항목:
- 데이터 보존 기간 및 파기 정책:
- 데이터 접근 통제(최소 권한 원칙):

#### 9) 관측성 & SLO(Observability)
- 로그: 구조화 로그 키(예: request_id, user_id, use_case)
- 메트릭: 성공/실패/지연/큐 적체/리트라이
- 트레이싱: trace_id propagation
- 알람: SLO 기반 알람/에러율/지연

##### 9.1 SLO/SLA 정의(권장)
- 대상 서비스/엔드포인트:
- SLI(Service Level Indicator) 정의:
  - 가용성: (예: 성공 응답 비율)
  - 지연: (예: P99 latency)
  - 정확도: (예: 올바른 응답 비율)
- SLO(Service Level Objective) 목표:
  - 가용성: (예: 99.9% / 30일 롤링)
  - 지연: (예: P99 < 200ms)
- Error Budget 정책:
  - 잔여 Budget 소진 시 신규 기능 배포 중단, 안정화 집중
  - Error Budget 리뷰 주기: (예: 주간/격주)
- SLA(외부 계약, 해당 시):
  - 위반 시 영향/페널티:

#### 10) 테스트 전략(필수) — "무엇을/왜 테스트하는가"

> 설계 단계에서는 **무엇을 검증해야 하는지(대상)**와 **왜 검증해야 하는지(리스크)**를 정의한다.
> 구체적인 테스트 일정/순서는 작업 계획(TASK)에서, 작성 방법은 코드 가이드에서 다룬다.

- **Unit**: 도메인 불변 조건, 정책 규칙, 유즈케이스 오케스트레이션 로직
- **Integration**: DB/외부 연동 경로, 트랜잭션 경계
- **Contract**: API/이벤트/스키마 호환성
- **E2E**: 핵심 사용자 플로우(주요 UC)

#### 11) 검증 게이트(Approval Gate)
- 설계 승인 조건:
  - [ ] 도메인 경계가 명확한가?
  - [ ] 포트/어댑터가 분리되어 있는가?
  - [ ] 계약(API/이벤트/스키마)이 문서화되었는가?
  - [ ] 테스트 전략과 관측성이 포함되었는가?
  - [ ] SLO/SLI가 정의되었는가?
  - [ ] 마이그레이션/롤백이 고려되었는가?
  - [ ] 멀티 서비스 변경 시 배포 순서와 호환성 정책이 명시되었는가?
  - [ ] 데이터 거버넌스(PII/보존/분류)가 검토되었는가?
  - [ ] 리스크/가정/오픈 이슈가 기록되었는가?

#### 12) 리스크/가정/오픈 이슈
- 리스크:
- 가정:
- 오픈 이슈(질문):

#### 13) 변경 이력(Changelog)
- v0.1: 초안

---

## 계약 템플릿(부록)

### API 스펙 템플릿(요약)
- Endpoint: `POST /v1/...`
- Request: fields
- Response: fields
- Errors: `XXX_INVALID_ARGUMENT`, `XXX_NOT_FOUND`
- Backward Compatibility:
- Deprecation Plan:

### 이벤트 스펙 템플릿(요약)
- Event: `XxxHappened.v1`
- Key:
- Payload:
- Producer:
- Consumers:
- Delivery Semantics:
- Idempotency:
