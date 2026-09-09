import React, { useEffect, useRef } from "react";

export function HeroBridgeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes for Sign Stream (Left)
    const signNodes = Array.from({ length: 32 }, () => ({
      x: Math.random() * (width * 0.35),
      y: Math.random() * height,
      vx: 0.4 + Math.random() * 0.7,
      vy: (Math.random() - 0.5) * 0.6,
      radius: 2 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.6,
      type: "sign"
    }));

    // Particle nodes for Speech Waveform Stream (Right)
    const speechNodes = Array.from({ length: 32 }, () => ({
      x: width * 0.65 + Math.random() * (width * 0.35),
      y: Math.random() * height,
      vx: -(0.4 + Math.random() * 0.7),
      vy: (Math.random() - 0.5) * 0.6,
      radius: 2 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.6,
      type: "speech"
    }));

    // Central Bridge Nodes (Nexus)
    const nexusNodes = Array.from({ length: 18 }, () => ({
      x: width * 0.35 + Math.random() * (width * 0.3),
      y: height * 0.2 + Math.random() * (height * 0.6),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 3 + Math.random() * 3,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background coordinate lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 2. Draw Central Communication Bridge Beam
      const grad = ctx.createLinearGradient(0, height / 2, width, height / 2);
      grad.addColorStop(0, "rgba(0, 242, 254, 0)");
      grad.addColorStop(0.3, "rgba(0, 242, 254, 0.15)");
      grad.addColorStop(0.5, "rgba(129, 140, 248, 0.35)");
      grad.addColorStop(0.7, "rgba(168, 85, 247, 0.15)");
      grad.addColorStop(1, "rgba(168, 85, 247, 0)");

      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x <= width; x += 20) {
        const distFromCenter = Math.abs(x - width / 2) / (width / 2);
        const wave = Math.sin(x * 0.015 + time * 3) * (25 * (1 - distFromCenter * 0.6));
        ctx.lineTo(x, height / 2 + wave);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 3. Update & Draw Sign Gesture Nodes (Cyan)
      for (let p of signNodes) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > width * 0.5) p.x = 0;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
        ctx.shadowColor = "#00F2FE";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Update & Draw Speech Waveform Nodes (Indigo/Violet)
      for (let p of speechNodes) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < width * 0.5) p.x = width;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
        ctx.shadowColor = "#A855F7";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Update & Draw Bridge Nexus Nodes
      for (let n of nexusNodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.03;
        const currentRadius = n.radius + Math.sin(n.pulse) * 1.5;

        // Keep inside center bounding box
        if (n.x < width * 0.35 || n.x > width * 0.65) n.vx *= -1;
        if (n.y < height * 0.2 || n.y > height * 0.8) n.vy *= -1;

        // Connect nearby nexus nodes
        for (let other of nexusNodes) {
          const d = Math.hypot(n.x - other.x, n.y - other.y);
          if (d < 110) {
            ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - d / 110) * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = "rgba(248, 250, 252, 0.9)";
        ctx.shadowColor = "#818CF8";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-[#070A0F]/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070A0F] via-transparent to-[#070A0F]" />
    </div>
  );
}