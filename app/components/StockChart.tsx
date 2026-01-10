'use client';

import React, { useMemo, useState } from 'react';

interface StockChartProps {
  data: number[];
  type?: 'line' | 'area' | 'candle' | 'step';
  width?: number | string;
  height?: number | string;
  color?: string;
  showTooltip?: boolean;
  className?: string;
}

// --- HELPER FOR SPLINE PATH (Smooth Curves) ---
function getSplinePath(points: {x: number, y: number}[]) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  const smoothing = 0.2;
  
  const line = (pointA: any, pointB: any) => {
    const lengthX = pointB.x - pointA.x;
    const lengthY = pointB.y - pointA.y;
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    };
  };

  const controlPoint = (current: any, previous: any, next: any, reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current.x + Math.cos(angle) * length;
    const y = current.y + Math.sin(angle) * length;
    return { x, y };
  };

  const bezierCommand = (point: any, i: number, a: any[]) => {
    const cps = controlPoint(a[i - 1], a[i - 2], point);
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
  };

  return points.reduce((acc, point, i, a) => 
    i === 0 ? `M ${point.x},${point.y}` : `${acc} ${bezierCommand(point, i, a)}`
  , '');
}

// --- HELPER FOR STEP PATH (Digital/Retro) ---
function getStepPath(points: {x: number, y: number}[]) {
  if (points.length === 0) return '';
  // Step logic: Move Horizontally to next X, then Vertically to next Y
  // M x0 y0 L x1 y0 L x1 y1 L x2 y1 L x2 y2 ...
  
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i+1];
    // Midpoint step? Or full step? Let's do full step (Horizontal first)
    d += ` L ${next.x},${curr.y} L ${next.x},${next.y}`;
  }
  return d;
}

export const StockChart = ({ 
  data, 
  type = 'area', // 'candle' will now render as 'step' style per user request
  height = '100%', 
  width = '100%',
  color,
  showTooltip = false,
  className = ''
}: StockChartProps) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { min, max, range, points, trendColor, mappedPoints } = useMemo(() => {
    if (!data || data.length === 0) return { min: 0, max: 0, range: 1, points: [], trendColor: '#DFFF00', mappedPoints: [] };

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const rangeVal = maxVal - minVal || 1;
    
    const start = data[0];
    const end = data[data.length - 1];
    const isProfitable = end >= start;
    const computedColor = color || (isProfitable ? '#DFFF00' : '#ef4444');

    // Pre-calculate coordinates
    const paddedRange = rangeVal * 1.2; 
    const paddedMin = minVal - (rangeVal * 0.1);
    
    const mPoints = data.map((val, i) => ({
       x: (i / (data.length - 1)) * 100,
       y: 100 - ((val - paddedMin) / paddedRange) * 100,
       val
    }));

    return {
      min: minVal,
      max: maxVal,
      range: rangeVal,
      points: data,
      trendColor: computedColor,
      mappedPoints: mPoints
    };
  }, [data, color]);

  const renderChart = () => {
    // Unique ID for gradients
    const chartId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

    // --- DETERMINE CHART STYLE ---
    // 'candle' passed from legacy calls -> transform to 'step' visual
    const isStep = type === 'candle' || type === 'step';
    
    const dPath = isStep ? getStepPath(mappedPoints) : getSplinePath(mappedPoints);
    const dArea = `${dPath} L 100,100 L 0,100 Z`;

    return (
      <>
        <defs>
            {/* GLOW FILTER */}
            <filter id={`glow-${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* SCANLINE PATTERN FILL */}
            <pattern id={`scanlines-${chartId}`} patternUnits="userSpaceOnUse" width="3" height="3">
                <line x1="0" y1="0" x2="0" y2="3" stroke={trendColor} strokeWidth="1" opacity="0.1" />
            </pattern>
            
            <linearGradient id={`gradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendColor} stopOpacity={isStep ? 0.2 : 0.3} />
                <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
            
            <mask id={`mask-${chartId}`}>
                 <path d={dArea} fill="white" />
            </mask>
        </defs>

        <g className="transition-all duration-500 ease-in-out">
            {/* Area Fill */}
            <path d={dArea} fill={`url(#gradient-${chartId})`} stroke="none" />
            
            {/* Pattern Overlay (Visible on Step) */}
            {isStep && (
                <rect x="0" y="0" width="100" height="100" fill={`url(#scanlines-${chartId})`} mask={`url(#mask-${chartId})`} />
            )}

            {/* Main Path */}
            <path 
                d={dPath} 
                fill="none" 
                stroke={trendColor} 
                strokeWidth={isStep ? "1" : "1.5"} 
                filter={!isStep ? `url(#glow-${chartId})` : undefined}
                vectorEffect="non-scaling-stroke" 
                strokeLinecap={isStep ? "square" : "round"} 
                strokeLinejoin={isStep ? "miter" : "round"}
                className="drop-shadow-sm"
            />
            
            {/* End Marker (Square Bit for Step, Circle for Area) */}
            {isStep ? (
                <rect 
                    x={mappedPoints[mappedPoints.length - 1].x - 1.5} 
                    y={mappedPoints[mappedPoints.length - 1].y - 1.5} 
                    width="3" height="3"
                    fill={trendColor} 
                    className="animate-pulse"
                />
            ) : (
                <circle 
                    cx={mappedPoints[mappedPoints.length - 1].x} 
                    cy={mappedPoints[mappedPoints.length - 1].y} 
                    r="3" 
                    fill={trendColor} 
                    className="animate-pulse"
                >
                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                </circle>
            )}
        </g>

        {/* Interactive Overlay Points */}
        {showTooltip && mappedPoints.map((p, i) => (
            <rect 
                key={i}
                x={p.x - (50 / mappedPoints.length)} 
                y="0" 
                width={100 / mappedPoints.length} 
                height="100" 
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
            />
        ))}

        {/* Hover Highlight */}
        {showTooltip && hoverIndex !== null && (
            <g>
                <line 
                    x1={mappedPoints[hoverIndex].x} y1="0" 
                    x2={mappedPoints[hoverIndex].x} y2="100" 
                    stroke="white" 
                    strokeWidth="0.5" 
                    strokeDasharray="2,2" 
                    opacity="0.5"
                    vectorEffect="non-scaling-stroke"
                />
                {isStep ? (
                    <rect 
                        x={mappedPoints[hoverIndex].x - 1.5}
                        y={mappedPoints[hoverIndex].y - 1.5}
                        width="3" height="3"
                        fill="white"
                        stroke={trendColor}
                        strokeWidth="1"
                    />
                ) : (
                    <circle 
                        cx={mappedPoints[hoverIndex].x} 
                        cy={mappedPoints[hoverIndex].y} 
                        r="2.5" 
                        fill="white" 
                        stroke={trendColor} 
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                    />
                )}
            </g>
        )}
      </>
    );
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
       <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {renderChart()}
       </svg>
       
       {/* Tooltip HTML Overlay */}
       {showTooltip && hoverIndex !== null && (
           <div 
             className="absolute pointer-events-none bg-black/80 backdrop-blur-sm border border-white/10 p-2 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] text-xs z-50 whitespace-nowrap"
             style={{ 
                 left: `${mappedPoints[hoverIndex].x}%`, 
                 top: `${mappedPoints[hoverIndex].y}%`,
                 transform: 'translate(-50%, -130%)'
             }}
           >
               <div className="font-bold text-white font-mono tracking-widest">{mappedPoints[hoverIndex].val.toFixed(2)} <span className="text-[#DFFF00] opacity-50">CR</span></div>
               <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent opacity-50 mt-1" />
           </div>
       )}
    </div>
  );
};
