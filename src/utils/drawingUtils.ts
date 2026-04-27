import { DrawingPath } from '../types/robot';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  penSize: number;
  color: string;
}

/**
 * Normalizes drawing strokes from canvas coordinates to robot workspace coordinates.
 */
export function normalizeStrokesToPaths(
  strokes: Stroke[],
  canvasWidth: number,
  canvasHeight: number,
  workspaceMaxX: number,
  workspaceMaxY: number,
  speed: number
): DrawingPath[] {
  const paths: DrawingPath[] = [];

  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;

    // Move to start position with pen up
    const firstPoint = stroke.points[0];
    paths.push({
      points: [
        {
          x: (firstPoint.x / canvasWidth) * workspaceMaxX,
          y: (firstPoint.y / canvasHeight) * workspaceMaxY,
          z: 10, // pen up height
        },
      ],
      speed,
      penDown: false,
    });

    // Draw stroke with pen down
    const drawPoints = stroke.points.map((p) => ({
      x: (p.x / canvasWidth) * workspaceMaxX,
      y: (p.y / canvasHeight) * workspaceMaxY,
      z: 0, // pen down height
    }));

    paths.push({
      points: drawPoints,
      speed,
      penDown: true,
    });
  }

  // Lift pen at end
  if (paths.length > 0) {
    const lastPath = paths[paths.length - 1];
    const lastPoint = lastPath.points[lastPath.points.length - 1];
    paths.push({
      points: [{ ...lastPoint, z: 10 }],
      speed,
      penDown: false,
    });
  }

  return paths;
}

/**
 * Simplifies a path using the Ramer–Douglas–Peucker algorithm.
 */
export function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  const dmax = { value: 0, index: 0 };

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > dmax.value) {
      dmax.value = d;
      dmax.index = i;
    }
  }

  if (dmax.value > epsilon) {
    const rec1 = simplifyPath(points.slice(0, dmax.index + 1), epsilon);
    const rec2 = simplifyPath(points.slice(dmax.index), epsilon);
    return [...rec1.slice(0, -1), ...rec2];
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
  return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / len;
}

/**
 * Draws a smooth stroke on canvas using bezier curves.
 */
export function drawSmoothStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  lineWidth: number
): void {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }

  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

/**
 * Redraws all strokes on canvas from scratch.
 */
export function redrawCanvas(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  for (const stroke of strokes) {
    drawSmoothStroke(ctx, stroke.points, stroke.color, stroke.penSize);
  }
}

/**
 * Draws the robot workspace grid overlay.
 */
export function drawWorkspaceGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = 50
): void {
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
