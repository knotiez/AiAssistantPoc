import { DocumentChunk } from "../../models/document-chunk";

/**
 * [임베딩 프로바이더 추상 클래스]
 * 
 * 이 클래스는 다양한 AI 모델(OpenAI, Google Gemini, Anthropic 등)을 
 * 동일한 방식으로 사용할 수 있게 해주는 '규격(Interface)' 역할을 합니다.
 * 모든 실제 임베딩 구현체는 이 클래스를 상속받아야 합니다.
 */
export abstract class EmbeddingProvider {
    /**
     * 문서를 읽고 의미적 특징(Vector)을 추출하여 저장합니다.
     * 
     * @param chunks - 텍스트 분할기로 쪼개진 문서 조각 배열
     * @returns - 각 청크의 metadata.embedding 필드에 숫자 배열이 채워진 동일한 배열
     */
    abstract embed(chunks: DocumentChunk[]): Promise<DocumentChunk[]>;
}
