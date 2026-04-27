import { RobotStatus, RobotPosition, DrawingPath, RobotConfig } from '../types/robot';

type StatusCallback = (status: RobotStatus) => void;
type ErrorCallback = (error: string) => void;

const DEFAULT_STATUS: RobotStatus = {
  isConnected: false,
  isMoving: false,
  currentPosition: { x: 0, y: 0, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
  speed: 50,
  operationMode: 'idle',
};

const DEFAULT_CONFIG: RobotConfig = {
  maxX: 300,
  maxY: 300,
  maxZ: 100,
  minSpeed: 1,
  maxSpeed: 100,
  calibrationOffset: { x: 0, y: 0, z: 0 },
};

class RobotService {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private statusCallbacks: StatusCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private status: RobotStatus = { ...DEFAULT_STATUS };
  public config: RobotConfig = { ...DEFAULT_CONFIG };
  private commandQueue: object[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.wsUrl =
      process.env.REACT_APP_ROBOT_WS_URL || 'ws://localhost:8080';
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateStatus({ isConnected: true });
        this.processQueue();
        // Request initial status
        this.send({ type: 'GET_STATUS' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string);
          this.handleMessage(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        this.updateStatus({ isConnected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.notifyError('WebSocket connection error');
        this.updateStatus({ isConnected: false });
      };
    } catch (e) {
      this.notifyError(`Failed to connect: ${e}`);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.maxReconnectAttempts = 0; // Stop reconnecting
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus({ isConnected: false });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(message: { type: string; [key: string]: unknown }): void {
    switch (message.type) {
      case 'STATUS':
        this.updateStatus(message.data as Partial<RobotStatus>);
        break;
      case 'POSITION':
        this.updateStatus({ currentPosition: message.position as RobotPosition });
        break;
      case 'MOVE_COMPLETE':
        this.updateStatus({ isMoving: false });
        this.processQueue();
        break;
      case 'ERROR':
        this.notifyError(message.message as string);
        this.updateStatus({ isMoving: false, lastError: message.message as string });
        break;
      case 'CONFIG':
        this.config = { ...this.config, ...(message.config as Partial<RobotConfig>) };
        break;
      default:
        break;
    }
  }

  private send(message: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.commandQueue.push(message);
    }
  }

  private processQueue(): void {
    if (this.isProcessingQueue || this.commandQueue.length === 0) return;
    this.isProcessingQueue = true;
    while (this.commandQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const cmd = this.commandQueue.shift();
      if (cmd) this.ws!.send(JSON.stringify(cmd));
    }
    this.isProcessingQueue = false;
  }

  private updateStatus(partial: Partial<RobotStatus>): void {
    this.status = { ...this.status, ...partial };
    this.statusCallbacks.forEach((cb) => cb({ ...this.status }));
  }

  private notifyError(message: string): void {
    this.errorCallbacks.forEach((cb) => cb(message));
  }

  onStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.push(callback);
    // Immediately notify with current status
    callback({ ...this.status });
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback);
    };
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  getStatus(): RobotStatus {
    return { ...this.status };
  }

  // Movement commands
  moveTo(position: Partial<RobotPosition>, speed?: number): void {
    const cmd = {
      type: 'MOVE_TO',
      position,
      speed: speed ?? this.status.speed,
    };
    this.updateStatus({ targetPosition: { ...this.status.currentPosition, ...position }, isMoving: true });
    this.send(cmd);
  }

  moveRelative(delta: Partial<RobotPosition>, speed?: number): void {
    const cmd = {
      type: 'MOVE_RELATIVE',
      delta,
      speed: speed ?? this.status.speed,
    };
    this.updateStatus({ isMoving: true });
    this.send(cmd);
  }

  emergencyStop(): void {
    this.commandQueue = [];
    this.send({ type: 'EMERGENCY_STOP' });
    this.updateStatus({ isMoving: false, operationMode: 'idle' });
  }

  setSpeed(speed: number): void {
    const clampedSpeed = Math.min(100, Math.max(0, speed));
    this.updateStatus({ speed: clampedSpeed });
    this.send({ type: 'SET_SPEED', speed: clampedSpeed });
  }

  // Drawing commands
  executeDrawingPath(paths: DrawingPath[]): void {
    this.updateStatus({ operationMode: 'drawing', isMoving: true });
    this.send({ type: 'EXECUTE_DRAWING', paths });
  }

  stopExecution(): void {
    this.commandQueue = [];
    this.send({ type: 'STOP_EXECUTION' });
    this.updateStatus({ isMoving: false, operationMode: 'idle' });
  }

  home(): void {
    this.send({ type: 'HOME' });
    this.updateStatus({ isMoving: true });
  }

  calibrate(): void {
    this.send({ type: 'CALIBRATE' });
  }

  setMode(mode: RobotStatus['operationMode']): void {
    this.updateStatus({ operationMode: mode });
    this.send({ type: 'SET_MODE', mode });
  }

  updateConfig(config: Partial<RobotConfig>): void {
    this.config = { ...this.config, ...config };
    this.send({ type: 'UPDATE_CONFIG', config: this.config });
  }
}

// Singleton
const robotService = new RobotService();
export default robotService;
