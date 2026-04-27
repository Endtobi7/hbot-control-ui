export interface RobotPosition {
  x: number;
  y: number;
  z: number;
}

export interface RobotStatus {
  isConnected: boolean;
  isMoving: boolean;
  currentPosition: RobotPosition;
  targetPosition: RobotPosition;
  speed: number;
  operationMode: 'manual' | 'drawing' | 'image' | 'idle';
  lastError?: string;
}

export interface DrawingPath {
  points: Array<{ x: number; y: number; z: number }>;
  speed: number;
  penDown: boolean;
}

export interface RobotConfig {
  maxX: number;
  maxY: number;
  maxZ: number;
  minSpeed: number;
  maxSpeed: number;
  calibrationOffset: RobotPosition;
}

export interface ImageTraceConfig {
  threshold: number;
  invert: boolean;
  scaleFactor: number;
  maxSpeed: number;
}