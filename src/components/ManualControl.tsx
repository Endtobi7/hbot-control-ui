import React, { useState, useCallback } from 'react';
import { RobotStatus } from '../types/robot';
import robotService from '../services/robotService';
import RobotVisualizer from './RobotVisualizer';
import StatusIndicator from './StatusIndicator';

interface Props {
  status: RobotStatus;
}

const STEP_OPTIONS = [0.1, 1, 5, 10, 25, 50];

const ManualControl: React.FC<Props> = ({ status }) => {
  const [step, setStep] = useState(5);
  const [speed, setSpeed] = useState(status.speed);

  const move = useCallback((axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
    robotService.moveRelative({ [axis]: step * direction }, speed);
  }, [step, speed]);

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    robotService.setSpeed(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Emergency Stop */}
        <button
          onClick={() => robotService.emergencyStop()}
          className="w-full py-4 bg-accent-red hover:bg-red-600 text-white font-bold text-lg rounded-xl border-2 border-red-400 transition-all duration-200 shadow-lg hover:shadow-red-900/50 uppercase tracking-widest"
        >
          ⚠ Emergency Stop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* XY Control */}
          <div className="bg-primary-800 rounded-xl border border-primary-600 p-5">
            <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4">
              X / Y Axis
            </h3>
            <div className="flex flex-col items-center gap-2">
              {/* Y+ */}
              <AxisButton
                onClick={() => move('y', -1)}
                label="Y+"
                icon="▲"
                color="blue"
                disabled={status.isMoving}
              />
              <div className="flex gap-2">
                {/* X- */}
                <AxisButton
                  onClick={() => move('x', -1)}
                  label="X-"
                  icon="◀"
                  color="blue"
                  disabled={status.isMoving}
                />
                {/* Home */}
                <button
                  onClick={() => robotService.home()}
                  disabled={status.isMoving}
                  className="w-14 h-14 bg-primary-700 hover:bg-primary-600 border border-primary-500 rounded-xl text-white text-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Home"
                >
                  ⌂
                </button>
                {/* X+ */}
                <AxisButton
                  onClick={() => move('x', 1)}
                  label="X+"
                  icon="▶"
                  color="blue"
                  disabled={status.isMoving}
                />
              </div>
              {/* Y- */}
              <AxisButton
                onClick={() => move('y', 1)}
                label="Y-"
                icon="▼"
                color="blue"
                disabled={status.isMoving}
              />
            </div>
          </div>

          {/* Z Axis */}
          <div className="bg-primary-800 rounded-xl border border-primary-600 p-5">
            <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4">
              Z Axis (Pen)
            </h3>
            <div className="flex flex-col items-center gap-3">
              <AxisButton
                onClick={() => move('z', 1)}
                label="Z+"
                icon="▲"
                color="green"
                disabled={status.isMoving}
              />
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="w-3 h-20 bg-primary-700 rounded-full relative overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full bg-accent-green rounded-full transition-all duration-300"
                    style={{ height: `${(status.currentPosition.z / 100) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-primary-400 font-mono">
                  {status.currentPosition.z.toFixed(1)} mm
                </span>
              </div>
              <AxisButton
                onClick={() => move('z', -1)}
                label="Z-"
                icon="▼"
                color="green"
                disabled={status.isMoving}
              />
            </div>
          </div>
        </div>

        {/* Step size */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-5">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-3">
            Step Size
          </h3>
          <div className="flex flex-wrap gap-2">
            {STEP_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-all ${
                  step === s
                    ? 'bg-accent-blue text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600 hover:text-white'
                }`}
              >
                {s} mm
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
              Speed
            </h3>
            <span className="text-sm font-mono text-white font-bold">{speed}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-primary-500 mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Position display */}
        <div className="bg-primary-800 rounded-xl border border-primary-600 p-5">
          <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-3">
            Current Position
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="bg-primary-900 rounded-lg p-3 text-center">
                <div className="text-xs text-primary-400 uppercase font-medium mb-1">{axis}</div>
                <div className="text-xl font-mono text-white font-bold">
                  {status.currentPosition[axis].toFixed(1)}
                </div>
                <div className="text-xs text-primary-500">mm</div>
              </div>
            ))}
          </div>
        </div>

        {/* Calibrate */}
        <button
          onClick={() => robotService.calibrate()}
          disabled={status.isMoving}
          className="px-4 py-2.5 bg-primary-700 hover:bg-primary-600 border border-primary-500 text-sm text-white rounded-lg transition-all disabled:opacity-40"
        >
          🔧 Calibrate / Home All Axes
        </button>
      </div>

      {/* Visualizer column */}
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
      </div>
    </div>
  );
};

interface AxisButtonProps {
  onClick: () => void;
  label: string;
  icon: string;
  color: 'blue' | 'green';
  disabled?: boolean;
}

const AxisButton: React.FC<AxisButtonProps> = ({ onClick, label, icon, color, disabled }) => {
  const colorClasses = {
    blue: 'bg-blue-900/50 hover:bg-blue-800 border-blue-700 text-blue-300 hover:text-white',
    green: 'bg-green-900/50 hover:bg-green-800 border-green-700 text-green-300 hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`w-14 h-14 rounded-xl border font-bold text-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${colorClasses[color]}`}
    >
      {icon}
    </button>
  );
};

export default ManualControl;
