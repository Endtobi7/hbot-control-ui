import React, { useState } from 'react';
import { RobotConfig } from '../types/robot';
import robotService from '../services/robotService';
import StatusIndicator from './StatusIndicator';
import { RobotStatus } from '../types/robot';

interface Props {
  status: RobotStatus;
}

const Settings: React.FC<Props> = ({ status }) => {
  const [config, setConfig] = useState<RobotConfig>({ ...robotService.config });
  const [saved, setSaved] = useState(false);
  const [wsUrl, setWsUrl] = useState(
    process.env.REACT_APP_ROBOT_WS_URL || 'ws://localhost:8080'
  );

  const handleSave = () => {
    robotService.updateConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleConnect = () => {
    robotService.connect();
  };

  const handleDisconnect = () => {
    robotService.disconnect();
  };

  const NumberField: React.FC<{
    label: string;
    value: number;
    min?: number;
    max?: number;
    unit?: string;
    onChange: (v: number) => void;
  }> = ({ label, value, min = 0, max = 9999, unit = 'mm', onChange }) => (
    <div className="space-y-1">
      <label className="text-xs text-primary-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-primary-900 border border-primary-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent-blue"
        />
        <span className="text-xs text-primary-500 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">

        {/* Connection settings */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
            Connection
          </h3>

          <div className="space-y-1">
            <label className="text-xs text-primary-400">WebSocket URL</label>
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="ws://192.168.1.100:8080"
              className="w-full bg-primary-900 border border-primary-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent-blue"
            />
            <div className="text-xs text-primary-500">
              Set via REACT_APP_ROBOT_WS_URL environment variable or configure here
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConnect}
              disabled={status.isConnected}
              className="px-4 py-2 bg-accent-green hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40"
            >
              🔌 Connect
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!status.isConnected}
              className="px-4 py-2 bg-accent-red hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40"
            >
              ✕ Disconnect
            </button>
          </div>
        </div>

        {/* Workspace dimensions */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
            Workspace Dimensions
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <NumberField
              label="Max X"
              value={config.maxX}
              max={1000}
              onChange={(v) => setConfig((c) => ({ ...c, maxX: v }))}
            />
            <NumberField
              label="Max Y"
              value={config.maxY}
              max={1000}
              onChange={(v) => setConfig((c) => ({ ...c, maxY: v }))}
            />
            <NumberField
              label="Max Z"
              value={config.maxZ}
              max={500}
              onChange={(v) => setConfig((c) => ({ ...c, maxZ: v }))}
            />
          </div>
        </div>

        {/* Speed limits */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
            Speed Limits
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Min Speed"
              value={config.minSpeed}
              min={1}
              max={100}
              unit="%"
              onChange={(v) => setConfig((c) => ({ ...c, minSpeed: v }))}
            />
            <NumberField
              label="Max Speed"
              value={config.maxSpeed}
              min={1}
              max={100}
              unit="%"
              onChange={(v) => setConfig((c) => ({ ...c, maxSpeed: v }))}
            />
          </div>
        </div>

        {/* Calibration offset */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
            Calibration Offset
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <NumberField
              label="Offset X"
              value={config.calibrationOffset.x}
              min={-500}
              max={500}
              onChange={(v) =>
                setConfig((c) => ({
                  ...c,
                  calibrationOffset: { ...c.calibrationOffset, x: v },
                }))
              }
            />
            <NumberField
              label="Offset Y"
              value={config.calibrationOffset.y}
              min={-500}
              max={500}
              onChange={(v) =>
                setConfig((c) => ({
                  ...c,
                  calibrationOffset: { ...c.calibrationOffset, y: v },
                }))
              }
            />
            <NumberField
              label="Offset Z"
              value={config.calibrationOffset.z}
              min={-100}
              max={100}
              onChange={(v) =>
                setConfig((c) => ({
                  ...c,
                  calibrationOffset: { ...c.calibrationOffset, z: v },
                }))
              }
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-all ${
              saved
                ? 'bg-accent-green text-white'
                : 'bg-accent-blue hover:bg-blue-600 text-white'
            }`}
          >
            {saved ? '✓ Saved!' : '💾 Save Settings'}
          </button>
          <button
            onClick={() => setConfig({ ...robotService.config })}
            className="px-4 py-2.5 bg-primary-700 hover:bg-primary-600 border border-primary-500 text-sm text-white rounded-lg transition-all"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <StatusIndicator status={status} />

        {/* About */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
            About
          </h3>
          <div className="space-y-1 text-xs text-primary-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-white font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>System</span>
              <span className="text-white">H-Bot Cartesian</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol</span>
              <span className="text-white font-mono">WebSocket</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-900/20 rounded-xl border border-red-800 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
            Danger Zone
          </h3>
          <button
            onClick={() => robotService.emergencyStop()}
            className="w-full py-2.5 bg-accent-red hover:bg-red-600 text-white font-bold text-sm rounded-lg transition-all uppercase tracking-wider"
          >
            ⚠ Emergency Stop
          </button>
          <button
            onClick={() => robotService.home()}
            className="w-full py-2 bg-primary-700 hover:bg-primary-600 border border-primary-500 text-sm text-white rounded-lg transition-all"
          >
            ⌂ Home All Axes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
