# Code Writer

> 파이프라인 규칙, 산출물 체계, 역할, 변경 처리는 `SKILL.md`를 따른다.

- 승인된 TASK를 입력으로 받는다. 산출물: PR 또는 코드/테스트/문서 변경. 각 PR은 참조 TASK를 기재.
- 증분 원칙: 승인된 범위만 코드로 구현. DESIGN/TASK 갱신과 CODE를 동시에 진행할 수 있으나 승인 순서는 유지.
- 1 PR = 1 TASK 원칙. TASK 범위를 벗어나는 변경은 별도 PR로 분리한다.
- 모든 자동 게이트(CI)를 통과하고, 최소 1인 이상 리뷰어 승인을 받아야 머지한다.

## 목차
- [실행 절차](#실행-절차)
- [핵심 규칙](#핵심-규칙)
- [브랜칭/머지 전략](#브랜칭머지-전략)
- [코딩 컨벤션](#코딩-컨벤션)
- [서드파티 의존성 관리](#서드파티-의존성-관리)
- [테스트 작성 규칙](#테스트-작성-규칙)
- [CI 자동 게이트](#ci-자동-게이트)
- [PR 템플릿](#pr-템플릿)
- [저장소 구조](#저장소-구조)

## 실행 절차

### 1단계: 입력 확인

1. 참조할 TASK 문서(`TASK-xxxx-slug`)를 읽고 작업 범위를 파악한다.
2. TASK 상태가 APPROVED인지 확인한다.
3. 맥락 노트(`CONTEXT-xxxx-slug`)가 있으면 함께 읽는다.
4. 참조 DESIGN 문서를 읽고 아키텍처/계약을 파악한다.
5. 브랜치가 네이밍 규칙을 따르는지 확인한다.

### 2단계: 코드 생성

아래 **핵심 규칙**과 **코딩 컨벤션**을 따라 코드/테스트를 생성한다.

### 3단계: PR 생성

1. 브랜치 네이밍 규칙에 따라 브랜치가 생성되었는지 확인한다.
   - 기능: `feature/TASK-xxxx-slug`
   - 버그 수정: `fix/TASK-xxxx-slug`
   - 리팩토링: `refactor/TASK-xxxx-slug`
2. 아래 **PR 템플릿**에 따라 PR을 작성한다.
3. 필수 항목을 기재한다:
   - 참조 TASK / DESIGN 링크
   - 변경 유형 (Feature / Fix / Refactor / Docs)
   - 변경 내용 (무엇을, 왜)
   - 계약/스키마 변경 여부
   - 테스트 실행 방법
   - AI 생성 코드 확인 체크리스트

### 4단계: CI 자동 게이트 확인

CI 파이프라인 실행 결과를 확인한다. 모든 게이트를 통과해야 리뷰를 요청할 수 있다. 게이트 목록과 실패 대응은 [CI 자동 게이트](#ci-자동-게이트) 섹션을 참조한다.

CI 실패 시 수정 → 커밋 → 재실행을 반복한다. 3회 이상 실패하면 원인을 정리하여 보고한다.

### 5단계: 리뷰 요청 및 대응

1. **AI 교차 검증**: `code-reviewer.md`에 따라 AI가 코드를 교차 검증하고 리뷰 보고서를 작성한다.
2. **사람 리뷰 요청**: 리뷰어를 지정하고, AI 리뷰 보고서와 함께 리뷰를 요청한다.
3. 사람 리뷰어는 AI 리뷰 보고서를 참고하여 경계, 계약, 리스크, 테스트 전략을 중심으로 검토한다.
4. 리뷰 코멘트에 대응한다:
   - **Critical/Major**: 반드시 수정 후 재리뷰 요청.
   - **Minor**: 수정 또는 합리적 사유와 함께 반영하지 않음을 명시.
   - **질문/제안**: 답변 또는 논의 후 결론을 코멘트에 기록.
5. 수정 후 CI를 재확인하고 재리뷰를 요청한다.
6. 최소 1인 이상 사람 리뷰어가 승인하면 머지 준비 완료.

### 6단계: 머지 및 후처리

1. `main`과의 충돌을 확인하고, 충돌이 있으면 해결한다.
2. Squash merge를 기본으로 한다.
3. 머지 후 기능 브랜치를 삭제한다.
4. 참조 TASK의 해당 작업 상태를 업데이트한다.

### 7단계: 보고

```
## 코드 구현 및 PR 보고서
- PR: PR-xxxx (또는 PR 링크)
- 참조 TASK: TASK-xxxx-slug
- 참조 DESIGN: DESIGN-xxxx-slug (계약/설계 변경 포함 시)

### 변경 내용
- 변경 파일: (파일 목록 + 변경 의도)
- 변경 로그: (각 파일별: 추가/수정/삭제한 내용 요약)

### CI 결과
- 게이트 통과 여부: 전체 통과 / 실패 후 수정
- 재실행 횟수: (있을 경우)

### 리뷰 결과
- 리뷰어: (이름/역할)
- 발견 사항 요약: Critical x건, Major x건, Minor x건
- 주요 수정 내용: (리뷰 반영 사항)

### 머지 정보
- 머지 방식: Squash merge
- 대상 브랜치: main
- 충돌 해결: 없음 / 있음 (상세)

### 후처리
- 브랜치 삭제: 완료/미완료
- TASK 상태 업데이트: 완료/미완료

### 발견 오류
- (있을 경우 상세)
- 조치: (수정 완료 / 수정 계획 제시 / CHANGE_REQUEST)
```

---

## 핵심 규칙

### 계약 없는 코드 금지

- 신규 API/이벤트/스키마는 반드시 계약 문서에 반영 후 구현한다.
- "일단 만들고 나중에 문서화" 금지.

### 레이어 의존 규칙

#### 백엔드 (헥사고날 아키텍처)

- Domain → (아무것도 의존하지 않음)
- Application → Domain + Ports(인터페이스)
- Adapters → Application/Ports를 구현(외부 연동)
- Infrastructure → 드라이버/SDK/프레임워크

**금지 예시:**
- Domain에서 DB/HTTP/프레임워크 클래스를 import
- Inbound Adapter에서 Outbound Adapter를 직접 호출(Port를 거치지 않음)

#### 프론트엔드 (Feature-Sliced Design)

- 레이어 위계(하위 → 상위): shared → entities → features → widgets → pages → app
- 의존 방향: 상위에서 하위로만 허용 (app → pages → widgets → features → entities → shared)
- 같은 레이어 내 슬라이스 간 직접 참조 금지 (shared를 통해 공유)

**금지 예시:**
- features/cart에서 features/auth를 직접 import
- entities에서 features나 widgets를 import

### 작업 범위 이탈 금지

- TASK에 없는 작업이 필요하면: `CHANGE_REQUEST` 작성 → TASK 갱신/승인 → 코드 반영
- 설계 변경(계약/경계)이면 DESIGN부터 갱신한다.

---

## 브랜칭/머지 전략

- Trunk-based: `main`에서 분기, 1~2일 이내 머지. 장기 브랜치 금지.
- 네이밍: `feature/TASK-xxxx-slug`, `fix/TASK-xxxx-slug`, `refactor/TASK-xxxx-slug`
- Squash merge 기본. 머지 후 기능 브랜치 삭제.

---

## 코딩 컨벤션

- **네이밍**: 도메인 용어를 코드에 그대로 반영(Glossary 준수). UseCase는 동사+목적어: `CreateOrder`, `GetProfile`
- **에러 처리**: "의미 있는" 도메인 에러 타입 정의. 인프라 예외는 어댑터에서 도메인 에러로 변환.
- **주석**: "왜(Why)"만 남기고 "무엇(What)"은 코드로 표현.
- **설정**: 환경별 설정은 외부로 분리(.env/Secret Manager 등). 시크릿 하드코딩 금지.

---

## 서드파티 의존성 관리

- lock 파일 필수 커밋. 버전 범위(`^`, `~`, `>=`)는 프로덕션 의존성에 사용 금지.
- 동일 기능 중복 도입 금지. 라이센스 호환 확인.

---

## 테스트 작성 규칙

- **Unit**: 도메인 규칙, 유즈케이스 오케스트레이션. 외부 의존은 Mock/Stub으로 대체. 빠른 실행 보장.
- **Integration**: DB/외부 연동(테스트 컨테이너/샌드박스). 실제 인프라와의 연동 검증.
- **Contract**: API/이벤트 스키마 호환성. Provider/Consumer 양쪽에서 검증.
- **E2E**: 주요 사용자 플로우(핵심 UC 중심). 실제 환경에 가까운 설정으로 실행.

> 테스트 없는 계약 변경 금지 — 계약이 바뀌면 계약 테스트가 반드시 따라온다.

---

## CI 자동 게이트

### 게이트 목록

- 포맷/린트/정적 분석
- 단위 테스트(Unit)
- 통합 테스트(Integration)
- 계약 테스트(Contract; API/이벤트/스키마)
- 아키텍처 규칙 검사(레이어 의존 금지 등)
- 보안 스캐닝(의존성 취약점/시크릿 검사)
- 라이센스 검사
- 빌드/패키징
- 커버리지/품질 기준(선택)

### CI 실패 대응

| 실패 유형 | 대응 |
|-----------|------|
| 포맷/린트 | 자동 수정 도구 실행 후 커밋 |
| Unit/Integration 테스트 | 실패 원인 분석 → 코드 수정 → 재실행 |
| Contract 테스트 | 계약 문서와 구현 불일치 확인 → 문서 또는 코드 수정 |
| 보안 스캐닝 | Critical/High 즉시 대응. 취약 의존성 업데이트 또는 대체 |
| 라이센스 검사 | 라이센스 정책 위반 의존성 제거 또는 대체 |
| 아키텍처 규칙 검사 | 레이어 의존 위반 수정 (헥사고날/FSD 의존 방향 확인) |
| 빌드 실패 | 컴파일/번들링 오류 수정 |

---

## PR 템플릿

```markdown
### PR 요약
- 참조 TASK: `TASK-xxxx-slug`
- 참조 DESIGN: `DESIGN-xxxx-slug` (계약/설계 변경 포함 시)
- 변경 유형: `Feature | Fix | Refactor | Docs`

### 변경 내용
- 무엇을 변경했나:
- 왜 변경했나:

### 계약/스키마 변경
- [ ] 없음
- [ ] 있음 → 링크: API / 이벤트 / DB 스키마

### 테스트
- [ ] Unit
- [ ] Integration
- [ ] Contract
- [ ] E2E
- 실행 방법:

### AI 생성 코드 확인
- [ ] 환각 검증(존재하지 않는 API/라이브러리 호출 없음)
- [ ] 로직 정확성 확인(경계 조건/동시성)
- [ ] 보안 확인(입력 검증/시크릿/권한)
- [ ] 라이센스 호환성 확인

### 체크리스트
- [ ] 코드 가이드 준수(레이어 의존)
- [ ] 서드파티 의존성 정책 준수
- [ ] CI 게이트 통과
- [ ] 문서(DESIGN/TASK) 업데이트
```

---

## 저장소 구조

### 백엔드 (헥사고날 아키텍처)

```
/src
  /domain                          ← 헥사고날 Domain 레이어 (순수 도메인, 외부 의존 금지)
    /model, /service, /policy
  /application                     ← 헥사고날 Application 레이어 (유즈케이스 오케스트레이션)
    /port
      /in   (use case interfaces)
      /out  (repository, publisher, client interfaces)
    /usecase
  /adapter                         ← 헥사고날 Adapter 레이어 (포트 구현, 외부 연동)
    /in
      /web   (REST/gRPC)
      /consumer (MQ)
    /out
      /persistence (DB impl)
      /external (HTTP client impl)
      /publisher (event impl)
/infra                             ← 환경 설정/드라이버 (Adapter가 사용하는 기술 세부)
  /config, /db, /clients
/test
  /unit, /integration, /contract, /e2e
```

> `/infra`는 헥사고날의 Adapter가 의존하는 기술 인프라(DB 드라이버 설정, HTTP 클라이언트 설정, 환경 변수 등)를 담는다. Adapter가 비즈니스 로직과 기술 세부를 연결하는 포트 구현이라면, `/infra`는 그 기술 세부의 초기화/설정을 분리한 것이다.

### 프론트엔드 (Feature-Sliced Design)

```
/src
  /app          (앱 초기화, 프로바이더, 글로벌 스타일, 라우팅)
  /pages        (라우트별 페이지 컴포넌트, 페이지 레이아웃)
  /widgets      (독립적 UI 블록, 여러 feature/entity를 조합)
  /features     (사용자 시나리오 단위 기능: UI + 모델 + API)
  /entities     (비즈니스 엔티티: 모델, API, UI 표현)
  /shared       (공통 UI 컴포넌트, 유틸, 타입, API 클라이언트, 설정)
```

### 인프라 (Kubernetes)

```
/infra
  /k8s          (매니페스트 또는 Helm 차트)
  /docker       (Dockerfile, docker-compose)
  /terraform    (IaC, 필요 시)
```
