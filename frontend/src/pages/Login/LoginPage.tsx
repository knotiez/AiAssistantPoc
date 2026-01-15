import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showNotification('이메일과 비밀번호를 입력해주세요', 'error');
      return;
    }
    
    showNotification('로그인 성공!', 'success');
    console.log('로그인 시도:', { email, password });
  };

  const handleForgotPassword = () => {
    if (!email) {
      showNotification('이메일을 입력해주세요', 'error');
      return;
    }
    showNotification('비밀번호 재설정 링크를 이메일로 전송했습니다', 'success');
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">로그인</h1>
          <p className="login-subtitle">계정에 로그인하세요</p>
        </div>

        {error && <div className="notification error">{error}</div>}
        {success && <div className="notification success">{success}</div>}

        <div className="login-content">
          <form onSubmit={handleLoginSubmit} className="login-form">
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

            <button type="submit" className="login-button">
              로그인
            </button>

            <div className="bottom-actions">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="forgot-password-btn toggle-auth-btn"
              >
                비밀번호 찾기
              </button>
              <NavLink to="/signup" className="toggle-auth-btn">
                사용자 등록
              </NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
