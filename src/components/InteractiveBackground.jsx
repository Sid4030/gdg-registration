import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 22 : 45;
    const maxDistance = isMobile ? 95 : 140;

    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
    const glyphs = ['< >', '{ }', '_>', '()', 'GDG', '01', 'git', '&&'];

    // Mouse / Touch position
    const pointer = {
      x: -1000,
      y: -1000,
      radius: isMobile ? 80 : 150,
      isActive: false
    };

    // Node particles
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: 2 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.35 + Math.random() * 0.35
    }));

    // Floating GDG tech glyphs
    const techGlyphs = Array.from({ length: isMobile ? 6 : 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      text: glyphs[Math.floor(Math.random() * glyphs.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 11 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: 0.12 + Math.random() * 0.15
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.isActive = true;
    };

    const handleMouseLeave = () => {
      pointer.isActive = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.isActive = true;
      }
    };

    const handleTouchEnd = () => {
      pointer.isActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw floating tech glyphs (GDG < >, { })
      ctx.font = '600 12px "JetBrains Mono", monospace';
      techGlyphs.forEach((g) => {
        g.x += g.vx;
        g.y += g.vy;
        if (g.x < -30) g.x = width + 30;
        if (g.x > width + 30) g.x = -30;
        if (g.y < -30) g.y = height + 30;
        if (g.y > height + 30) g.y = -30;

        ctx.save();
        ctx.globalAlpha = g.alpha;
        ctx.fillStyle = g.color;
        ctx.font = `600 ${g.size}px "JetBrains Mono", monospace`;
        ctx.fillText(g.text, g.x, g.y);
        ctx.restore();
      });

      // 2. Update & Connect nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;

        // Bounce from walls
        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        // Pointer repulsion / attraction
        if (pointer.isActive) {
          const dx = pointer.x - n1.x;
          const dy = pointer.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pointer.radius) {
            const force = (1 - dist / pointer.radius) * 1.5;
            n1.x -= (dx / dist) * force * 2;
            n1.y -= (dy / dist) * force * 2;
          }
        }

        // Draw node dot
        ctx.save();
        ctx.globalAlpha = n1.alpha;
        ctx.fillStyle = n1.color;
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Connect with nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / maxDistance) * 0.22;
            ctx.strokeStyle = n1.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-bg-canvas" aria-hidden="true" />;
}
