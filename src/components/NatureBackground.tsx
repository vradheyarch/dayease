import React, { useEffect, useRef } from 'react';
import { ThemeType } from '../types';

interface NatureBackgroundProps {
  theme: ThemeType;
}

export const NatureBackground: React.FC<NatureBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle structures depending on theme
    interface RainDrop {
      x: number;
      y: number;
      len: number;
      speed: number;
      alpha: number;
      thickness: number;
    }
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
    }
    interface StreamParticle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      size: number;
      alpha: number;
      color: string;
    }
    interface Leaf {
      x: number;
      y: number;
      size: number;
      rotation: number;
      rotSpeed: number;
      speedX: number;
      speedY: number;
      color: string;
    }

    const raindrops: RainDrop[] = [];
    const ripples: Ripple[] = [];
    const streamParticles: StreamParticle[] = [];
    const leaves: Leaf[] = [];

    if (theme === 'rain') {
      for (let i = 0; i < 90; i++) {
        raindrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          len: 14 + Math.random() * 22,
          speed: 12 + Math.random() * 15,
          alpha: 0.15 + Math.random() * 0.35,
          thickness: 1 + Math.random() * 1.5,
        });
      }
    } else if (theme === 'waterfall') {
      for (let i = 0; i < 120; i++) {
        streamParticles.push({
          x: width * 0.15 + Math.random() * (width * 0.7),
          y: Math.random() * height,
          speedY: 7 + Math.random() * 11,
          speedX: (Math.random() - 0.5) * 1.2,
          size: 1.5 + Math.random() * 3,
          alpha: 0.2 + Math.random() * 0.45,
          color: Math.random() > 0.4 ? 'rgba(210, 245, 255,' : 'rgba(165, 220, 245,',
        });
      }
    } else if (theme === 'river') {
      for (let i = 0; i < 60; i++) {
        streamParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedX: 1.2 + Math.random() * 2.5,
          speedY: (Math.random() - 0.5) * 0.4,
          size: 2 + Math.random() * 4,
          alpha: 0.15 + Math.random() * 0.3,
          color: 'rgba(147, 218, 245,',
        });
      }
      for (let i = 0; i < 12; i++) {
        leaves.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 7 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          speedX: 1.0 + Math.random() * 1.2,
          speedY: Math.sin(i) * 0.4,
          color: i % 2 === 0 ? 'rgba(74, 160, 100, 0.45)' : 'rgba(205, 140, 60, 0.45)',
        });
      }
    } else if (theme === 'mist' || theme === 'sunset') {
      for (let i = 0; i < 40; i++) {
        streamParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: -0.2 - Math.random() * 0.4,
          size: 20 + Math.random() * 60,
          alpha: 0.04 + Math.random() * 0.07,
          color: theme === 'sunset' ? 'rgba(255, 180, 120,' : 'rgba(200, 220, 230,',
        });
      }
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (theme === 'rain') {
        // Draw falling drops
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.6)';
        for (let i = 0; i < raindrops.length; i++) {
          const drop = raindrops[i];
          ctx.beginPath();
          ctx.lineWidth = drop.thickness;
          ctx.strokeStyle = `rgba(190, 220, 255, ${drop.alpha})`;
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.len);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 0.8; // subtle wind angle

          if (drop.y > height - 10) {
            // Chance of ripple
            if (Math.random() > 0.65) {
              ripples.push({
                x: drop.x,
                y: height - 10 + Math.random() * 8,
                radius: 1,
                maxRadius: 8 + Math.random() * 14,
                alpha: 0.4,
              });
            }
            drop.y = -drop.len;
            drop.x = Math.random() * (width + 50);
          }
        }

        // Draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rip = ripples[i];
          ctx.beginPath();
          ctx.strokeStyle = `rgba(180, 220, 255, ${rip.alpha})`;
          ctx.lineWidth = 1.2;
          ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();

          rip.radius += 0.6;
          rip.alpha -= 0.015;
          if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
            ripples.splice(i, 1);
          }
        }
      } else if (theme === 'waterfall') {
        // Cascading streams
        for (let i = 0; i < streamParticles.length; i++) {
          const p = streamParticles[i];
          ctx.fillStyle = `${p.color} ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > height) {
            p.y = -5;
            p.x = width * 0.15 + Math.random() * (width * 0.7);
          }
        }

        // Bottom mist foam
        const mistY = height - 80;
        ctx.fillStyle = 'rgba(215, 240, 255, 0.05)';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc((width / 4) * i + Math.sin(frame * 0.02 + i) * 30, mistY, 90 + Math.cos(frame * 0.03 + i) * 20, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (theme === 'river') {
        // Flowing river current streaks
        for (let i = 0; i < streamParticles.length; i++) {
          const p = streamParticles[i];
          ctx.fillStyle = `${p.color} ${p.alpha})`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size * 3, p.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speedX;
          p.y += Math.sin(frame * 0.02 + p.x * 0.005) * 0.5;
          if (p.x > width + 20) {
            p.x = -20;
            p.y = Math.random() * height;
          }
        }

        // Floating leaves
        for (let i = 0; i < leaves.length; i++) {
          const l = leaves[i];
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.rotation);
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          l.x += l.speedX;
          l.y += Math.sin(frame * 0.01 + i) * 0.6;
          l.rotation += l.rotSpeed;
          if (l.x > width + 20) {
            l.x = -20;
            l.y = Math.random() * height;
          }
        }
      } else if (theme === 'mist' || theme === 'sunset') {
        for (let i = 0; i < streamParticles.length; i++) {
          const p = streamParticles[i];
          ctx.fillStyle = `${p.color} ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -p.size) {
            p.y = height + p.size;
            p.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  // CSS gradient backgrounds matching themes
  const getGradientClass = () => {
    switch (theme) {
      case 'rain':
        return 'from-slate-950 via-slate-900 to-sky-950';
      case 'waterfall':
        return 'from-teal-950 via-slate-900 to-emerald-950';
      case 'river':
        return 'from-sky-950 via-slate-900 to-cyan-950';
      case 'mist':
        return 'from-slate-950 via-zinc-900 to-teal-950';
      case 'sunset':
        return 'from-amber-950 via-slate-900 to-indigo-950';
      case 'clean':
      default:
        return 'from-slate-950 via-slate-900 to-slate-900';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Dynamic gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getGradientClass()} transition-colors duration-1000`} />
      
      {/* Canvas for dynamic particles (rain, waterfalls, river currents, mist) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

      {/* Decorative ambient blurred glows */}
      <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Readability & contrast overlay veil */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
    </div>
  );
};
