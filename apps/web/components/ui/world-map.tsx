"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";
import Image from "next/image";

import { useTheme } from "next-themes";

interface MapProps {
  dots?: Array<{
    start: MapPoint;
    end: MapPoint;
  }>;
  lineColor?: string;
}

interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  flagged?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export default function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const { theme } = useTheme();

  const svgMap = map.getSVG({
    radius: 0.22,
    color: theme === "dark" ? "#FFFFFF40" : "#00000040",
    shape: "circle",
    backgroundColor: theme === "dark" ? "black" : "white",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="relative h-full min-h-full w-full overflow-hidden rounded-none bg-white font-sans dark:bg-black">
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
                key={`start-upper-${i}`}
              ></motion.path>
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g
              key={`start-${i}`}
              className={dot.start.onClick ? "pointer-events-auto cursor-pointer" : undefined}
              onClick={dot.start.onClick}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") dot.start.onClick?.();
              }}
              role={dot.start.onClick ? "button" : undefined}
              tabIndex={dot.start.onClick ? 0 : undefined}
            >
              {dot.start.label ? <title>{dot.start.label}</title> : null}
              {dot.start.flagged ? <circle cx={projectPoint(dot.start.lat, dot.start.lng).x} cy={projectPoint(dot.start.lat, dot.start.lng).y} r="9" fill="#ef4444" opacity="0.16" /> : null}
              {dot.start.selected ? <circle cx={projectPoint(dot.start.lat, dot.start.lng).x} cy={projectPoint(dot.start.lat, dot.start.lng).y} r="10" fill={dot.start.color ?? lineColor} opacity="0.18" /> : null}
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r={dot.start.selected ? "5" : dot.start.flagged ? "4.5" : "3"}
                fill={dot.start.color ?? lineColor}
                stroke="#ffffff"
                strokeWidth={dot.start.flagged || dot.start.selected ? "1.5" : "0.75"}
              />
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2"
                  fill={dot.start.color ?? lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
            <g
              key={`end-${i}`}
              className={dot.end.onClick ? "pointer-events-auto cursor-pointer" : undefined}
              onClick={dot.end.onClick}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") dot.end.onClick?.();
              }}
              role={dot.end.onClick ? "button" : undefined}
              tabIndex={dot.end.onClick ? 0 : undefined}
            >
              {dot.end.label ? <title>{dot.end.label}</title> : null}
              {dot.end.flagged ? <circle cx={projectPoint(dot.end.lat, dot.end.lng).x} cy={projectPoint(dot.end.lat, dot.end.lng).y} r="9" fill="#ef4444" opacity="0.16" /> : null}
              {dot.end.selected ? <circle cx={projectPoint(dot.end.lat, dot.end.lng).x} cy={projectPoint(dot.end.lat, dot.end.lng).y} r="10" fill={dot.end.color ?? lineColor} opacity="0.18" /> : null}
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r={dot.end.selected ? "5" : dot.end.flagged ? "4.5" : "3"}
                fill={dot.end.color ?? lineColor}
                stroke="#ffffff"
                strokeWidth={dot.end.flagged || dot.end.selected ? "1.5" : "0.75"}
              />
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2"
                  fill={dot.end.color ?? lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
