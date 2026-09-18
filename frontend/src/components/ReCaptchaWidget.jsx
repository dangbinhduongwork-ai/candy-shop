import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

/**
 * ReCaptchaWidget — Google reCAPTCHA v2 (Checkbox "Tôi không phải người máy").
 * Loads Google SDK with Vietnamese language (hl=vi), renders explicitly, and
 * exposes reset() method via ref.
 */
const ReCaptchaWidget = forwardRef(({ onChange, onExpired, onError }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // Expose imperative methods to parent component (e.g. to reset widget on submit failure)
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
          if (onExpired) onExpired();
        } catch {
          // Ignored
        }
      }
    },
    getResponse: () => {
      if (window.grecaptcha && widgetIdRef.current !== null) {
        return window.grecaptcha.getResponse(widgetIdRef.current);
      }
      return '';
    },
  }));

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.grecaptcha?.render) return;

      // Prevent re-rendering into the same container
      if (widgetIdRef.current !== null) return;

      try {
        const id = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => {
            if (onChange) onChange(token);
          },
          'expired-callback': () => {
            if (onExpired) onExpired();
          },
          'error-callback': () => {
            if (onError) onError();
          },
        });
        widgetIdRef.current = id;
        setIsReady(true);
      } catch (err) {
        console.warn('reCAPTCHA render notice:', err);
      }
    };

    // Check if grecaptcha SDK is already present
    if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    } else {
      // Define global callback if not present
      const callbackName = '__onGoogleReCaptchaLoad__';
      window[callbackName] = () => {
        if (isMounted) {
          renderWidget();
        }
      };

      // Check if script tag already exists
      let script = document.getElementById('recaptcha-script-sdk');
      if (!script) {
        script = document.createElement('script');
        script.id = 'recaptcha-script-sdk';
        script.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit&hl=vi`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        // Script exists, attach callback or wait
        const existingCallback = window[callbackName];
        window[callbackName] = () => {
          if (existingCallback) existingCallback();
          if (isMounted) renderWidget();
        };
      }
    }

    return () => {
      isMounted = false;
    };
  }, [siteKey, onChange, onExpired, onError]);

  return (
    <div className="recaptcha-wrapper">
      <div ref={containerRef} className="recaptcha-container"></div>
      {!isReady && (
        <div className="recaptcha-loading-placeholder">
          <div className="recaptcha-mini-spinner"></div>
          <span>Đang tải mã bảo vệ reCAPTCHA...</span>
        </div>
      )}
    </div>
  );
});

ReCaptchaWidget.displayName = 'ReCaptchaWidget';

export default ReCaptchaWidget;
