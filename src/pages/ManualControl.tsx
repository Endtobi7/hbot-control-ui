import React from 'react';
import { RobotPosition } from '../types/robot';
import ManualControl from '../components/ManualControl';
import RobotVisualizer from '../components/RobotVisualizer';

interface ManualControlPageProps {
  currentPosition: RobotPosition;
  targetPosition: RobotPosition;
  onPositionChange: (pos: RobotPosition) => void;
}

const ManualControlPage: React.FC<ManualControlPageProps> = ({
  currentPosition,
  targetPosition,
  onPositionChange,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <ManualControl
          currentPosition={currentPosition}
          onPositionChange={onPositionChange}
        />
      </div>
      <div>
        <RobotVisualizer
          currentPosition={currentPosition}
          targetPosition={targetPosition}
        />
      </div>
    </div>
  );
};

export default ManualControlPage;
