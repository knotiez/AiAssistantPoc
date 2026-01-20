-- RAG 설정 카테고리
INSERT INTO rag_setting_category (category_key, category_name, display_order)
VALUES
('api_key', 'API Key 설정', 1),
('metadata', '메타데이터 생성', 2),
('chunking', 'Chunking 전략', 3),
('embedding', 'Embedding', 4),
('vector_store', 'Vector Store', 5),
('chat', '채팅 및 검색', 6);



-- 2. 옵션 (Option)

-- [1] API Key 설정 (두 개의 중분류로 분리: OpenAI, Unstructured)
-- Option 1: OpenAI
INSERT INTO rag_setting_option (setting_option_id, setting_category_id, option_key, option_name, option_type, is_active, display_order) VALUES
(1, 1, 'api_openai', 'OpenAI API', 'FORM', 1, 1);

-- Option 2: Unstructured (선택사항)
INSERT INTO rag_setting_option (setting_option_id, setting_category_id, option_key, option_name, option_type, is_active, display_order) VALUES
(2, 1, 'api_unstructured', 'Unstructured API (선택사항)', 'FORM', 1, 2);


-- [2]Metadata Options
INSERT INTO rag_setting_option
(setting_category_id, option_key, option_name, option_type, is_active, display_order)
VALUES
((SELECT setting_category_id FROM rag_setting_category WHERE category_key = 'metadata'),
 'RULE_BASED', '규칙 기반 (개발자 정의)', 'RADIO', 1, 1),

((SELECT setting_category_id FROM rag_setting_category WHERE category_key = 'metadata'),
 'OPENAI_BASED', 'OpenAI 기반', 'RADIO', 1, 2),

((SELECT setting_category_id FROM rag_setting_category WHERE category_key = 'metadata'),
 'LMSTUDIO_BASED', 'LM Studio 기반', 'RADIO', 1, 3);


-- [3] Chunking Options
INSERT INTO rag_setting_option (setting_option_id, setting_category_id, option_key, option_name, option_type, is_active, display_order, created_at, updated_at) VALUES
(5, 3, 'markdown_chunking', 'Markdown Splitter', 'RADIO', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 3, 'unstructured_chunking', 'Unstructured.io', 'RADIO', 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [4] Embedding Options
INSERT INTO rag_setting_option (setting_option_id, setting_category_id, option_key, option_name, option_type, is_active, display_order, created_at, updated_at) VALUES
(7, 4, 'openai_embedding', 'OpenAI Embeddings', 'RADIO', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 4, 'lmstudio_embedding', 'LM Studio (Local)', 'RADIO', 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [5] Vector Store Options
INSERT INTO rag_setting_option (setting_option_id, setting_category_id, option_key, option_name, option_type, is_active, display_order, created_at, updated_at) VALUES
(9, 5, 'chroma_store', 'ChromaDB', 'RADIO', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [6] Chat Options
INSERT INTO rag_setting_option (setting_option_id, setting_category_id, option_key, option_name, option_type, is_active, display_order, created_at, updated_at) VALUES
(10, 6, 'openai_chat', 'OpenAI Chat', 'RADIO', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 6, 'lmstudio_chat', 'LM Studio Chat', 'RADIO', 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- 3. 파라미터 (Param)

-- [API Key] Params
-- 1. OpenAI Option (ID: 1)
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(1, 'openai_api_key', 'API Key', 'STRING', '', '', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Unstructured Option (ID: 2) -> API Key, API URL
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(2, 'unstructured_api_key', 'API Key', 'STRING', '', '', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'unstructured_api_url', 'API URL', 'STRING', 'https://api.unstructuredapp.io', 'https://api.unstructuredapp.io', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- [Metadata - LLM] Params
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(4, 'metadata_model', 'AI Model', 'STRING', 'gpt-4o-mini', 'gpt-4o-mini', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'metadata_prompt', 'System Prompt', 'TEXT', 'You are a professional librarian.', 'You are a professional librarian.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [Chunking - Unstructured] Params
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(6, 'unstructured_strategy', 'Strategy', 'STRING', 'by_title', 'by_title', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'unstructured_max_characters', 'Max Characters', 'NUMBER', '1000', '1000', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'unstructured_overlap', 'Overlap', 'NUMBER', '200', '200', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [Embedding - OpenAI] Params
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(7, 'embedding_openai_model', 'Model Name', 'STRING', 'text-embedding-3-small', 'text-embedding-3-small', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [Embedding - LM Studio] Params
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(8, 'embedding_lmstudio_model', 'Model Name', 'STRING', 'nomic-embed-text-v1.5', 'nomic-embed-text-v1.5', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'lmstudio_api_url', 'API URL', 'STRING', 'http://localhost:1234/v1', 'http://localhost:1234/v1', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [Vector Store - Chroma] Params
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(9, 'chroma_url', '접속 URL', 'STRING', 'http://localhost:8000', 'http://localhost:8000', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'chroma_collection_name', 'Collection Name', 'STRING', 'rag_collection', 'rag_collection', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [Chat - OpenAI] Params
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(10, 'chat_openai_model', 'Model Name', 'STRING', 'gpt-4o-mini', 'gpt-4o-mini', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'chat_temperature', 'Temperature', 'NUMBER', '0.7', '0.7', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'chat_retrieval_count', 'Retrieval Count', 'NUMBER', '5', '5', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'chat_similarity_threshold', 'Similarity Threshold', 'NUMBER', '0.5', '0.5', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- [Chat - LM Studio] Params
INSERT INTO rag_setting_param (setting_option_id, param_key, param_name, param_type, current_value, default_value, display_order, created_at, updated_at) VALUES
(11, 'chat_lmstudio_model', 'Model Name', 'STRING', 'qwen2.5-7b-instruct-1m', 'qwen2.5-7b-instruct-1m', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);