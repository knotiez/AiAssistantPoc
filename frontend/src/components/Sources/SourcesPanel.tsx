import { useRef, useState, useEffect } from 'react';

// Material Design 아이콘 임포트
import { MdAdd, MdChevronLeft, MdChevronRight, MdRefresh, MdDelete } from 'react-icons/md';
import './SourcesPanel.css';

// RAG 소스 타입 정의
interface RagSource {
    filePath: string;
    title: string;
    docType: string;
    updatedAt: string;
    chunkCount: number;
}

/**
 * SourcesPanel 컴포넌트 - 왼쪽 소스 관리 패널
 * 
 * 기능:
 * - 소스 추가 버튼
 * - 접기/펼치기 기능 (320px ↔ 80px)
 * - 소스 목록 표시 (현재는 빈 상태)
 * 
 * 상태:
 * - isCollapsed: 패널 접힘 여부 (boolean)
 * 
 * 동작:
 * - 접기 버튼 클릭 시 isCollapsed 토글
 * - CSS 클래스 'collapsed' 추가/제거로 width 변경
 * - Grid가 자동으로 재배치되어 ChatPanel 확장
 */
export const SourcesPanel = () => {
    // 패널 접힘 상태 관리 (기본값: false = 펼쳐진 상태)
    const [isCollapsed, setIsCollapsed] = useState(false);

    // 선택된 파일 목록 상태
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // 업로드 중 상태
    const [isUploading, setIsUploading] = useState(false);

    // RAG에 저장된 파일 목록
    const [ragSources, setRagSources] = useState<RagSource[]>([]);

    // 숨겨진 input 요소를 참조하기 위한 ref
    const folderInputRef = useRef<HTMLInputElement>(null);

    // 폴더 선택 버튼 클릭 핸들러
    const handleFolderSelect = () => {
        // 숨겨진 input 요소를 클릭하여 폴더 선택 창 열기
        folderInputRef.current?.click();
    };

    // 폴더가 선택되었을 때 실행되는 핸들러
    const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            // FileList를 배열로 변환
            const newFileArray = Array.from(files);

            // 기존 파일과 새 파일을 병합 (중복 제거)
            // 파일의 고유성은 webkitRelativePath 또는 name으로 판단
            const mergedFiles = [...selectedFiles];

            newFileArray.forEach(newFile => {
                // webkitRelativePath가 있으면 사용, 없으면 name 사용
                const newFilePath = (newFile as any).webkitRelativePath || newFile.name;

                // 기존 파일 중에 같은 경로의 파일이 있는지 확인
                const isDuplicate = mergedFiles.some(existingFile => {
                    const existingFilePath = (existingFile as any).webkitRelativePath || existingFile.name;
                    return existingFilePath === newFilePath;
                });

                // 중복되지 않으면 추가
                if (!isDuplicate) {
                    mergedFiles.push(newFile);
                }
            });

            setSelectedFiles(mergedFiles);
            console.log('선택된 파일 개수:', mergedFiles.length);
            console.log('새로 추가된 파일:', mergedFiles.length - selectedFiles.length);
        }
        // input value를 초기화하여 같은 폴더를 다시 선택할 수 있도록 함
        event.target.value = '';
    };

    // RAG 소스 목록 가져오기
    const fetchRagSources = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/ingest/sources');
            const data = await response.json();
            if (data.success) {
                setRagSources(data.sources);
            }
        } catch (error) {
            console.error('RAG 소스 로드 실패:', error);
        }
    };

    // RAG 소스 목록 삭제
    const deleteAllRagSources = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/ingest/DeleteAll', {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setRagSources([]);
            }
        } catch (error) {
            console.error('RAG 소스 삭제 실패:', error);
        }
    };

    // 컴포넌트 마운트 시 RAG 소스 목록 로드
    useEffect(() => {
        fetchRagSources();
    }, []);

    /**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes 바이트 단위 파일 크기
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // SourcesPanel.tsx에 추가
    const uploadFilesToBackend = async (files: File[]) => {
        const formData = new FormData();

        // 모든 파일을 FormData에 추가
        files.forEach((file) => {
            formData.append('files', file);  // 'files'라는 키로 여러 파일 추가
        });

        try {
            const response = await fetch('http://localhost:3000/api/ingest', {
                method: 'POST',
                body: formData,  // FormData 그대로 전송
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} `);
            }

            const result = await response.json();
            console.log('백엔드 응답:', result);
            return result;
        } catch (error) {
            console.error('업로드 실패:', error);
            throw error;
        }
    };


    return (
        // 조건부 클래스: isCollapsed가 true면 'collapsed' 클래스 추가
        <div className={`sources-panel panel ${isCollapsed ? 'collapsed' : ''}`}>
            {/* 패널 헤더 */}
            <div className="panel-header">
                <h2>출처</h2>

                {/* 숨겨진 파일 input 요소 - 폴더 선택용 */}
                <input
                    ref={folderInputRef}
                    type="file"
                    // @ts-ignore - webkitdirectory는 TypeScript에서 공식 지원 안 됨
                    webkitdirectory="true"
                    directory="true"
                    style={{ display: 'none' }}
                    onChange={handleFolderChange}
                />

                <div className="panel-header-actions">
                    {/* 폴더 선택 버튼 */}
                    {!isCollapsed && (
                        <button className="btn-add-source-header" onClick={handleFolderSelect}>
                            <MdAdd size={18} />
                            <span>폴더 추가</span>
                        </button>
                    )}

                    {/* 접기/펼치기 버튼 */}
                    <button
                        className="btn-collapse"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? '펼치기' : '접기'}
                    >
                        {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                    </button>
                </div>
            </div>

            {/* 패널 본문: 접힌 상태가 아닐 때만 표시 */}
            {!isCollapsed && (
                <div className="panel-body">
                    {/* 상단 영역: 선택된 파일 */}
                    <div className="panel-top-section">
                        {/* 선택된 파일 목록 */}
                        {selectedFiles.length > 0 && (
                            <div className="sources-list">
                                <div className="sources-list-header">
                                    {/* RAG에 추가 버튼 - 헤더 왼쪽 */}
                                    <button
                                        className="btn-add-to-rag-compact"
                                        disabled={isUploading}
                                        onClick={async () => {
                                            setIsUploading(true);
                                            try {
                                                const result = await uploadFilesToBackend(selectedFiles);
                                                if (result.success) {
                                                    alert(`✅ 성공!\n${result.message} \n처리된 파일: ${result.filesProcessed}/${result.totalFiles}`);
                                                    setSelectedFiles([]);
                                                    await fetchRagSources();
                                                } else {
                                                    const failedList = result.failedFiles?.map((f: any) => f.filename).join('\n') || '';
                                                    alert(`⚠️ 일부 실패\n${result.message}\n\n실패한 파일:\n${failedList}`);
                                                    await fetchRagSources();
                                                }
                                            } catch (error: any) {
                                                alert(`❌ RAG 추가 실패\n${error.message || '알 수 없는 오류'}`);
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }}
                                    >
                                        <span>{isUploading ? '⏳ 처리 중...' : '📚 RAG에 추가'}</span>
                                    </button >
                                    <span className="file-count">{selectedFiles.length}개 파일</span>
                                </div >
                                <div className="sources-list-items">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="source-item">
                                            <span className="file-icon">📄</span>
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{formatFileSize(file.size)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div >
                        )}
                    </div >

                    {/* 중간 고정 헤더: RAG에 저장된 파일 */}
                    < div className="rag-sources-header-fixed" >
                        <div className="rag-header-left">
                            <span className="rag-sources-title">📚 RAG에 저장된 파일</span>
                            <button
                                className="btn-refresh-rag"
                                onClick={fetchRagSources}
                                title="목록 새로고침"
                            >
                                <MdRefresh size={16} />
                            </button>
                            <button
                                className="btn-deleteAll-rag"
                                onClick={deleteAllRagSources}
                                title="전체 삭제"
                            >
                                <MdDelete size={16} />
                            </button>
                        </div>
                        <span className="rag-file-count">{ragSources.length}개</span>
                    </div >

                    {/* 하단 영역: RAG 저장된 파일 목록 */}
                    < div className="panel-bottom-section" >
                        {
                            ragSources.length > 0 ? (
                                <div className="rag-sources-list">
                                    {ragSources.map((source, index) => (
                                        <div key={index} className="rag-source-item">
                                            <div className="rag-source-main">
                                                <span className="file-icon">📄</span>
                                                <span className="rag-file-name" title={source.title}>
                                                    {source.title}
                                                </span>
                                                <span className="rag-chunk-count">
                                                    {source.chunkCount} chunks
                                                </span>
                                                <span>•</span>
                                                <span className="rag-updated-date">
                                                    {source.updatedAt}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rag-sources-empty">
                                    저장된 파일이 없습니다
                                </div>
                            )
                        }
                    </div >
                </div >
            )}
        </div >
    );
};
