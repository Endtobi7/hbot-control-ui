import { DrawingPath } from '../types/robot';
import { simplifyPath, Point } from './drawingUtils';

export interface TraceConfig {
  threshold: number;
  invert: boolean;
  scaleFactor: number;
  maxPoints: number;
}

/**
 * Applies Sobel edge detection to an ImageData and returns a binary edge map.
 */
export function sobelEdgeDetection(imageData: ImageData, threshold: number): boolean[][] {
  const { width, height, data } = imageData;
  const gray = new Float32Array(width * height);

  // Convert to grayscale
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const edges: boolean[][] = Array.from({ length: height }, () =>
    new Array(width).fill(false)
  );

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = gray[(y - 1) * width + (x - 1)];
      const tc = gray[(y - 1) * width + x];
      const tr = gray[(y - 1) * width + (x + 1)];
      const ml = gray[y * width + (x - 1)];
      const mr = gray[y * width + (x + 1)];
      const bl = gray[(y + 1) * width + (x - 1)];
      const bc = gray[(y + 1) * width + x];
      const br = gray[(y + 1) * width + (x + 1)];

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      const magnitude = Math.sqrt(gx * gx + gy * gy);

      edges[y][x] = magnitude > threshold;
    }
  }

  return edges;
}

/**
 * Converts edge pixels to drawing paths for the robot.
 */
export function edgesToDrawingPaths(
  edges: boolean[][],
  config: TraceConfig,
  workspaceMaxX: number,
  workspaceMaxY: number,
  speed: number
): DrawingPath[] {
  const height = edges.length;
  const width = edges[0]?.length ?? 0;

  if (width === 0 || height === 0) return [];

  const paths: DrawingPath[] = [];
  const visited = Array.from({ length: height }, () => new Array(width).fill(false));
  let totalPoints = 0;

  // Simple raster scan - collect horizontal runs of edge pixels
  for (let y = 0; y < height; y += 2) {
    let runStart: number | null = null;
    const currentRun: Point[] = [];

    for (let x = 0; x < width; x++) {
      const isEdge = config.invert ? !edges[y][x] : edges[y][x];

      if (isEdge && !visited[y][x]) {
        if (runStart === null) {
          runStart = x;
        }
        currentRun.push({ x, y });
        visited[y][x] = true;
      } else if (runStart !== null) {
        // End of run
        if (currentRun.length > 1) {
          const simplified = simplifyPath(currentRun, 2);
          const scaled = simplified.map((p) => ({
            x: (p.x / width) * workspaceMaxX * config.scaleFactor,
            y: (p.y / height) * workspaceMaxY * config.scaleFactor,
            z: 0,
          }));

          // Move to start
          paths.push({
            points: [{ ...scaled[0], z: 10 }],
            speed,
            penDown: false,
          });

          paths.push({
            points: scaled,
            speed,
            penDown: true,
          });

          totalPoints += simplified.length;
          if (totalPoints >= config.maxPoints) return paths;
        }
        runStart = null;
        currentRun.length = 0;
      }
    }

    // Handle run that extends to end of row
    if (runStart !== null && currentRun.length > 1) {
      const simplified = simplifyPath(currentRun, 2);
      const scaled = simplified.map((p) => ({
        x: (p.x / width) * workspaceMaxX * config.scaleFactor,
        y: (p.y / height) * workspaceMaxY * config.scaleFactor,
        z: 0,
      }));

      paths.push({
        points: [{ ...scaled[0], z: 10 }],
        speed,
        penDown: false,
      });

      paths.push({
        points: scaled,
        speed,
        penDown: true,
      });

      totalPoints += simplified.length;
      if (totalPoints >= config.maxPoints) return paths;
    }
  }

  return paths;
}

/**
 * Loads an image from a File and returns an ImageData object scaled to the given dimensions.
 */
export function loadImageToCanvas(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<{ imageData: ImageData; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const width = Math.floor(img.width * scale);
      const height = Math.floor(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      resolve({ imageData, width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Renders edge detection result onto a canvas for preview.
 */
export function renderEdgesToCanvas(
  ctx: CanvasRenderingContext2D,
  edges: boolean[][],
  invert: boolean
): void {
  const height = edges.length;
  const width = edges[0]?.length ?? 0;
  if (width === 0) return;

  const imageData = ctx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isEdge = invert ? !edges[y][x] : edges[y][x];
      const value = isEdge ? 255 : 0;
      const idx = (y * width + x) * 4;
      imageData.data[idx] = value;
      imageData.data[idx + 1] = value;
      imageData.data[idx + 2] = value;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
