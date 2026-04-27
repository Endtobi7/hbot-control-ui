import React, { useRef, useState, useEffect, useCallback } from 'react';
import robotService from '../services/robotService';
import { DrawingPath } from '../types/robot';

interface Point {
  x: number;
  y: number;
}

const AIDrawing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#22c55e');
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Redraw canvas whenever paths change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 0.5;
    for (let i = 40; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 40; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    // Draw completed paths
    paths.forEach((path) => {
      if (path.length < 2) return;
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    // Draw current path
    if (currentPath.length >= 2) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [paths, currentPath, penSize, penColor]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentPath([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    setCurrentPath((prev) => [...prev, pos]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setPaths((prev) => [...prev, currentPath]);
    }
    setCurrentPath([]);
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const handleExecute = useCallback(() => {
    if (paths.length === 0) return;
    setIsExecuting(true);

    const canvas = canvasRef.current;
    const scaleX = canvas ? 300 / canvas.width : 1;
    const scaleY = canvas ? 300 / canvas.height : 1;

    const drawingPath: DrawingPath = {
      points: paths.flatMap((path) =>
        path.map((p) => ({
          x: p.x * scaleX,
          y: (canvas ? canvas.height - p.y : p.y) * scaleY,
          z: 0,
        }))
      ),
      speed: 50,
      penDown: true,
    };

    robotService.executeDrawing(drawingPath);
    setTimeout(() => setIsExecuting(false), 2000);
  }, [paths]);

  const handleStop = () => {
    robotService.stop();
    setIsExecuting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Canvas */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Drawing Canvas</p>
          <canvas
            ref={canvasRef}
            width={560}
            height={420}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full rounded border border-gray-600 cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
          <p className="text-xs text-gray-500 mt-2">
            {paths.length} stroke{paths.length !== 1 ? 's' : ''} drawn
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Pen Settings */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Pen Settings</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Size: <span className="text-blue-400 font-mono">{penSize}px</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-gray-400">{penColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Colors */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Quick Colors</h3>
          <div className="grid grid-cols-4 gap-2">
            {['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#ffffff', '#a855f7', '#f97316', '#06b6d4'].map(
              (color) => (
                <button
                  key={color}
                  onClick={() => setPenColor(color)}
                  className={`w-full aspect-square rounded border-2 transition-all ${
                    penColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleClear}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors"
          >
            Clear Canvas
          </button>

          {!isExecuting ? (
            <button
              onClick={handleExecute}
              disabled={paths.length === 0}
              className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded transition-colors"
            >
              ▶ Execute Drawing
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded transition-colors animate-pulse"
            >
              ■ Stop Execution
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-500 leading-relaxed">
            Draw on the canvas with your mouse. Each stroke becomes a robot path.
            Click <strong className="text-gray-400">Execute Drawing</strong> to send paths to the robot.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIDrawing;
