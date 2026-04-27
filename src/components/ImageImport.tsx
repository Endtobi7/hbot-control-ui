import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RobotStatus } from '../types/robot';
import robotService from '../services/robotService';
import RobotVisualizer from './RobotVisualizer';
import StatusIndicator from './StatusIndicator';
import {
  loadImageToCanvas,
  sobelEdgeDetection,
  edgesToDrawingPaths,
  renderEdgesToCanvas,
} from '../utils/imageUtils';

interface Props {
  status: RobotStatus;
}

const ImageImport: React.FC<Props> = ({ status }) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const edgeCanvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [invert, setInvert] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(0.9);
  const [hasEdges, setHasEdges] = useState(false);
  const [pathCount, setPathCount] = useState(0);
  const [error, setError] = useState<string>('');

  const imageDataRef = useRef<ImageData | null>(null);
  const edgesRef = useRef<boolean[][] | null>(null);

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError('');
    setHasEdges(false);

    try {
      const { imageData, width, height } = await loadImageToCanvas(file, 400, 300);
      imageDataRef.current = imageData;

      // Preview
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        previewCanvas.width = width;
        previewCanvas.height = height;
        const ctx = previewCanvas.getContext('2d');
        ctx?.putImageData(imageData, 0, 0);
      }

      // Edge detection
      const edges = sobelEdgeDetection(imageData, threshold);
      edgesRef.current = edges;

      // Render edges
      const edgeCanvas = edgeCanvasRef.current;
      if (edgeCanvas) {
        edgeCanvas.width = width;
        edgeCanvas.height = height;
        const ctx = edgeCanvas.getContext('2d');
        if (ctx) renderEdgesToCanvas(ctx, edges, invert);
      }

      // Count paths
      const paths = edgesToDrawingPaths(
        edges,
        { threshold, invert, scaleFactor, maxPoints: 5000 },
        robotService.config.maxX,
        robotService.config.maxY,
        status.speed
      );
      setPathCount(paths.length);
      setHasEdges(true);
    } catch (e) {
      setError(`Failed to process image: ${e}`);
    } finally {
      setIsProcessing(false);
    }
  }, [threshold, invert, scaleFactor, status.speed]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    processImage(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const reprocess = useCallback(() => {
    if (imageFile) processImage(imageFile);
  }, [imageFile, processImage]);

  useEffect(() => {
    if (imageFile) reprocess();
  }, [threshold, invert, scaleFactor]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExecute = () => {
    if (!edgesRef.current) return;
    setIsExecuting(true);
    robotService.setMode('image');

    const paths = edgesToDrawingPaths(
      edgesRef.current,
      { threshold, invert, scaleFactor, maxPoints: 5000 },
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

  useEffect(() => {
    if (!status.isMoving && isExecuting) setIsExecuting(false);
  }, [status.isMoving, isExecuting]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-accent-blue bg-blue-900/20'
              : 'border-primary-600 bg-primary-800 hover:border-primary-400'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {imageFile ? (
            <div className="flex items-center gap-3 justify-center">
              <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-white font-medium">{imageFile.name}</div>
                <div className="text-xs text-primary-400">{(imageFile.size / 1024).toFixed(1)} KB — Click to replace</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-12 h-12 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-white font-medium">Drop image here or click to browse</div>
              <div className="text-xs text-primary-400">Supports PNG, JPG, SVG, BMP</div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Image previews */}
        {imageFile && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-800 rounded-xl border border-primary-600 overflow-hidden">
              <div className="text-xs text-primary-400 px-3 py-2 border-b border-primary-600">
                Original Image
              </div>
              <div className="p-2 flex items-center justify-center min-h-32 bg-primary-900">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-48 rounded"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
            <div className="bg-primary-800 rounded-xl border border-primary-600 overflow-hidden">
              <div className="text-xs text-primary-400 px-3 py-2 border-b border-primary-600">
                Edge Detection Preview
              </div>
              <div className="p-2 flex items-center justify-center min-h-32 bg-primary-900">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-primary-400">Processing...</span>
                  </div>
                ) : (
                  <canvas
                    ref={edgeCanvasRef}
                    className="max-w-full max-h-48 rounded"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {imageFile && (
          <div className="bg-primary-800 rounded-xl border border-primary-600 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
              Processing Settings
            </h3>

            {/* Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-primary-400">Edge Threshold</label>
                <span className="text-sm font-mono text-white">{threshold}</span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-primary-500">
                <span>Sensitive (more edges)</span>
                <span>Strong (fewer edges)</span>
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-primary-400">Scale Factor</label>
                <span className="text-sm font-mono text-white">{(scaleFactor * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={scaleFactor}
                onChange={(e) => setScaleFactor(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Invert */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${invert ? 'bg-accent-blue' : 'bg-primary-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${invert ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} className="sr-only" />
              <span className="text-sm text-primary-300">Invert edges</span>
            </label>
          </div>
        )}

        {/* Execute */}
        {hasEdges && (
          <div className="bg-primary-800 rounded-xl border border-primary-600 p-4 flex items-center justify-between">
            <div className="text-sm text-primary-400">
              <span className="text-white font-medium">{pathCount}</span> path segments ready to execute
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
                  disabled={!status.isConnected}
                  className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-all text-sm disabled:opacity-40"
                >
                  ▶ Execute Trace
                </button>
              )}
            </div>
          </div>
        )}
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
            Tips
          </h3>
          <ul className="space-y-2 text-xs text-primary-400">
            <li className="flex gap-2">
              <span className="text-accent-yellow">•</span>
              Use high-contrast images for best results
            </li>
            <li className="flex gap-2">
              <span className="text-accent-yellow">•</span>
              Lower threshold = more edge detail
            </li>
            <li className="flex gap-2">
              <span className="text-accent-yellow">•</span>
              Try inverting for dark-on-light images
            </li>
            <li className="flex gap-2">
              <span className="text-accent-yellow">•</span>
              Adjust scale to fit workspace
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageImport;
