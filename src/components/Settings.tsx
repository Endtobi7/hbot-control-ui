import React, { useState } from 'react';
import { RobotConfig } from '../types/robot';

interface SettingsProps {
  config: RobotConfig;
  onConfigChange: (config: RobotConfig) => void;
  wsUrl: string;
  onWsUrlChange: (url: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnected: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  config,
  onConfigChange,
  wsUrl,
  onWsUrlChange,
  onConnect,
  onDisconnect,
  isConnected,
}) => {
  const [localUrl, setLocalUrl] = useState(wsUrl);

  const handleFieldChange = (
    field: keyof RobotConfig,
    value: number | { x: number; y: number; z: number }
  ) => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleSaveUrl = () => {
    onWsUrlChange(localUrl);
  };

  return (
    <div className="w-full space-y-6">
      {/* Connection Settings */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Connection</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">WebSocket URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder="ws://localhost:8080"
                className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveUrl}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onConnect}
              disabled={isConnected}
              className="flex-1 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Connect
            </button>
            <button
              onClick={onDisconnect}
              disabled={!isConnected}
              className="flex-1 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Limits */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Workspace Dimensions (mm)</h3>
        <div className="space-y-3">
          {(['maxX', 'maxY', 'maxZ'] as const).map((field) => (
            <div key={field} className="flex items-center gap-3">
              <label className="w-16 text-xs text-gray-400">
                {field.replace('max', 'Max ')}
              </label>
              <input
                type="number"
                value={config[field]}
                onChange={(e) =>
                  handleFieldChange(field, Number(e.target.value))
                }
                min={1}
                max={10000}
                className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-gray-500">mm</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speed Limits */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Speed Limits (%)</h3>
        <div className="space-y-3">
          {(['minSpeed', 'maxSpeed'] as const).map((field) => (
            <div key={field} className="flex items-center gap-3">
              <label className="w-16 text-xs text-gray-400">
                {field === 'minSpeed' ? 'Minimum' : 'Maximum'}
              </label>
              <input
                type="number"
                value={config[field]}
                onChange={(e) =>
                  handleFieldChange(field, Number(e.target.value))
                }
                min={0}
                max={100}
                className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calibration Offset */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Calibration Offset (mm)</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis}>
              <label className="block text-xs text-gray-400 mb-1 uppercase">{axis}</label>
              <input
                type="number"
                value={config.calibrationOffset[axis]}
                onChange={(e) =>
                  handleFieldChange('calibrationOffset', {
                    ...config.calibrationOffset,
                    [axis]: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
