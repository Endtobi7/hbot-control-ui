import React, { useState, useRef, useCallback } from 'react';
import robotService from '../services/robotService';
import { ImageTraceConfig, DrawingPath } from '../types/robot';

const DEFAULT_CONFIG: ImageTraceConfig = {
  threshold: 128,
  invert: false,
  scaleFactor: 1.0,
  maxSpeed: 50,
};

const ImageImport: React.FC = () => {
  const [config, setConfig] = useState<ImageTraceConfig>(DEFAULT_CONFIG);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [edgeDataUrl, setEdgeDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pathPoints, setPathPoints] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const applyEdgeDetection = useCallback(
    (img: HTMLImageElement) => {
      setIsProcessing(true);
      const canvas = hiddenCanvasRef.current;
      if (!canvas) return;

      const maxDim = 400;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h / w) * maxDim);
          w = maxDim;
        } else {
          w = Math.round((w / h) * maxDim);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // Convert to grayscale
      const gray = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      }

      // Sobel edge detection
      const edges = new Uint8Array(w * h);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const gx =
            -gray[(y - 1) * w + (x - 1)] +
            gray[(y - 1) * w + (x + 1)] +
            -2 * gray[y * w + (x - 1)] +
            2 * gray[y * w + (x + 1)] +
            -gray[(y + 1) * w + (x - 1)] +
            gray[(y + 1) * w + (x + 1)];

          const gy =
            -gray[(y - 1) * w + (x - 1)] +
            -2 * gray[(y - 1) * w + x] +
            -gray[(y - 1) * w + (x + 1)] +
            gray[(y + 1) * w + (x - 1)] +
            2 * gray[(y + 1) * w + x] +
            gray[(y + 1) * w + (x + 1)];

          edges[y * w + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        }
      }

      // Apply threshold and render to output canvas
      const outData = new Uint8ClampedArray(w * h * 4);
      let count = 0;
      for (let i = 0; i < w * h; i++) {
        let val = edges[i] > config.threshold ? 255 : 0;
        if (config.invert) val = 255 - val;
        if (val > 0) count++;
        outData[i * 4] = val;
        outData[i * 4 + 1] = val;
        outData[i * 4 + 2] = val;
        outData[i * 4 + 3] = 255;
      }

      const outImageData = new ImageData(outData, w, h);
      ctx.putImageData(outImageData, 0, 0);
      setEdgeDataUrl(canvas.toDataURL());
      setPathPoints(count);
      setIsProcessing(false);
    },
    [config.threshold, config.invert]
  );

  const loadImage = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageDataUrl(dataUrl);
        const img = new Image();
        img.onload = () => applyEdgeDetection(img);
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [applyEdgeDetection]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleReprocess = () => {
    if (!imageDataUrl) return;
    const img = new Image();
    img.onload = () => applyEdgeDetection(img);
    img.src = imageDataUrl;
  };

  const handleExecute = () => {
    if (!edgeDataUrl) return;
    setIsExecuting(true);

    // Build a simplified path from edge points
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const points: Array<{ x: number; y: number; z: number }> = [];
    const step = 4; // sample every N pixels

    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i] > 128) {
          points.push({
            x: (x / canvas.width) * 300 * config.scaleFactor,
            y: ((canvas.height - y) / canvas.height) * 300 * config.scaleFactor,
            z: 0,
          });
        }
      }
    }

    const drawingPath: DrawingPath = {
      points,
      speed: config.maxSpeed,
      penDown: true,
    };

    robotService.executeDrawing(drawingPath);
    setTimeout(() => setIsExecuting(false), 2000);
  };

  const handleStop = () => {
    robotService.stop();
    setIsExecuting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Image Preview Area */}
      <div className="lg:col-span-2 space-y-4">
        {/* Drop Zone */}
        {!imageDataUrl && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-gray-800 rounded-lg p-12 border-2 border-dashed cursor-pointer transition-colors text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-gray-300 font-medium mb-1">Drop an image here</p>
            <p className="text-gray-500 text-sm">or click to browse files</p>
            <p className="text-gray-600 text-xs mt-2">PNG, JPG, GIF supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Images Side by Side */}
        {imageDataUrl && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Original</p>
                <button
                  onClick={() => {
                    setImageDataUrl(null);
                    setEdgeDataUrl(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  ✕ Remove
                </button>
              </div>
              <img
                src={imageDataUrl}
                alt="Original"
                className="w-full rounded border border-gray-600 object-contain max-h-64"
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Edge Detection
                {isProcessing && (
                  <span className="ml-2 text-yellow-400">Processing…</span>
                )}
              </p>
              {edgeDataUrl ? (
                <img
                  src={edgeDataUrl}
                  alt="Edges"
                  className="w-full rounded border border-gray-600 object-contain max-h-64"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-full h-32 bg-gray-900 rounded flex items-center justify-center">
                  <span className="text-gray-600 text-sm">Processing…</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={hiddenCanvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Edge Detection Settings */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Edge Detection</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Threshold: <span className="text-blue-400 font-mono">{config.threshold}</span>
              </label>
              <input
                type="range"
                min="0"
                max="255"
                value={config.threshold}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, threshold: Number(e.target.value) }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="invert"
                checked={config.invert}
                onChange={(e) => setConfig((c) => ({ ...c, invert: e.target.checked }))}
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="invert" className="text-xs text-gray-300 cursor-pointer">
                Invert edges
              </label>
            </div>

            <button
              onClick={handleReprocess}
              disabled={!imageDataUrl || isProcessing}
              className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 text-xs rounded transition-colors"
            >
              Re-apply Detection
            </button>
          </div>
        </div>

        {/* Path Settings */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Path Settings</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Scale: <span className="text-blue-400 font-mono">{config.scaleFactor.toFixed(1)}×</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={config.scaleFactor}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, scaleFactor: Number(e.target.value) }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Trace Speed: <span className="text-blue-400 font-mono">{config.maxSpeed}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={config.maxSpeed}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, maxSpeed: Number(e.target.value) }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {pathPoints > 0 && (
              <p className="text-xs text-gray-500">
                ~{pathPoints.toLocaleString()} edge pixels detected
              </p>
            )}
          </div>
        </div>

        {/* Upload & Execute */}
        <div className="space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors"
          >
            📁 Load Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!isExecuting ? (
            <button
              onClick={handleExecute}
              disabled={!edgeDataUrl || isProcessing}
              className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded transition-colors"
            >
              ▶ Execute Trace
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
      </div>
    </div>
  );
};

export default ImageImport;
