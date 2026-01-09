# Ingestion Pipeline Design

## 1. 문서 목적

본 문서는 RAG(Retrieval-Augmented Generation) 기반 AI 시스템에서 
문서를 벡터 DB에 적재하기 위한 Ingestion 파이프라인의 설계 기준과  
각 설계 판단의 근거를 명시적으로 기록하기 위해 작성되었다.

본 단계의 목적은 문서를 단순히 벡터화하는 것이 아니라,  
질문이 들어왔을 때 “왜 이 문서 조각이 검색 결과로 나왔는지”를  
사람이 설명할 수 있는 상태로 만드는 데 있다.

이 문서에 정의된 기준은 코드 구현의 기준점으로 사용되며,  
LLM 호출 이전 단계까지만을 다룬다.

---

## 2. 설계 원칙 (Design Principles)

본 Ingestion 파이프라인은 다음 원칙을 따른다.

1. **설명 가능성 우선**
   - 모든 Chunk는 왜 생성되었는지 설명 가능해야 한다.
2. **판단의 명시화**
   - 모호한 자동 판단 대신 사람이 정의한 기준을 우선한다.
3. **지식과 모델의 분리**
   - 문서 구조 및 책임은 LLM에 위임하지 않는다.
4. **구버전 제거 금지**
   - 과거 기준도 지식으로서 보존한다.

---

## 3. 문서 로딩 전략 (Document Loading)

### 3.1 로딩 단위

- 모든 문서는 **파일 단위**로 로딩한다.
- 이 단계에서는 문서의 중요도, 최신 여부, 정확성에 대한 판단을 하지 않는다.

text
RawDocument {
  file_path
  raw_text
}

### 3.2 로딩 범위

/docs 디렉터리 하위의 모든 마크다운 파일을 대상으로 한다.

파일명 또는 내용에 따른 필터링은 수행하지 않는다.

---

## 4. 문서 타입 분류 (doc_type)

### 4.1 분류 기준

문서 타입은 디렉터리 구조를 기준으로 명시적으로 분류한다.

경로	doc_type
/docs/runbook	runbook
/docs/adr	adr
/docs/policy	policy
/docs/api	api

### 4.2 설계 의도

문서 타입은 단순 분류가 아니라 검색 전략의 기준 축이다.

질문 의도에 따라 특정 doc_type만 검색 대상이 될 수 있다.

---

## 5. 버전 관리 전략 (version)

### 5.1 기본 원칙

Ingestion 단계에서 문서를 제거하지 않는다.

최신/구버전 여부는 메타데이터로만 구분한다.

### 5.2 버전 판단 기준

파일명에 v1, old, legacy 등이 포함된 경우 → version = "old"

그 외 → version = "current"

version: "current" | "old"

### 5.3 설계 의도

과거 기준도 질의 응답 맥락에서는 유효할 수 있다.

최신 기준은 검색 또는 재랭킹 단계에서 우선순위를 갖는다.

---

## 6. 권한 메타데이터 (permission)

### 6.1 기본 원칙

권한 정보는 사람이 정의한다.

LLM 기반 권한 추론은 사용하지 않는다.

### 6.2 권한 매핑 기준 (초기값)

doc_type	permission
runbook	MANAGER 이상
adr	USER 이상
policy	USER 이상
api	USER 또는 MANAGER
permission: ["ADMIN", "MANAGER"]

### 6.3 설계 의도

권한 필터링은 검색 단계에서 수행되어야 한다.

LLM 단계에서의 필터링은 정보 노출 위험이 있다.

---

## 7. 업데이트 시점 관리 (updated_at)

### 7.1 기준

파일 수정 시간 또는 Git commit time을 사용한다.

문서 내 날짜 표기가 있을 경우 참고 정보로만 활용한다.

updated_at: YYYY-MM-DD

### 7.2 활용 목적

최신 문서 우선 검색

기준 충돌 시 판단 근거 제공

“최신 기준은 …” 형태의 답변 생성 가능

---

## 8. 청킹 전략 (Chunking Strategy)

### 8.1 기본 원칙

토큰 수 기준 청킹을 우선하지 않는다.

의미 단위 기준 청킹을 적용한다.

### 8.2 문서 타입별 청킹 기준

doc_type	청킹 기준
runbook	절차 / 섹션 단위
adr	결정 / 이유 단위
policy	조항 단위
api	엔드포인트 단위
8.3 Chunk 구조 예시
Chunk {
  text
  metadata: {
    doc_type
    version
    permission
    updated_at
    file_path
    section_title
  }
}

### 8.4 설계 의도

각 Chunk는 독립적으로 의미를 가져야 한다.

“왜 이 부분이 검색되었는지”를 설명할 수 있어야 한다.

---

## 9. Chunk ID 설계

### 9.1 ID 규칙

{file_path}#{section_title}#{index}

### 9.2 목적

검색 결과 출처 추적

디버깅 용이성

문서 변경 시 영향 범위 파악

---

## 10. Ingestion 완료 기준 (Done Criteria)

다음 질문에 명확히 답할 수 있으면 Ingestion 단계는 완료된 것으로 판단한다.

이 문서는 왜 이 doc_type으로 분류되었는가?
이 Chunk는 왜 이 단위로 잘렸는가?
이 문서는 최신 기준인가, 구버전 기준인가?
이 권한의 사용자가 이 정보를 볼 수 있는가?
이 정보는 어떤 문서에서 왔는가?

---

## 11. 본 단계에서 의도적으로 제외한 사항

LLM 호출
답변 생성
챗 UI
자동 요약

본 문서는 검색 품질과 지식 책임에만 집중한다.