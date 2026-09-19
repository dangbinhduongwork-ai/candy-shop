import React, { useEffect, useRef } from 'react';
import { useShopSettings } from '../context/ShopSettingsContext';

/**
 * High-performance HTML5 Canvas Seasonal Visual Effects Overlay.
 * Supported effects:
 * - WINTER_SNOW: Soft drifting snowflakes with gentle sinusoidal sway
 * - SPRING_BLOSSOM: Falling pink cherry blossom & apricot flower petals with 3D rotation
 * - AUTUMN_LEAVES: Golden autumn & maple leaves fluttering downwards
 * - SUMMER_BUBBLES: Iridescent soap bubbles floating upwards with highlights
 * - CONFETTI_PARTY: Festive vibrant confetti spinning and tumbling
 * - NONE: Completely inactive / transparent
 *
 * Designed with pointer-events: none so it never interferes with user interactions.
 */
const SeasonalEffect = ({ overrideEffect = null }) => {
  const { settings, previewEffect } = useShopSettings();
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Active effect: priority goes to overrideEffect > previewEffect > settings.activeEffect > 'NONE'
  const activeEffect = overrideEffect || previewEffect || settings?.activeEffect || 'NONE';

  useEffect(() => {
    // 1. If effect is disabled or user prefers reduced motion, do nothing
    if (!activeEffect || activeEffect === 'NONE') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Number of particles tailored for 60fps on mobile & desktop
    const isMobile = width < 768;
    const particleCount = isMobile ? 35 : 65;
    const particles = [];

    // --- EFFECT INITIALIZERS ---
    if (activeEffect === 'WINTER_SNOW') {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.8 + 1.2,
          density: Math.random() * particleCount,
          vy: Math.random() * 1.4 + 0.6,
          vx: Math.random() * 0.8 - 0.4,
          opacity: Math.random() * 0.65 + 0.35,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    } else if (activeEffect === 'SPRING_BLOSSOM') {
      const blossomColors = [
        'rgba(255, 183, 197, ', // Light Cherry Blossom Pink
        'rgba(255, 140, 168, ', // Deeper Rose Pink
        'rgba(254, 215, 226, ', // Soft Petal
        'rgba(254, 240, 138, ', // Golden Apricot Petal (Hoa Mai)
      ];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 8 + 6,
          vy: Math.random() * 1.5 + 0.8,
          vx: Math.random() * 1.5 + 0.2,
          colorPrefix: blossomColors[Math.floor(Math.random() * blossomColors.length)],
          opacity: Math.random() * 0.5 + 0.45,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: Math.random() * 0.03 - 0.015,
          flip: Math.random() * Math.PI,
          flipSpeed: Math.random() * 0.03 + 0.01,
        });
      }
    } else if (activeEffect === 'AUTUMN_LEAVES') {
      const leafColors = [
        '#d97706', // Warm Amber
        '#b45309', // Deep Caramel
        '#ea580c', // Fiery Orange
        '#dc2626', // Autumn Crimson
        '#ca8a04', // Golden Ochre
      ];
      for (let i = 0; i < Math.floor(particleCount * 0.7); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 12 + 10,
          vy: Math.random() * 1.6 + 0.9,
          vx: Math.random() * 1.2 - 0.4,
          color: leafColors[Math.floor(Math.random() * leafColors.length)],
          opacity: Math.random() * 0.55 + 0.4,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: Math.random() * 0.04 - 0.02,
          sway: Math.random() * 2 + 1,
          swaySpeed: Math.random() * 0.03 + 0.015,
          swayOffset: Math.random() * Math.PI * 2,
        });
      }
    } else if (activeEffect === 'SUMMER_BUBBLES') {
      for (let i = 0; i < Math.floor(particleCount * 0.6); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 14 + 6,
          vy: -(Math.random() * 1.2 + 0.6), // Floats upwards
          vx: Math.random() * 0.8 - 0.4,
          wobbleAngle: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.03 + 0.015,
          opacity: Math.random() * 0.45 + 0.25,
        });
      }
    } else if (activeEffect === 'CONFETTI_PARTY') {
      const confettiColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          width: Math.random() * 8 + 5,
          height: Math.random() * 5 + 3,
          vy: Math.random() * 2.2 + 1.2,
          vx: Math.random() * 1.5 - 0.75,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: Math.random() * 0.08 - 0.04,
          opacity: Math.random() * 0.4 + 0.6,
        });
      }
    }

    // --- ANIMATION LOOP ---
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      if (activeEffect === 'WINTER_SNOW') {
        for (const p of particles) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.angle += p.angularSpeed;
          p.x += Math.sin(p.angle) * 0.7 + p.vx;
          p.y += p.vy;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;
        }
      } else if (activeEffect === 'SPRING_BLOSSOM') {
        for (const p of particles) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.scale(Math.cos(p.flip), 1);

          ctx.beginPath();
          ctx.fillStyle = `${p.colorPrefix}${p.opacity})`;
          // Draw organic heart/tear blossom petal shape
          ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.angle += p.rotationSpeed;
          p.flip += p.flipSpeed;
          p.x += Math.sin(p.angle) * 0.8 + p.vx;
          p.y += p.vy;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
        }
      } else if (activeEffect === 'AUTUMN_LEAVES') {
        for (const p of particles) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;

          // Stylized leaf shape using bezier curve
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
          ctx.fill();

          ctx.restore();

          p.swayOffset += p.swaySpeed;
          p.angle += p.rotationSpeed;
          p.x += Math.sin(p.swayOffset) * p.sway + p.vx;
          p.y += p.vy;

          if (p.y > height + 25) {
            p.y = -25;
            p.x = Math.random() * width;
          }
          if (p.x > width + 25) p.x = -25;
          if (p.x < -25) p.x = width + 25;
        }
      } else if (activeEffect === 'SUMMER_BUBBLES') {
        for (const p of particles) {
          ctx.save();
          p.wobbleAngle += p.wobbleSpeed;
          const wobbleX = p.x + Math.sin(p.wobbleAngle) * 3;

          // Soap bubble gradient border
          ctx.beginPath();
          ctx.arc(wobbleX, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bubble soft inner glow
          ctx.fillStyle = `rgba(224, 242, 254, ${p.opacity * 0.25})`;
          ctx.fill();

          // Bubble light reflection highlight (tiny white curved gleam)
          ctx.beginPath();
          ctx.arc(wobbleX - p.radius * 0.35, p.y - p.radius * 0.35, p.radius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.85})`;
          ctx.fill();

          ctx.restore();

          p.y += p.vy;
          p.x += p.vx;

          if (p.y < -p.radius * 2) {
            p.y = height + p.radius * 2;
            p.x = Math.random() * width;
          }
        }
      } else if (activeEffect === 'CONFETTI_PARTY') {
        for (const p of particles) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);

          ctx.restore();

          p.angle += p.rotationSpeed;
          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Pause animation when browser tab is hidden to save GPU/battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      } else {
        isRunning = true;
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      ctx.clearRect(0, 0, width, height);
    };
  }, [activeEffect]);

  if (!activeEffect || activeEffect === 'NONE') return null;

  return (
    <canvas
      ref={canvasRef}
      className="seasonal-effect-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
};

export default SeasonalEffect;
