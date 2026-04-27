import React from 'react';
import { RobotStatus } from '../types/robot';

interface Props {
  status: RobotStatus;
}

const MODE_LABELS: Record<RobotStatus['operationMode'], string> = {
  idle: 'Idle',
  manual: 'Manual',
  drawing: 'AI Drawing',
  image: 'Image Trace',
};

const StatusIndicator: React.FC<Props> = ({ status }) => {
  return (
    <div className="bg-primary-800 rounded-xl border border-primary-600 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
        System Status
      </h3>

      {/* Connection */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-primary-400">Connection</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              status.isConnected
                ? 'bg-accent-green animate-pulse-green'
                : 'bg-accent-red animate-pulse-red'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              status.isConnected ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {status.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Operation mode */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-primary-400">Mode</span>
        <span className="text-sm font-medium text-white">
          {MODE_LABELS[status.operationMode]}
        </span>
      </div>

      {/* Movement status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-primary-400">Motion</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              status.isMoving ? 'bg-accent-yellow animate-pulse' : 'bg-primary-500'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              status.isMoving ? 'text-accent-yellow' : 'text-primary-400'
            }`}
          >
            {status.isMoving ? 'Moving' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Speed */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Speed</span>
          <span className="text-sm font-mono text-white">{status.speed}%</span>
        </div>
        <div className="w-full bg-primary-600 rounded-full h-1.5">
          <div
            className="bg-accent-blue h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${status.speed}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {status.lastError && (
        <div className="flex items-start gap-2 bg-red-900/30 border border-red-800 rounded-lg p-2.5">
          <svg className="w-4 h-4 text-accent-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-red-300">{status.lastError}</span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
