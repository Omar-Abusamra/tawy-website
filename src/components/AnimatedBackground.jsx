import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;

    const zones = [];

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const computeZones = () => {
      zones.length = 0;
      const w = window.innerWidth;
      const h = window.innerHeight;

      const selectors = [
        '.best-sellers',
        '.best-sellers__grid',
        '.featured',
        '.featured__grid',
        '.sub-features',
        '.sub-features__covers',
        '.collection',
        '.collection__main',
        '.collection__content',
        '.collection__grid',
        'main',
        'section',
        '.home'
      ];

      const elements = Array.from(new Set(
        selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)))
      ));

      const wWidth = window.innerWidth;
      const sideWidth = Math.min(240, Math.max(120, Math.floor(wWidth * 0.18)));

      elements.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width < 100 || r.height < 100) return;
        const top = clamp(r.top, 0, h);
        const bottom = clamp(r.bottom, 0, h);
        if (bottom <= 0 || top >= h) return;
        zones.push({ xMin: 0, xMax: sideWidth, yMin: top, yMax: bottom });
        zones.push({ xMin: w - sideWidth, xMax: w, yMin: top, yMax: bottom });
      });

      if (zones.length === 0) {
        zones.push({ xMin: 0, xMax: sideWidth, yMin: 0, yMax: h });
        zones.push({ xMin: w - sideWidth, xMax: w, yMin: 0, yMax: h });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      computeZones();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', computeZones, { passive: true });

    const objects = [];
    const numObjects = 16;

    const pickZone = () => zones[Math.floor(Math.random() * zones.length)];
    const randIn = (min, max) => min + Math.random() * (max - min);

    class FloatingObject {
      constructor() {
        this.zone = pickZone();
        const pad = 16;
        this.centerX = randIn(this.zone.xMin + pad, this.zone.xMax - pad);
        this.centerY = randIn(this.zone.yMin + pad, this.zone.yMax - pad);
        this.z = Math.random() * 400 + 80;
        this.size = Math.random() * 30 + 24;
        this.rotationZ = Math.random() * Math.PI * 2;
        this.rotationSpeedZ = (Math.random() - 0.5) * 0.004; // slight boost
        // Orbital motion
        this.phaseX = Math.random() * Math.PI * 2;
        this.phaseY = Math.random() * Math.PI * 2;
        this.speedX = randIn(0.12, 0.35); // rad/s
        this.speedY = randIn(0.10, 0.30);
        const zoneWidth = this.zone.xMax - this.zone.xMin - pad * 2;
        const zoneHeight = this.zone.yMax - this.zone.yMin - pad * 2;
        this.radiusX = clamp(zoneWidth * randIn(0.15, 0.4), 18, 140);
        this.radiusY = clamp(zoneHeight * randIn(0.12, 0.35), 14, 120);
        // Gentle drift (px/s) so it moves right/left/up/down
        this.vx = randIn(-10, 10);
        this.vy = randIn(-8, 8);
        this.nextChange = 1 + Math.random() * 3; // seconds between direction changes
        this.elapsedSinceChange = 0;
        this.type = Math.floor(Math.random() * 3);
        this.opacity = Math.random() * 0.35 + 0.35;
        this.color = `hsla(${Math.random() * 40 + 205}, 70%, 62%, ${this.opacity})`;
        this.x = this.centerX;
        this.y = this.centerY;
      }

      ensureInZone() {
        if (!this.zone) this.zone = pickZone();
        const pad = 8;
        this.centerX = clamp(this.centerX, this.zone.xMin + pad, this.zone.xMax - pad);
        this.centerY = clamp(this.centerY, this.zone.yMin + pad, this.zone.yMax - pad);
        this.x = clamp(this.x, this.zone.xMin + pad, this.zone.xMax - pad);
        this.y = clamp(this.y, this.zone.yMin + pad, this.zone.yMax - pad);
      }

      update(timeSec, dt) {
        // Orbital component
        this.x = this.centerX + Math.cos(this.phaseX + timeSec * this.speedX) * this.radiusX;
        this.y = this.centerY + Math.sin(this.phaseY + timeSec * this.speedY) * this.radiusY;
        // Drift component (px/s)
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        // Occasional gentle direction change
        this.elapsedSinceChange += dt;
        if (this.elapsedSinceChange >= this.nextChange) {
          this.elapsedSinceChange = 0;
          this.nextChange = 1 + Math.random() * 3;
          this.vx = clamp(this.vx + randIn(-6, 6), -18, 18);
          this.vy = clamp(this.vy + randIn(-5, 5), -14, 14);
        }
        // Bounce softly at zone edges
        if (this.x <= this.zone.xMin + 6 || this.x >= this.zone.xMax - 6) this.vx *= -0.9;
        if (this.y <= this.zone.yMin + 6 || this.y >= this.zone.yMax - 6) this.vy *= -0.9;
        this.rotationZ += this.rotationSpeedZ;
        this.ensureInZone();
      }

      draw() {
        const scale = 1000 / (1000 + this.z);
        const x = this.x * scale;
        const y = this.y * scale;
        const size = this.size * scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotationZ);
        ctx.globalAlpha = this.opacity * scale;

        switch (this.type) {
          case 0:
            this.drawCube(size);
            break;
          case 1:
            this.drawSphere(size);
            break;
          default:
            this.drawPyramid(size);
        }

        ctx.restore();
      }

      drawCube(size) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.strokeRect(-size/2, -size/2, size, size);
        ctx.globalAlpha *= 0.6;
        ctx.fillRect(-size/2 + size/6, -size/2 + size/6, size, size);
        ctx.strokeRect(-size/2 + size/6, -size/2 + size/6, size, size);
      }

      drawSphere(size) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255,255,255,0.1)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
      }

      drawPyramid(size) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(-size/2, size/2);
        ctx.lineTo(size/2, size/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    for (let i = 0; i < numObjects; i++) {
      objects.push(new FloatingObject());
    }

    let startTs = 0;
    let lastTimeSec = 0;
    const animate = (ts) => {
      if (!startTs) startTs = ts;
      const timeSec = (ts - startTs) / 1000;
      const dt = Math.max(0.001, timeSec - lastTimeSec);
      lastTimeSec = timeSec;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      objects.sort((a, b) => b.z - a.z);
      objects.forEach(obj => { obj.update(timeSec, dt); obj.draw(); });
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', computeZones);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="animated-background">
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="background-overlay"></div>
    </div>
  );
};

export default AnimatedBackground; 