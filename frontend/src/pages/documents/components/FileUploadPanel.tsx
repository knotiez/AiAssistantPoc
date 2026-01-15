import { useRef, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import './FileUploadPanel.css';

/**
 * FileUploadPanel 컴포넌트 - 파일 업로드 패널 (문서 관리 페이지 왼쪽)
 * 
 * 기능:
 * - 폴더 선택 및 파일 추가
 * - 선택된 파일 목록 표시
 * - RAG에 추가 버튼 (업로드 및 벡터 DB 저장)
 * 
 * Props:
 * - onUploadSuccess: 업로드 성공 시 호출되는 콜백 함수
 */

interface FileUploadPanelProps {
    onUploadSuccess: () => void;
}

export const FileUploadPanel = ({ onUploadSuccess }: FileUploadPanelProps) => {
    // 선택된 파일 목록 상태
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // 업로드 중 상태
    const [isUploading, setIsUploading] = useState(false);

    // 숨겨진 input 요소를 참조하기 위한 ref
    const folderInputRef = useRef<HTMLInputElement>(null);

    // 폴더 선택 버튼 클릭 핸들러
    const handleFolderSelect = () => {
        folderInputRef.current?.click();
    };

    // 폴더가 선택되었을 때 실행되는 핸들러
    const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const newFileArray = Array.from(files);
            const mergedFiles = [...selectedFiles];

            newFileArray.forEach(newFile => {
                const newFilePath = (newFile as any).webkitRelativePath || newFile.name;
                const isDuplicate = mergedFiles.some(existingFile => {
                    const existingFilePath = (existingFile as any).webkitRelativePath || existingFile.name;
                    return existingFilePath === newFilePath;
                });

                if (!isDuplicate) {
                    mergedFiles.push(newFile);
                }
            });

            setSelectedFiles(mergedFiles);
        }
        event.target.value = '';
    };

    // 파일 크기를 읽기 쉬운 형식으로 변환
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // 백엔드에 파일 업로드
    const uploadFilesToBackend = async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:3000/api/ingest', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('업로드 실패:', error);
            throw error;
        }
    };

    // RAG에 추가 버튼 클릭 핸들러
    const handleAddToRag = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        try {
            const result = await uploadFilesToBackend(selectedFiles);
            if (result.success) {
                alert(`RAG 저장 완료 \n처리된 파일: ${result.filesProcessed}/${result.totalFiles}`);
                setSelectedFiles([]);
                onUploadSuccess(); // 부모 컴포넌트에 성공 알림
            } else {
                alert(`❌ 실패!\n${result.message}`);
            }
        } catch (error) {
            alert('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="file-upload-panel panel">
            {/* 패널 헤더 */}
            <div className="panel-header">
                <h2>파일 선택</h2>

                {/* 숨겨진 파일 input 요소 */}
                <input
                    ref={folderInputRef}
                    type="file"
                    // @ts-ignore
                    webkitdirectory="true"
                    directory="true"
                    style={{ display: 'none' }}
                    onChange={handleFolderChange}
                />

                <div className="panel-header-actions">
                    <button className="btn-add-folder" onClick={handleFolderSelect}>
                        <MdAdd size={18} />
                        <span>폴더 추가</span>
                    </button>
                </div>
            </div>

            {/* 패널 본문 */}
            <div className="panel-body">
                {/* 선택된 파일 목록 */}
                <div className="selected-files-header">
                    <span className="selected-files-title">📁 선택된 파일</span>
                    <span className="file-count">{selectedFiles.length}개</span>
                </div>

                <div className="selected-files-content">
                    {selectedFiles.length > 0 ? (
                        <div className="selected-files-list">
                            {selectedFiles.map((file, index) => {
                                const filePath = (file as any).webkitRelativePath || file.name;
                                return (
                                    <div key={index} className="file-item">
                                        <span className="file-icon">📄</span>
                                        <span className="file-name" title={filePath}>
                                            {filePath}
                                        </span>
                                        <span className="file-size">
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            폴더를 선택하여 파일을 추가하세요
                        </div>
                    )}
                </div>

                {/* RAG에 추가 버튼 */}
                {selectedFiles.length > 0 && (
                    <div className="action-buttons">
                        <button
                            className="btn-add-to-rag"
                            onClick={handleAddToRag}
                            disabled={isUploading}
                        >
                            {isUploading ? '업로드 중...' : 'RAG에 추가'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
