import React, { useEffect, useRef } from 'react';
import { RobotStatus } from '../types/robot';

interface Props {
  status: RobotStatus;
  maxX?: number;
  maxY?: number;
}

const PADDING = 30;
const COLUMN_RADIUS = 6;

const RobotVisualizer: React.FC<Props> = ({ status, maxX = 300, maxY = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const workW = W - PADDING * 2;
    const workH = H - PADDING * 2;

    // Helper: robot coords → canvas coords
    const toCanvas = (rx: number, ry: number) => ({
      cx: PADDING + (rx / maxX) * workW,
      cy: PADDING + (ry / maxY) * workH,
    });

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(59,130,246,0.1)';
    ctx.lineWidth = 1;
    const gridStep = workW / 6;
    for (let gx = PADDING; gx <= W - PADDING; gx += gridStep) {
      ctx.beginPath(); ctx.moveTo(gx, PADDING); ctx.lineTo(gx, H - PADDING); ctx.stroke();
    }
    for (let gy = PADDING; gy <= H - PADDING; gy += gridStep) {
      ctx.beginPath(); ctx.moveTo(PADDING, gy); ctx.lineTo(W - PADDING, gy); ctx.stroke();
    }

    // Workspace border
    ctx.strokeStyle = '#3f3f3f';
    ctx.lineWidth = 2;
    ctx.strokeRect(PADDING, PADDING, workW, workH);

    // Gray base platform
    ctx.fillStyle = 'rgba(90,90,90,0.25)';
    ctx.fillRect(PADDING + 4, PADDING + 4, workW - 8, workH - 8);

    // Red support columns at 4 corners
    const corners = [
      { rx: 0, ry: 0 },
      { rx: maxX, ry: 0 },
      { rx: 0, ry: maxY },
      { rx: maxX, ry: maxY },
    ];

    for (const c of corners) {
      const { cx, cy } = toCanvas(c.rx, c.ry);
      // Column shadow
      ctx.fillStyle = 'rgba(239,68,68,0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, COLUMN_RADIUS + 4, 0, Math.PI * 2);
      ctx.fill();
      // Column
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, COLUMN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      // Column highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 2, COLUMN_RADIUS / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Movement path line (target → current)
    const cur = toCanvas(status.currentPosition.x, status.currentPosition.y);
    const tgt = toCanvas(status.targetPosition.x, status.targetPosition.y);

    if (status.isMoving) {
      ctx.strokeStyle = 'rgba(59,130,246,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(cur.cx, cur.cy);
      ctx.lineTo(tgt.cx, tgt.cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Target position (blue circle outline)
    if (status.isMoving) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tgt.cx, tgt.cy, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Green carriages – horizontal beam indicator
    const cursorY = PADDING + (status.currentPosition.y / maxY) * workH;
    ctx.fillStyle = 'rgba(34,197,94,0.2)';
    ctx.fillRect(PADDING, cursorY - 4, workW, 8);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PADDING, cursorY);
    ctx.lineTo(W - PADDING, cursorY);
    ctx.stroke();

    // Current position dot – green
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#22c55e';
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cur.cx, cur.cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner dot highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(cur.cx - 2, cur.cy - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Yellow effector indicator (small circle at current position)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cur.cx, cur.cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Coordinate labels
    ctx.fillStyle = '#808080';
    ctx.font = '10px Fira Code, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('(0,0)', PADDING + 4, PADDING + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`(${maxX},${maxY})`, W - PADDING - 4, H - PADDING - 4);

    // Z position bar (right side)
    const zBarX = W - 12;
    const zBarHeight = workH;
    const zFill = ((status.currentPosition.z) / 100) * zBarHeight;
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(zBarX - 4, PADDING, 8, zBarHeight);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(zBarX - 4, PADDING + zBarHeight - zFill, 8, zFill);
    ctx.fillStyle = '#808080';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Z', zBarX, PADDING - 6);

  }, [status, maxX, maxY]);

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        width={320}
        height={280}
        className="rounded-lg border border-primary-600 w-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="grid grid-cols-3 gap-1 text-center">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis} className="bg-primary-700 rounded p-1.5">
            <div className="text-xs text-primary-400 uppercase font-medium">{axis}</div>
            <div className="text-sm font-mono text-white font-semibold">
              {status.currentPosition[axis].toFixed(1)}
              <span className="text-primary-400 text-xs ml-0.5">mm</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RobotVisualizer;
