import React from 'react';
import { RobotStatus } from '../types/robot';

interface StatusIndicatorProps {
  status: RobotStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const modeLabel: Record<RobotStatus['operationMode'], string> = {
    manual: 'Manual Control',
    drawing: 'AI Drawing',
    image: 'Image Import',
    idle: 'Idle',
  };

  return (
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 space-y-3">
      <p className="text-xs text-gray-400 uppercase tracking-wider">System Status</p>

      {/* Connection */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Connection</span>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              status.isConnected ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              status.isConnected ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {status.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Mode */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Mode</span>
        <span className="text-sm font-medium text-blue-400">
          {modeLabel[status.operationMode]}
        </span>
      </div>

      {/* Moving status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Motion</span>
        <div className="flex items-center gap-2">
          {status.isMoving && (
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
          <span
            className={`text-sm font-medium ${
              status.isMoving ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            {status.isMoving ? 'Moving' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Speed bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Speed</span>
          <span className="font-mono">{status.speed}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${status.speed}%` }}
          />
        </div>
      </div>

      {/* Error */}
      {status.lastError && (
        <div className="bg-red-900/30 border border-red-700/50 rounded p-2">
          <p className="text-xs text-red-400">⚠ {status.lastError}</p>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
