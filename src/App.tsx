import React from 'react';
import RobotVisualizer from './components/RobotVisualizer';
import StatusIndicator from './components/StatusIndicator';
import Navigation from './components/Navigation';
import AIDrawing from './pages/AIDrawing';
import ImageImport from './pages/ImageImport';
import Settings from './components/Settings';
import RobotPositionDisplay from './components/RobotPositionDisplay';

const App: React.FC = () => {
    return (
        <div className="App">
            <Navigation />
            <StatusIndicator />
            <RobotVisualizer />
            <AIDrawing />
            <ImageImport />
            <Settings />
            <RobotPositionDisplay />
        </div>
    );
};

export default App;