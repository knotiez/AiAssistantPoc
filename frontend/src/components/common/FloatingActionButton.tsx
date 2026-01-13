// Material Design 아이콘 임포트
import { MdAdd } from 'react-icons/md';
import './FloatingActionButton.css';

/**
 * FloatingActionButton 컴포넌트 - 플로팅 액션 버튼 (FAB)
 * 
 * 위치: 화면 우측 하단 고정 (fixed)
 * 용도: 메모 추가 기능
 * 
 * 스타일:
 * - 56px 원형 버튼
 * - 어두운 배경 + 그림자
 * - 호버 시 확대 효과
 */
export const FloatingActionButton = () => {
    return (
        <button className="fab" title="메모 추가">
            {/* + 아이콘 */}
            <MdAdd size={24} />
        </button>
    );
};
