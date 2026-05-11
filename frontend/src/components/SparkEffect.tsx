import { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  wobble: number;
  wobbleSpeed: number;
}

export default function SparkEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const sparks: Spark[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Culori de foc: alb-galben in centru, portocaliu-amber spre exterior
    const HUES = [40, 38, 35, 45, 30, 50, 20];

    const spawnSpark = () => {
      // Spawn din mai multe puncte de-a lungul bazei
      const x = Math.random() * canvas.width;
      const y = canvas.height + 5;
      sparks.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(0.8 + Math.random() * 2.2),
        life: 0,
        maxLife: 80 + Math.random() * 140,
        size: 1 + Math.random() * 2.5,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.05,
      });
    };

    let frame = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      if (frame % 2 === 0) spawnSpark();
      if (frame % 3 === 0) spawnSpark();
      if (frame % 5 === 0) spawnSpark();

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.wobble += s.wobbleSpeed;
        s.x += s.vx + Math.sin(s.wobble) * 0.4;
        s.y += s.vy;
        s.vy *= 0.998;

        if (s.life >= s.maxLife || s.y < -10) { sparks.splice(i, 1); continue; }

        const progress = s.life / s.maxLife;
        let alpha = 0;
        if (progress < 0.08) alpha = progress / 0.08;
        else if (progress < 0.6) alpha = 1;
        else alpha = 1 - (progress - 0.6) / 0.4;

        // Centru alb-galben stralucitor, halou portocaliu
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
        glow.addColorStop(0,   `hsla(${s.hue + 20}, 100%, 98%, ${alpha})`);
        glow.addColorStop(0.2, `hsla(${s.hue}, 100%, 85%, ${alpha * 0.9})`);
        glow.addColorStop(0.5, `hsla(${s.hue - 5}, 95%, 65%, ${alpha * 0.5})`);
        glow.addColorStop(1,   `hsla(${s.hue - 10}, 90%, 50%, 0)`);

        ctx.shadowColor = `hsla(${s.hue}, 100%, 80%, ${alpha * 0.9})`;
        ctx.shadowBlur = s.size * 6;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
