---
name: local-runner
description: >
  로컬 테스트 환경 구성 가이드. local-runner 에이전트에 preload된다.
  REVIEW 산출물 승인 후 docker compose로 로컬 실행 환경을 제공한다.
user-invocable: false
---

# Local Runner

> 파이프라인 규칙, 산출물 체계, 역할, 변경 처리는 `agentic-devops` 스킬을 따른다.

- REVIEW 산출물 승인 후 실행되는 로컬 테스트 환경 구성 단계이다.
- docker compose를 사용하여 애플리케이션을 로컬에서 실행하고, 사람이 수동 테스트할 수 있게 한다.

## 실행 절차

### 1단계: 환경 확인

아래 조건을 순서대로 확인한다. 하나라도 실패하면 **SKIP 보고서**를 제출하고 종료한다.

1. Docker 설치 여부: `docker --version` 실행
2. Docker Compose 사용 가능 여부: `docker compose version` 실행
3. docker-compose 파일 존재 여부: 프로젝트 루트 및 하위 디렉터리에서 `docker-compose.yml` 또는 `docker-compose.yaml` 또는 `compose.yml` 또는 `compose.yaml` 검색

### 2단계: 컨테이너 실행

1. docker-compose 파일이 위치한 디렉터리에서 `docker compose up -d --build` 실행
2. 컨테이너 상태 확인: `docker compose ps`
3. 모든 컨테이너가 정상 기동(running/healthy)될 때까지 대기 (최대 120초)
4. 기동 실패 시 `docker compose logs`를 수집하여 보고서에 포함

### 3단계: 접속 정보 수집

1. docker-compose 파일에서 포트 매핑 정보를 파싱한다
2. 각 서비스의 접속 URL을 정리한다 (예: `http://localhost:3000`)

### 4단계: 보고

#### 정상 기동 시

```
## 로컬 테스트 환경 보고서
- 상태: 실행 중
- docker-compose 파일: (파일 경로)

### 실행 중인 서비스
| 서비스 | 상태 | 접속 URL |
|--------|------|----------|
| (서비스명) | running | http://localhost:xxxx |

### 테스트 안내
로컬 환경이 준비되었습니다. 브라우저 또는 API 클라이언트에서 위 URL로 접속하여 테스트하세요.

테스트 완료 후:
1. "테스트 완료" → 파이프라인 완료
2. "이슈 발견" → 발견한 문제를 설명하면 code-writer가 수정

환경 종료 명령: docker compose down
```

#### SKIP 시

```
## 로컬 테스트 환경 보고서
- 상태: SKIP
- 사유: (Docker 미설치 / docker-compose 파일 없음 / 기타)
- 안내: 로컬 테스트를 건너뛰고 최종 승인 단계로 진행합니다.
```

#### 기동 실패 시

```
## 로컬 테스트 환경 보고서
- 상태: 실패
- docker-compose 파일: (파일 경로)
- 실패 원인: (에러 로그 요약)
- 컨테이너 로그: (주요 에러 로그)
- 안내: docker-compose 설정 또는 코드를 수정한 후 다시 시도하세요.
```
