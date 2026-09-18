import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../api/authService';

/**
 * ResetPasswordPage — validates token from URL and allows setting a new password.
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('Không tìm thấy mã xác thực đặt lại mật khẩu trong liên kết.');
      return;
    }

    const checkToken = async () => {
      try {
        await verifyResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        const errData = err.response?.data;
        const msg = errData?.message || 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.';
        setTokenError(msg);
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword({
        token: token.trim(),
        newPassword: formData.newPassword,
      });
      setSuccess(true);
    } catch (err) {
      const errData = err.response?.data;
      const errorMsg = errData?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🔒</span>
          <h1>Đặt Lại Mật Khẩu</h1>
          <p>Thiết lập mật khẩu mới an toàn cho tài khoản của bạn</p>
        </div>

        {verifying ? (
          <div className="reset-loading-box">
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <p>Đang kiểm tra tính hợp lệ của liên kết...</p>
          </div>
        ) : success ? (
          <div className="reset-success-box">
            <div className="reset-success-icon">🎉</div>
            <h3>Đặt Lại Mật Khẩu Thành Công!</h3>
            <p className="reset-success-desc">
              Mật khẩu mới của bạn đã được cập nhật thành công vào hệ thống.
            </p>
            <div className="reset-redirect-notice">
              Tự động chuyển hướng sang trang Đăng nhập sau <strong>{countdown}</strong> giây...
            </div>
            <div className="reset-action-buttons" style={{ marginTop: '16px' }}>
              <Link to="/login" className="btn btn-primary btn-full" style={{ textAlign: 'center' }}>
                Đăng Nhập Ngay Bây Giờ
              </Link>
            </div>
          </div>
        ) : !tokenValid ? (
          <div className="reset-invalid-box">
            <div className="reset-invalid-icon">⚠️</div>
            <h3>Liên Kết Không Khả Dụng</h3>
            <p className="reset-invalid-desc">{tokenError}</p>
            <div className="reset-instruction-tips">
              <p>📌 <strong>Nguyên nhân có thể do:</strong></p>
              <ul>
                <li>Liên kết đã quá hạn <strong>15 phút</strong> kể từ khi tạo.</li>
                <li>Mã xác thực đã được sử dụng trước đó.</li>
                <li>Đường link bị copy thiếu hoặc không chính xác.</li>
              </ul>
            </div>
            <div className="reset-action-buttons">
              <Link to="/forgot-password" className="btn btn-primary btn-full" style={{ textAlign: 'center' }}>
                Yêu Cầu Gửi Lại Liên Kết Mới
              </Link>
              <Link to="/login" className="btn btn-secondary btn-full" style={{ textAlign: 'center', marginTop: '10px' }}>
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <div className="alert-body">
                  <strong>Không thể cập nhật mật khẩu</strong>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập tối thiểu 6 ký tự"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? 'input-error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Đang lưu mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}
            </button>

            <div className="auth-links-center" style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/login" className="link" style={{ fontSize: '0.9rem' }}>
                ← Quay lại trang Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
