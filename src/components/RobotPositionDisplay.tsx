import React from 'react';
import { RobotPosition } from '../types/robot';

interface RobotPositionDisplayProps {
  position: RobotPosition;
  label?: string;
}

const RobotPositionDisplay: React.FC<RobotPositionDisplayProps> = ({
  position,
  label = 'Position',
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</p>
      <div className="grid grid-cols-3 gap-3 font-mono text-sm">
        <div className="text-center">
          <span className="text-gray-500 text-xs block">X</span>
          <span className="text-green-400 font-semibold">{position.x.toFixed(2)}</span>
        </div>
        <div className="text-center">
          <span className="text-gray-500 text-xs block">Y</span>
          <span className="text-green-400 font-semibold">{position.y.toFixed(2)}</span>
        </div>
        <div className="text-center">
          <span className="text-gray-500 text-xs block">Z</span>
          <span className="text-green-400 font-semibold">{position.z.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default RobotPositionDisplay;
