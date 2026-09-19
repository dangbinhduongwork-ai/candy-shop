import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShopSettings } from '../context/ShopSettingsContext';
import ReCaptchaWidget from '../components/ReCaptchaWidget';

/**
 * LoginPage — handles user login with email, password, and Google reCAPTCHA v2.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const { settings } = useShopSettings();
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [captchaToken, setCaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    if (!captchaToken) {
      setServerError('Vui lòng hoàn thành xác thực mã CAPTCHA bên dưới.');
      return;
    }

    setLoading(true);
    try {
      await login({ ...formData, captchaToken });
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      const errData = err.response?.data;
      const errorMsg = errData?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setServerError(errorMsg);

      // Reset captcha widget since each token is one-time use
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  // Check if error is related to IP lockout
  const isLockoutError = serverError.toLowerCase().includes('tạm khóa') || serverError.toLowerCase().includes('khóa trong');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🍩</span>
          <h1>Đăng nhập</h1>
          <p>Chào mừng bạn quay lại {settings.shopName || 'Nguyen Huong Grocery Store'}!</p>
        </div>


        <form onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className={`alert ${isLockoutError ? 'alert-lockout' : 'alert-error'}`}>
              <span className="alert-icon">{isLockoutError ? '⏳' : '⚠️'}</span>
              <div className="alert-body">
                <strong>{isLockoutError ? 'Tài Khoản Tạm Thời Bị Giới Hạn' : 'Đăng Nhập Thất Bại'}</strong>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Google reCAPTCHA v2 Checkbox Widget */}
          <div className="form-group recaptcha-form-group">
            <ReCaptchaWidget
              ref={recaptchaRef}
              onChange={(token) => {
                setCaptchaToken(token);
                setServerError('');
              }}
              onExpired={() => setCaptchaToken('')}
              onError={() => {
                setCaptchaToken('');
                setServerError('Không thể tải mã bảo vệ reCAPTCHA. Vui lòng kiểm tra kết nối mạng.');
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !captchaToken}
            title={!captchaToken ? 'Vui lòng xác thực CAPTCHA để tiếp tục' : 'Bấm để đăng nhập'}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="link">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
