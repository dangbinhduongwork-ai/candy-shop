import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword, uploadAvatar } from '../api/userService';

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading, updateUserState, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility states
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Avatar upload / preview state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // UI status states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Errors & Toast messages
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load user profile details
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      try {
        setLoadingProfile(true);
        const data = await getUserProfile();
        setProfileForm({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
        updateUserState(data);
      } catch (err) {
        showToast(err.response?.data?.message || 'Không thể tải thông tin tài khoản', 'error');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, updateUserState]);

  // === AVATAR UPLOAD HANDLERS ===
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (<= 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh không được vượt quá 5MB', 'error');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Định dạng ảnh không được hỗ trợ (chỉ nhận JPG, PNG, WEBP, GIF)', 'error');
      return;
    }

    setSelectedAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleCancelAvatar = () => {
    setSelectedAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatarFile) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', selectedAvatarFile);

      const updatedUser = await uploadAvatar(formData);
      updateUserState(updatedUser);
      setSelectedAvatarFile(null);
      setAvatarPreview(null);
      showToast('Cập nhật ảnh đại diện thành công! ✨', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // === BASIC PROFILE UPDATE HANDLER ===
  const validateProfile = () => {
    const errs = {};
    if (!profileForm.fullName.trim()) {
      errs.fullName = 'Họ và tên không được để trống';
    } else if (profileForm.fullName.trim().length > 100) {
      errs.fullName = 'Họ và tên tối đa 100 ký tự';
    }

    if (profileForm.phone.trim()) {
      const vnPhoneRegex = /^(0|\+84|84)[3|5|7|8|9][0-9]{8}$/;
      if (!vnPhoneRegex.test(profileForm.phone.trim())) {
        errs.phone = 'Số điện thoại không đúng định dạng VN (VD: 0912345678)';
      }
    }

    if (profileForm.address.trim() && profileForm.address.trim().length > 500) {
      errs.address = 'Địa chỉ tối đa 500 ký tự';
    }

    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      setSubmittingProfile(true);
      const payload = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || null,
        address: profileForm.address.trim() || null,
      };

      const updatedUser = await updateUserProfile(payload);
      updateUserState(updatedUser);
      showToast('Cập nhật thông tin cá nhân thành công! 🎉', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Cập nhật thông tin thất bại';
      showToast(msg, 'error');
    } finally {
      setSubmittingProfile(false);
    }
  };

  // === PASSWORD CHANGE HANDLER ===
  const validatePassword = () => {
    const errs = {};
    if (!passwordForm.oldPassword) {
      errs.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword) {
      errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errs.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    } else if (passwordForm.newPassword === passwordForm.oldPassword) {
      errs.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    if (!passwordForm.confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'Xác nhận mật khẩu mới không khớp';
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setSubmittingPassword(true);
      const res = await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      showToast(res.message || 'Đổi mật khẩu thành công! Mật khẩu mới đã được kích hoạt. 🔐', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.';
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('hiện tại')) {
        setPasswordErrors((prev) => ({ ...prev, oldPassword: msg }));
      }
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Get current avatar url
  const currentAvatar = avatarPreview || user?.avatarUrl || null;

  if (authLoading || loadingProfile) {
    return (
      <div className="profile-loading-screen">
        <div className="sweet-spinner"></div>
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* Toast notification */}
      {toastMessage && (
        <div className={`profile-toast-box ${toastMessage.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span className="toast-icon">{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
          <span className="toast-text">{toastMessage.message}</span>
        </div>
      )}

      <div className="profile-container">
        {/* Profile Hero / Header Banner */}
        <div className="profile-hero-card">
          <div className="profile-hero-content">
            <div className="profile-avatar-wrapper">
              <div 
                className="profile-avatar-circle" 
                onClick={handleAvatarClick} 
                title="Bấm vào để đổi ảnh đại diện"
              >
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="profile-avatar-img" />
                ) : (
                  <span className="profile-avatar-initial">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
                <div className="avatar-hover-overlay">
                  <span>📷</span>
                  <small>Đổi ảnh</small>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
              />
            </div>

            <div className="profile-user-summary">
              <div className="profile-title-row">
                <h1 className="profile-display-name">{user?.fullName || 'Người Dùng'}</h1>
                <span className={`profile-role-badge ${user?.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-customer'}`}>
                  {user?.role === 'ROLE_ADMIN' ? '👑 Quản Trị Viên' : '🍬 Khách Hàng Thân Thiết'}
                </span>
              </div>
              <p className="profile-email-meta">
                <span>📧 {user?.email}</span>
                {user?.phone && <span> • 📞 {user.phone}</span>}
              </p>

              {/* Avatar Save / Cancel buttons when previewing */}
              {selectedAvatarFile && (
                <div className="avatar-action-bar">
                  <span className="avatar-preview-tag">✨ Đã chọn ảnh mới</span>
                  <button
                    type="button"
                    className="btn btn-save-avatar"
                    onClick={handleSaveAvatar}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? 'Đang lưu ảnh...' : 'Lưu ảnh đại diện'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel-avatar"
                    onClick={handleCancelAvatar}
                    disabled={uploadingAvatar}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="profile-tabs-nav">
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="tab-btn-icon">👤</span>
              <span>Thông Tin Cá Nhân</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <span className="tab-btn-icon">🔒</span>
              <span>Đổi Mật Khẩu</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Profile Information */}
        {activeTab === 'profile' && (
          <div className="profile-content-card">
            <div className="card-header-group">
              <h2 className="card-section-title">
                <span>📝</span> Cập Nhật Thông Tin Cá Nhân
              </h2>
              <p className="card-section-subtitle">
                Quản lý họ tên, số điện thoại liên hệ và địa chỉ nhận hàng giao tận nơi.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form-layout">
              <div className="form-grid-two-col">
                {/* Full Name */}
                <div className="form-group-item">
                  <label htmlFor="fullName" className="form-label-custom">
                    Họ và Tên <span className="text-danger">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-field-icon">👤</span>
                    <input
                      id="fullName"
                      type="text"
                      className={`form-input-custom ${profileErrors.fullName ? 'input-error' : ''}`}
                      placeholder="VD: Nguyễn Văn A"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    />
                  </div>
                  {profileErrors.fullName && (
                    <span className="field-error-msg">{profileErrors.fullName}</span>
                  )}
                </div>

                {/* Email (Readonly) */}
                <div className="form-group-item">
                  <label htmlFor="email" className="form-label-custom">
                    Địa Chỉ Email <span className="readonly-lock-tag">🔒 Không thể đổi</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-field-icon">📧</span>
                    <input
                      id="email"
                      type="email"
                      className="form-input-custom form-input-readonly"
                      value={profileForm.email}
                      readOnly
                      title="Email dùng làm tên đăng nhập tài khoản nên không thể tự thay đổi"
                    />
                  </div>
                  <span className="field-hint-msg">
                    ℹ️ Email dùng làm tên đăng nhập tài khoản, để bảo mật không cho phép sửa trực tiếp.
                  </span>
                </div>

                {/* Phone */}
                <div className="form-group-item">
                  <label htmlFor="phone" className="form-label-custom">
                    Số Điện Thoại
                  </label>
                  <div className="input-with-icon">
                    <span className="input-field-icon">📞</span>
                    <input
                      id="phone"
                      type="tel"
                      className={`form-input-custom ${profileErrors.phone ? 'input-error' : ''}`}
                      placeholder="VD: 0912345678 hoặc +84912345678"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  {profileErrors.phone ? (
                    <span className="field-error-msg">{profileErrors.phone}</span>
                  ) : (
                    <span className="field-hint-msg">
                      Dùng để shipper liên hệ giao hàng bánh kẹo nhanh chóng.
                    </span>
                  )}
                </div>

                {/* Role indicator */}
                <div className="form-group-item">
                  <label className="form-label-custom">Loại Tài Khoản</label>
                  <div className="role-readonly-box">
                    <span>{user?.role === 'ROLE_ADMIN' ? '👑 Quản Trị Viên Hệ Thống' : '🍬 Tài Khoản Khách Hàng'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-group-item full-width-item">
                <label htmlFor="address" className="form-label-custom">
                  Địa Chỉ Nhận Hàng Mặc Định
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className={`form-textarea-custom ${profileErrors.address ? 'input-error' : ''}`}
                  placeholder="VD: Số 509 thôn 9, Xã Suối Hai, Huyện Ba Vì, Hà Nội..."
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                />
                {profileErrors.address ? (
                  <span className="field-error-msg">{profileErrors.address}</span>
                ) : (
                  <span className="field-hint-msg">
                    Địa chỉ này sẽ được tự động điền sẵn khi bạn tiến hành thanh toán đơn hàng.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-action-row">
                <button
                  type="submit"
                  className="btn btn-primary-sweet"
                  disabled={submittingProfile}
                >
                  {submittingProfile ? (
                    <>
                      <span className="btn-spinner"></span> Đang lưu thay đổi...
                    </>
                  ) : (
                    '💾 Lưu Thay Đổi Thông Tin'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'password' && (
          <div className="profile-content-card">
            <div className="card-header-group">
              <h2 className="card-section-title">
                <span>🔐</span> Đổi Mật Khẩu Tài Khoản
              </h2>
              <p className="card-section-subtitle">
                Để bảo vệ an toàn cho tài khoản của bạn, vui lòng nhập mật khẩu cũ để xác thực trước khi thiết lập mật khẩu mới.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="profile-form-layout password-form-max">
              {/* Old Password */}
              <div className="form-group-item">
                <label htmlFor="oldPassword" className="form-label-custom">
                  Mật Khẩu Hiện Tại <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-field-icon">🔑</span>
                  <input
                    id="oldPassword"
                    type={showOldPass ? 'text' : 'password'}
                    className={`form-input-custom ${passwordErrors.oldPassword ? 'input-error' : ''}`}
                    placeholder="Nhập mật khẩu hiện tại của bạn"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowOldPass(!showOldPass)}
                    title={showOldPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showOldPass ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <span className="field-error-msg">{passwordErrors.oldPassword}</span>
                )}
              </div>

              {/* New Password */}
              <div className="form-group-item">
                <label htmlFor="newPassword" className="form-label-custom">
                  Mật Khẩu Mới <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-field-icon">✨</span>
                  <input
                    id="newPassword"
                    type={showNewPass ? 'text' : 'password'}
                    className={`form-input-custom ${passwordErrors.newPassword ? 'input-error' : ''}`}
                    placeholder="Tối thiểu 6 ký tự"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPass(!showNewPass)}
                    title={showNewPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showNewPass ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordErrors.newPassword ? (
                  <span className="field-error-msg">{passwordErrors.newPassword}</span>
                ) : (
                  <span className="field-hint-msg">
                    Mật khẩu mới phải có ít nhất 6 ký tự và khác mật khẩu hiện tại.
                  </span>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="form-group-item">
                <label htmlFor="confirmPassword" className="form-label-custom">
                  Xác Nhận Mật Khẩu Mới <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-field-icon">🛡️</span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPass ? 'text' : 'password'}
                    className={`form-input-custom ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Nhập lại mật khẩu mới vừa nhập"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    title={showConfirmPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPass ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <span className="field-error-msg">{passwordErrors.confirmPassword}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-action-row">
                <button
                  type="submit"
                  className="btn btn-primary-sweet"
                  disabled={submittingPassword}
                >
                  {submittingPassword ? (
                    <>
                      <span className="btn-spinner"></span> Đang xác thực & đổi mật khẩu...
                    </>
                  ) : (
                    '🔐 Cập Nhật Mật Khẩu Mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
