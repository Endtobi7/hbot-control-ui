import React, { useState } from 'react';
import robotService from '../services/robotService';
import { RobotPosition } from '../types/robot';
import RobotPositionDisplay from './RobotPositionDisplay';

interface ManualControlProps {
  currentPosition: RobotPosition;
  onPositionChange?: (pos: RobotPosition) => void;
}

const ManualControl: React.FC<ManualControlProps> = ({ currentPosition, onPositionChange }) => {
  const [speed, setSpeed] = useState(50);
  const [stepSize, setStepSize] = useState(10);

  const handleMove = (dx: number, dy: number, dz: number) => {
    robotService.moveRelative(dx * stepSize, dy * stepSize, dz * stepSize, speed);
    if (onPositionChange) {
      onPositionChange({
        x: currentPosition.x + dx * stepSize,
        y: currentPosition.y + dy * stepSize,
        z: currentPosition.z + dz * stepSize,
      });
    }
  };

  const handleEmergencyStop = () => {
    robotService.emergencyStop();
  };

  const handleCalibrate = () => {
    robotService.calibrate();
  };

  return (
    <div className="w-full space-y-4">
      {/* Speed Control */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
          Speed: <span className="text-blue-400 font-mono">{speed}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Step Size Control */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
          Step Size: <span className="text-blue-400 font-mono">{stepSize}mm</span>
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={stepSize}
          onChange={(e) => setStepSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Position Display */}
      <RobotPositionDisplay position={currentPosition} label="Current Position" />

      {/* Joystick Controls */}
      <div className="space-y-3">
        {/* XY Plane */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">XY Plane</p>
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button
              onClick={() => handleMove(0, 1, 0)}
              className="bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold py-3 rounded transition-colors"
            >
              ↑ Y+
            </button>
            <div />
            <button
              onClick={() => handleMove(-1, 0, 0)}
              className="bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold py-3 rounded transition-colors"
            >
              ← X-
            </button>
            <button
              className="bg-gray-700 text-gray-500 font-bold py-3 rounded cursor-default"
              disabled
            >
              ◇
            </button>
            <button
              onClick={() => handleMove(1, 0, 0)}
              className="bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold py-3 rounded transition-colors"
            >
              X+ →
            </button>
            <div />
            <button
              onClick={() => handleMove(0, -1, 0)}
              className="bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold py-3 rounded transition-colors"
            >
              ↓ Y-
            </button>
            <div />
          </div>
        </div>

        {/* Z Axis */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Z Axis</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleMove(0, 0, 1)}
              className="flex-1 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold py-3 rounded transition-colors"
            >
              ↑ Z+
            </button>
            <button
              onClick={() => handleMove(0, 0, -1)}
              className="flex-1 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold py-3 rounded transition-colors"
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
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors text-sm"
        >
          Calibrate
        </button>
        <button
          onClick={handleEmergencyStop}
          className="flex-1 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-2 rounded transition-colors text-sm"
        >
          ⚠ EMERGENCY STOP
        </button>
      </div>
    </div>
  );
};

export default ManualControl;
