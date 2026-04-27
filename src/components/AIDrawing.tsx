import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RobotStatus } from '../types/robot';
import robotService from '../services/robotService';
import RobotVisualizer from './RobotVisualizer';
import StatusIndicator from './StatusIndicator';
import { Stroke, normalizeStrokesToPaths, redrawCanvas, drawWorkspaceGrid } from '../utils/drawingUtils';

interface Props {
  status: RobotStatus;
}

const AIDrawing: React.FC<Props> = ({ status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#22c55e');
  const [isExecuting, setIsExecuting] = useState(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    setIsDrawing(true);
    currentStrokeRef.current = [pos];
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e, canvas);
    currentStrokeRef.current.push(pos);

    // Draw segment
    const pts = currentStrokeRef.current;
    if (pts.length < 2) return;
    const prev = pts[pts.length - 2];

    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, penColor, penSize]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 1) {
      const newStroke: Stroke = {
        points: [...currentStrokeRef.current],
        penSize,
        color: penColor,
      };
      setStrokes((prev) => [...prev, newStroke]);
    }
    currentStrokeRef.current = [];
  }, [isDrawing, penSize, penColor]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWorkspaceGrid(ctx, canvas.width, canvas.height);
    setStrokes([]);
  };

  const handleExecute = async () => {
    if (strokes.length === 0) return;
    setIsExecuting(true);
    robotService.setMode('drawing');

    const canvas = canvasRef.current;
    const W = canvas?.width ?? 500;
    const H = canvas?.height ?? 400;

    const paths = normalizeStrokesToPaths(
      strokes,
      W,
      H,
      robotService.config.maxX,
      robotService.config.maxY,
      status.speed
    );

    robotService.executeDrawingPath(paths);
  };

  const handleStop = () => {
    setIsExecuting(false);
    robotService.stopExecution();
  };

  // Draw grid on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawWorkspaceGrid(ctx, canvas.width, canvas.height);
  }, []);

  // Sync executing state with robot status
  useEffect(() => {
    if (!status.isMoving && isExecuting) {
      setIsExecuting(false);
    }
  }, [status.isMoving, isExecuting]);

  // Undo last stroke
  const undoStroke = () => {
    setStrokes((prev) => {
      const updated = prev.slice(0, -1);
      const canvas = canvasRef.current;
      if (!canvas) return updated;
      const ctx = canvas.getContext('2d');
      if (!ctx) return updated;
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawWorkspaceGrid(ctx, canvas.width, canvas.height);
      redrawCanvas(ctx, updated, canvas.width, canvas.height);
      return updated;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Drawing area */}
      <div className="lg:col-span-2 space-y-4">
        {/* Toolbar */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Pen color */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-primary-400">Color</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-primary-500 bg-transparent"
              />
            </div>

            {/* Pen size */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-primary-400">Size</label>
              <input
                type="range"
                min={1}
                max={20}
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs font-mono text-white w-6">{penSize}</span>
            </div>

            {/* Preview dot */}
            <div className="flex items-center justify-center w-10 h-10 bg-primary-700 rounded-lg">
              <div
                className="rounded-full"
                style={{
                  width: Math.min(penSize * 2, 28),
                  height: Math.min(penSize * 2, 28),
                  backgroundColor: penColor,
                }}
              />
            </div>

            <div className="flex-1" />

            {/* Actions */}
            <button
              onClick={undoStroke}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 bg-primary-700 hover:bg-primary-600 border border-primary-500 text-sm text-white rounded-lg transition-all disabled:opacity-40"
            >
              ↩ Undo
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-1.5 bg-primary-700 hover:bg-primary-600 border border-primary-500 text-sm text-white rounded-lg transition-all"
            >
              🗑 Clear
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={450}
            className="w-full touch-none select-none"
            style={{ cursor: 'crosshair', display: 'block' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Execute controls */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-primary-800 rounded-xl border border-primary-600 p-3 flex items-center justify-between">
            <div className="text-sm text-primary-400">
              <span className="text-white font-medium">{strokes.length}</span> stroke(s) ready
            </div>
            <div className="flex gap-2">
              {isExecuting ? (
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-accent-red hover:bg-red-600 text-white font-semibold rounded-lg transition-all text-sm"
                >
                  ⏹ Stop
                </button>
              ) : (
                <button
                  onClick={handleExecute}
                  disabled={strokes.length === 0 || !status.isConnected}
                  className="px-4 py-2 bg-accent-green hover:bg-green-600 text-white font-semibold rounded-lg transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ▶ Execute Drawing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-4">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-3">
            Live Position
          </h3>
          <RobotVisualizer
            status={status}
            maxX={robotService.config.maxX}
            maxY={robotService.config.maxY}
          />
        </div>
        <StatusIndicator status={status} />

        {/* Tips */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-4">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-3">
            Instructions
          </h3>
          <ul className="space-y-2 text-xs text-primary-400">
            <li className="flex gap-2">
              <span className="text-accent-blue">•</span>
              Draw on the canvas using your mouse or touch
            </li>
            <li className="flex gap-2">
              <span className="text-accent-blue">•</span>
              Adjust pen size and color in the toolbar
            </li>
            <li className="flex gap-2">
              <span className="text-accent-blue">•</span>
              Click Execute to send path to robot
            </li>
            <li className="flex gap-2">
              <span className="text-accent-blue">•</span>
              Drawing is scaled to workspace dimensions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIDrawing;
