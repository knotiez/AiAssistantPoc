# Order API 가이드

## 주문 생성
POST /api/orders

## 요청 필드
- productId
- quantity

## 권한
인증된 사용자만 가능

## 응답
- 201 Created
- 400 Bad Request

## 비고
권한 세부 기준은 정책 문서를 따른다.
