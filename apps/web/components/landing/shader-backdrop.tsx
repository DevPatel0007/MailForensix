"use client";

import React, { useState, useEffect, useRef } from "react";

export const ShaderBackdrop = () => {
  const [ShaderComponents, setShaderComponents] = useState<any>(null);
  const [hasWebGPU, setHasWebGPU] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && !("gpu" in navigator)) {
      setHasWebGPU(false);
    }

    // @ts-ignore
    import("shaders/react")
      .then((mod) => {
        setShaderComponents(mod);
      })
      .catch(() => {
        setHasWebGPU(false);
      });
  }, []);

  useEffect(() => {
    if (ShaderComponents && hasWebGPU) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let time = 0;
    const draw = () => {
      time += 0.015;
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, width, height);

      const rows = 35;
      const cols = 55;
      const gapX = width / cols;
      const gapY = height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gapX + gapX / 2;
          const y = r * gapY + gapY / 2;

          const horizonFactor = y / height;
          const distToMouse = Math.hypot(x - mouseX, y - mouseY);
          const mouseRipple = Math.sin(distToMouse * 0.03 - time * 2) * Math.max(0, 1 - distToMouse / 250);

          const wave = Math.sin(x * 0.01 + y * 0.01 + time) * 0.5 + 0.5;
          const dotRadius = Math.max(0.4, (horizonFactor * 2.2 + wave * 0.8 + mouseRipple * 1.5) * 0.9);

          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + horizonFactor * 0.35})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ShaderComponents, hasWebGPU]);

  if (ShaderComponents && hasWebGPU) {
    const { Shader, SolidColor, Surface3D, DotGrid, Prism, LinearGradient, LiquidMetal } = ShaderComponents;
    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <Shader toneMapping="aces">
          <SolidColor color="#080808" />
          <Surface3D
            amplitude={0.31}
            cursorIntensity={0.83}
            edgePinning={0.4}
            farCutoff={0.12}
            frequency={1.8}
            height={0.31}
            highlights={6}
            lighting={29}
            lightX={-0.8}
            lightY={-0.95}
            octaves={1}
            tilt={73}
            zoom={1.1}
          >
            <DotGrid
              density={57}
              dotSize={{
                type: "map",
                source: "idmrf0jzpi1json7rda",
                channel: "luminance",
                inputMin: 0,
                inputMax: 1,
                outputMin: 0,
                outputMax: 0.21,
                curve: 0.2,
              }}
              speed={0.91}
              visible={true}
            />
          </Surface3D>
          <Prism
            endFalloff={0.44}
            intensity={0.24}
            position={{ x: 1.01, y: 1.23 }}
            saturation={0.79}
            softness={0.001}
            speed={0.16}
            splitPosition={{ x: 0.99, y: 1.11 }}
            spread={3}
            startFalloff={0.64}
          />
          <LinearGradient
            id="idmrf0jzpi1json7rda"
            colorSpace="oklab"
            start={{ x: 0.5, y: 1.01 }}
            end={{ x: 0.5, y: 0.15 }}
            stops={[
              { color: "#ffffff", position: 0 },
              { color: "#000000", position: 1 },
            ]}
            visible={false}
          />
          <LiquidMetal
            center={{ x: 0.5, y: 0.45 }}
            lightColor="#1f1f1f"
            ripple={5.31}
            scale={1.17}
            shape='{"type":"metaballs3D","ballRadius":0.1,"spread":0.29,"blend":0.325,"speed":1,"rotX":0,"rotY":0,"rotZ":0}'
            shapeType="metaballs3D"
            turbulence={0.37}
          />
        </Shader>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
