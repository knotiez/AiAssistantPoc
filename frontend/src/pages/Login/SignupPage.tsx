import { useState, useEffect } from 'react';

import { NavLink } from 'react-router-dom';
import './LoginPage.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName('');
    setPosition('');
    setDepartment('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setSuccess('');
  }, []);

  const showNotification = (message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    } else {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !position || !department || !email || !password || !confirmPassword) {
      showNotification('모든 필드를 입력해주세요', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showNotification('비밀번호가 일치하지 않습니다', 'error');
      return;
    }
    
    showNotification('회원가입 성공!', 'success');
    console.log('회원가입 시도:', { name, position, department, email, password });
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">회원가입</h1>
          <p className="login-subtitle">새 계정을 만드세요</p>
        </div>

        {error && <div className="notification error">{error}</div>}
        {success && <div className="notification success">{success}</div>}

        <div className="login-content">
          <form onSubmit={handleSignupSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">이름</label>
              <input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position" className="form-label">직급</label>
              <select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="form-input"
                required
              >
                <option value="">직급 선택</option>
                <option value="인턴">인턴</option>
                <option value="사원">사원</option>
                <option value="주임">주임</option>
                <option value="대리">대리</option>
                <option value="과장">과장</option>
                <option value="부장">부장</option>
                <option value="이사">이사</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department" className="form-label">부서</label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-input"
                required
              >
                <option value="">부서 선택</option>
                <option value="개발팀">개발팀</option>
                <option value="디자인팀">디자인팀</option>
                <option value="마케팅팀">마케팅팀</option>
                <option value="영업팀">영업팀</option>
                <option value="인사팀">인사팀</option>
                <option value="재무팀">재무팀</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">이메일</label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">비밀번호</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">비밀번호 확인</label>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="login-button">
              사용자 등록
            </button>
            <NavLink to="/login" className="toggle-auth-btn">
            로그인
            </NavLink>
          </form>
        </div>
      </div>
    </div>
  );
}
