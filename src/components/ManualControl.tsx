import React, { useState } from 'react';
import robotService from '../services/robotService';

export const ManualControl: React.FC = () => {
  const [speed, setSpeed] = useState(50);
  const [stepSize, setStepSize] = useState(10);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  const handleMove = (dx: number, dy: number, dz: number) => {
    robotService.moveRelative(dx * stepSize, dy * stepSize, dz * stepSize, speed);
  };

  const handleEmergencyStop = () => {
    robotService.emergencyStop();
  };

  const handleCalibrate = () => {
    robotService.calibrate();
  };

  return (
    <div className="w-full space-y-6">
      {/* Speed Control */}
      <div className="bg-primary-800 rounded-lg p-4 border border-primary-700">
        <label className="block text-sm font-medium text-primary-300 mb-2">
          Speed: {speed}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Step Size Control */}
      <div className="bg-primary-800 rounded-lg p-4 border border-primary-700">
        <label className="block text-sm font-medium text-primary-300 mb-2">
          Step Size: {stepSize}mm
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={stepSize}
          onChange={(e) => setStepSize(Number(e.target.value))}
          className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Position Display */}
      <div className="bg-primary-800 rounded-lg p-4 border border-primary-700">
        <p className="text-xs text-primary-400 mb-2">Current Position</p>
        <div className="grid grid-cols-3 gap-2 font-mono text-sm">
          <div>
            <span className="text-primary-400">X: </span>
            <span className="text-accent-green">{position.x.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-primary-400">Y: </span>
            <span className="text-accent-green">{position.y.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-primary-400">Z: </span>
            <span className="text-accent-green">{position.z.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Joystick Controls */}
      <div className="space-y-4">
        {/* XY Plane */}
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <p className="text-xs text-primary-400 mb-4">XY Plane Control</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div />
            <button
              onClick={() => handleMove(0, 1, 0)}
              className="bg-accent-blue hover:bg-accent-blue/80 text-white font-bold py-3 rounded transition"
            >
              ↑ Y+
            </button>
            <div />
            <button
              onClick={() => handleMove(-1, 0, 0)}
              className="bg-accent-blue hover:bg-accent-blue/80 text-white font-bold py-3 rounded transition"
            >
              ← X-
            </button>
            <button
              onClick={() => handleMove(0, 0, 0)}
              className="bg-primary-700 text-primary-400 font-bold py-3 rounded"
              disabled
            >
              ◇
            </button>
            <button
              onClick={() => handleMove(1, 0, 0)}
              className="bg-accent-blue hover:bg-accent-blue/80 text-white font-bold py-3 rounded transition"
            >
              X+ →
            </button>
            <div />
            <button
              onClick={() => handleMove(0, -1, 0)}
              className="bg-accent-blue hover:bg-accent-blue/80 text-white font-bold py-3 rounded transition"
            >
              ↓ Y-
            </button>
            <div />
          </div>
        </div>

        {/* Z Plane */}
        <div className="bg-primary-800 rounded-lg p-4 border border-primary-700">
          <p className="text-xs text-primary-400 mb-4">Z Axis Control</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleMove(0, 0, 1)}
              className="flex-1 bg-accent-green hover:bg-accent-green/80 text-white font-bold py-3 rounded transition"
            >
              ↑ Z+
            </button>
            <button
              onClick={() => handleMove(0, 0, -1)}
              className="flex-1 bg-accent-green hover:bg-accent-green/80 text-white font-bold py-3 rounded transition"
            >
              ↓ Z-
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCalibrate}
          className="flex-1 bg-accent-blue hover:bg-accent-blue/80 text-white font-bold py-2 rounded transition"
        >
          Calibrate
        </button>
        <button
          onClick={handleEmergencyStop}
          className="flex-1 bg-accent-red hover:bg-accent-red/80 text-white font-bold py-2 rounded transition"
        >
          ⚠ EMERGENCY STOP
        </button>
      </div>
    </div>
  );
};