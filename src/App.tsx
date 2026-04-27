import React, { useState, useEffect } from 'react';
import { RobotStatus } from './types/robot';
import robotService from './services/robotService';
import Navigation, { Page } from './components/Navigation';
import ManualControl from './components/ManualControl';
import AIDrawing from './components/AIDrawing';
import ImageImport from './components/ImageImport';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('manual');
  const [status, setStatus] = useState<RobotStatus>(robotService.getStatus());

  useEffect(() => {
    // Subscribe to status updates
    const unsubStatus = robotService.onStatus((s) => setStatus(s));
    const unsubError = robotService.onError((err) => {
      console.error('[RobotService Error]', err);
    });

    // Auto-connect
    robotService.connect();

    return () => {
      unsubStatus();
      unsubError();
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'manual':
        return <ManualControl status={status} />;
      case 'drawing':
        return <AIDrawing status={status} />;
      case 'image':
        return <ImageImport status={status} />;
      case 'settings':
        return <Settings status={status} />;
      default:
        return <ManualControl status={status} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex flex-col">
      <Navigation
        activePage={activePage}
        onNavigate={setActivePage}
        isConnected={status.isConnected}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {activePage === 'manual' && 'Manual Control'}
            {activePage === 'drawing' && 'AI Drawing Mode'}
            {activePage === 'image' && 'Image Import Mode'}
            {activePage === 'settings' && 'Settings'}
          </h1>
          <p className="text-sm text-primary-400 mt-1">
            {activePage === 'manual' && 'Direct joystick-style control of robot axes'}
            {activePage === 'drawing' && 'Draw paths on canvas for the robot to execute'}
            {activePage === 'image' && 'Import and trace images with edge detection'}
            {activePage === 'settings' && 'Configure robot connection and workspace parameters'}
          </p>
        </div>

        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-700 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-primary-500">
          <span>H-Bot Cartesian Control System</span>
          <span className="font-mono">
            X:{status.currentPosition.x.toFixed(1)} Y:{status.currentPosition.y.toFixed(1)} Z:{status.currentPosition.z.toFixed(1)} mm
          </span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
