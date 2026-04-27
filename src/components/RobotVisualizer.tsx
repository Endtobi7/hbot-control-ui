import React, { useEffect, useRef } from 'react';
import { RobotPosition } from '../types/robot';

interface RobotVisualizerProps {
  currentPosition: RobotPosition;
  targetPosition: RobotPosition;
  maxX?: number;
  maxY?: number;
}

const RobotVisualizer: React.FC<RobotVisualizerProps> = ({
  currentPosition,
  targetPosition,
  maxX = 300,
  maxY = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 24;
    const workW = width - padding * 2;
    const workH = height - padding * 2;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, width, height);

    // Workspace platform (gray)
    ctx.fillStyle = '#2a2a2a';
    ctx.strokeStyle = '#3f3f3f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(padding, padding, workW, workH);
    ctx.fill();
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 0.5;
    const gridCount = 6;
    for (let i = 1; i < gridCount; i++) {
      const x = padding + (workW / gridCount) * i;
      const y = padding + (workH / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + workH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + workW, y);
      ctx.stroke();
    }

    // Corner support columns (red)
    const columnRadius = 6;
    const columns = [
      { x: padding, y: padding },
      { x: padding + workW, y: padding },
      { x: padding, y: padding + workH },
      { x: padding + workW, y: padding + workH },
    ];
    ctx.fillStyle = '#ef4444';
    columns.forEach((col) => {
      ctx.beginPath();
      ctx.arc(col.x, col.y, columnRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Helper to convert robot coords to canvas coords
    const toCanvas = (rx: number, ry: number) => ({
      cx: padding + (rx / maxX) * workW,
      cy: padding + workH - (ry / maxY) * workH,
    });

    // Target position (blue outline circle)
    const target = toCanvas(
      Math.max(0, Math.min(maxX, targetPosition.x)),
      Math.max(0, Math.min(maxY, targetPosition.y))
    );
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(target.cx, target.cy, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Draw dashed line from target to current
    const current = toCanvas(
      Math.max(0, Math.min(maxX, currentPosition.x)),
      Math.max(0, Math.min(maxY, currentPosition.y))
    );
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#3b82f644';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(current.cx, current.cy);
    ctx.lineTo(target.cx, target.cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current position (green filled circle)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(current.cx, current.cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#5a5a5a';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('X', padding + workW - 6, padding + workH + 14);
    ctx.fillText('Y', padding - 14, padding + 10);

    // Coordinate readout
    ctx.fillStyle = '#808080';
    ctx.font = '9px Fira Code, monospace';
    ctx.fillText(
      `Cur: (${currentPosition.x.toFixed(1)}, ${currentPosition.y.toFixed(1)})`,
      padding + 4,
      height - 4
    );
    ctx.textAlign = 'right';
    ctx.fillText(
      `Tgt: (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)})`,
      width - padding,
      height - 4
    );
    ctx.textAlign = 'left';
  }, [currentPosition, targetPosition, maxX, maxY]);

  return (
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
        Robot Workspace
      </p>
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="w-full rounded"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="flex gap-4 mt-2 text-xs font-mono">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-400">Current</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-blue-500"></span>
          <span className="text-gray-400">Target</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-gray-400">Columns</span>
        </span>
      </div>
    </div>
  );
};

export default RobotVisualizer;
