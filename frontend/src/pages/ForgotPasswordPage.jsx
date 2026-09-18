import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authService';
import ReCaptchaWidget from '../components/ReCaptchaWidget';

/**
 * ForgotPasswordPage — allows users to request a password reset link to their email.
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const recaptchaRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email của bạn';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Địa chỉ email không đúng định dạng';
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
      const res = await forgotPassword({ email: email.trim(), captchaToken });
      setSubmitted(true);
      setSuccessMessage(
        res.message ||
        'Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam/Rác).'
      );
    } catch (err) {
      const errData = err.response?.data;
      const errorMsg = errData?.message || 'Có lỗi xảy ra trong quá trình gửi yêu cầu. Vui lòng thử lại sau.';
      setServerError(errorMsg);

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🔑</span>
          <h1>Quên Mật Khẩu</h1>
          <p>Nhập email tài khoản của bạn để nhận liên kết khôi phục mật khẩu</p>
        </div>

        {submitted ? (
          <div className="reset-success-box">
            <div className="reset-success-icon">📬</div>
            <h3>Yêu Cầu Đã Được Gửi!</h3>
            <p className="reset-success-desc">
              {successMessage}
            </p>
            <div className="reset-instruction-tips">
              <p>💡 <strong>Mẹo nhỏ:</strong></p>
              <ul>
                <li>Liên kết đặt lại mật khẩu có hiệu lực trong <strong>15 phút</strong>.</li>
                <li>Nếu không thấy email trong hộp thư đến (Inbox), hãy kiểm tra thêm mục <strong>Thư rác (Spam/Junk)</strong>.</li>
              </ul>
            </div>
            <div className="reset-action-buttons">
              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setCaptchaToken('');
                }}
              >
                Gửi lại với email khác
              </button>
              <Link to="/login" className="btn btn-primary btn-full" style={{ textAlign: 'center', marginTop: '10px' }}>
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
                  <strong>Không thể gửi yêu cầu</strong>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Địa chỉ Email đã đăng ký</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                className={errors.email ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

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
              title={!captchaToken ? 'Vui lòng xác thực CAPTCHA để tiếp tục' : 'Bấm để gửi yêu cầu'}
            >
              {loading ? 'Đang xử lý...' : 'Gửi Liên Kết Đặt Lại Mật Khẩu'}
            </button>

            <div className="auth-links-center" style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/login" className="link" style={{ fontSize: '0.9rem' }}>
                ← Quay lại trang Đăng nhập
              </Link>
            </div>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '24px' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="link">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
