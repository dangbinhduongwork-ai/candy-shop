import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerService from '../api/bannerService';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveBanners();
  }, []);

  const fetchActiveBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getActiveBanners();
      setBanners(data || []);
    } catch (err) {
      console.error('Không thể tải banner:', err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // Autoplay effect
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, currentIndex]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner) => {
    if (!banner.targetUrl) return;
    const url = banner.targetUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  // If loading or no active banners, cleanly return null (do not show empty broken area)
  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const imageUrl = currentBanner.imageUrl?.startsWith('http')
    ? currentBanner.imageUrl
    : `http://localhost:8080${currentBanner.imageUrl}`;

  return (
    <div
      className="banner-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="banner-slide"
        onClick={() => handleBannerClick(currentBanner)}
        style={{ cursor: currentBanner.targetUrl ? 'pointer' : 'default' }}
      >
        <img
          src={imageUrl}
          alt={currentBanner.title || 'Banner'}
          className="banner-slide-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=1600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay & Content */}
        <div className="banner-slide-overlay">
          {currentBanner.title && (
            <div className="banner-caption">
              <h2 className="banner-caption-title">{currentBanner.title}</h2>
              {currentBanner.targetUrl && (
                <button className="banner-cta-btn" onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick(currentBanner);
                }}>
                  Khám Phá Ngay ✨
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows (if > 1 banner) */}
      {banners.length > 1 && (
        <>
          <button className="carousel-nav-btn btn-prev" onClick={handlePrev} aria-label="Banner trước">
            ❮
          </button>
          <button className="carousel-nav-btn btn-next" onClick={handleNext} aria-label="Banner kế tiếp">
            ❯
          </button>

          {/* Dots Indicators */}
          <div className="carousel-dots">
            {banners.map((b, idx) => (
              <button
                key={b.id || idx}
                className={`carousel-dot ${idx === currentIndex ? 'dot-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Chuyển đến banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
