import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation, { PageId } from './components/Navigation';
import StatusIndicator from './components/StatusIndicator';
import ManualControlPage from './pages/ManualControl';
import AIDrawing from './pages/AIDrawing';
import ImageImport from './pages/ImageImport';
import Settings from './components/Settings';
import { RobotStatus, RobotPosition, RobotConfig } from './types/robot';
import robotService from './services/robotService';

const DEFAULT_STATUS: RobotStatus = {
  isConnected: false,
  isMoving: false,
  currentPosition: { x: 0, y: 0, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
  speed: 50,
  operationMode: 'idle',
};

const DEFAULT_CONFIG: RobotConfig = {
  maxX: 300,
  maxY: 300,
  maxZ: 100,
  minSpeed: 5,
  maxSpeed: 100,
  calibrationOffset: { x: 0, y: 0, z: 0 },
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('manual');
  const [robotStatus, setRobotStatus] = useState<RobotStatus>(DEFAULT_STATUS);
  const [robotConfig, setRobotConfig] = useState<RobotConfig>(DEFAULT_CONFIG);
  const [wsUrl, setWsUrl] = useState(
    process.env.REACT_APP_ROBOT_WS_URL || 'ws://localhost:8080'
  );

  useEffect(() => {
    const onConnected = () => {
      setRobotStatus((prev) => ({ ...prev, isConnected: true, lastError: undefined }));
    };

    const onDisconnected = () => {
      setRobotStatus((prev) => ({
        ...prev,
        isConnected: false,
        isMoving: false,
        operationMode: 'idle',
      }));
    };

    const onMessage = (data: any) => {
      if (data?.type === 'status') {
        setRobotStatus((prev) => ({
          ...prev,
          isMoving: data.isMoving ?? prev.isMoving,
          currentPosition: data.position ?? prev.currentPosition,
          speed: data.speed ?? prev.speed,
          operationMode: data.mode ?? prev.operationMode,
        }));
      } else if (data?.type === 'position') {
        setRobotStatus((prev) => ({
          ...prev,
          currentPosition: data.position,
        }));
      }
    };

    const onError = () => {
      setRobotStatus((prev) => ({
        ...prev,
        lastError: 'Connection error. Retrying…',
      }));
    };

    robotService.on('connected', onConnected);
    robotService.on('disconnected', onDisconnected);
    robotService.on('message', onMessage);
    robotService.on('error', onError);

    // Attempt initial connection
    robotService.connect().catch(() => {});

    return () => {
      robotService.off('connected', onConnected);
      robotService.off('disconnected', onDisconnected);
      robotService.off('message', onMessage);
      robotService.off('error', onError);
    };
  }, []);

  const handlePositionChange = (pos: RobotPosition) => {
    setRobotStatus((prev) => ({ ...prev, targetPosition: pos }));
  };

  const handlePageChange = (page: PageId) => {
    setActivePage(page);
    const modeMap: Record<PageId, RobotStatus['operationMode']> = {
      manual: 'manual',
      drawing: 'drawing',
      image: 'image',
      settings: 'idle',
    };
    setRobotStatus((prev) => ({ ...prev, operationMode: modeMap[page] }));
  };

  const handleConnect = () => {
    robotService.connect().catch(() => {});
  };

  const handleDisconnect = () => {
    robotService.disconnect();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'manual':
        return (
          <ManualControlPage
            currentPosition={robotStatus.currentPosition}
            targetPosition={robotStatus.targetPosition}
            onPositionChange={handlePositionChange}
          />
        );
      case 'drawing':
        return <AIDrawing />;
      case 'image':
        return <ImageImport />;
      case 'settings':
        return (
          <Settings
            config={robotConfig}
            onConfigChange={setRobotConfig}
            wsUrl={wsUrl}
            onWsUrlChange={setWsUrl}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={robotStatus.isConnected}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-xl">⊕</span>
            <div>
              <h1 className="text-base font-bold text-gray-100 leading-tight">H-Bot Control</h1>
              <p className="text-xs text-gray-500">Cartesian Robot Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                robotStatus.isConnected
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-400">
              {robotStatus.isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activePage={activePage} onPageChange={handlePageChange} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Page Content */}
          <div className="xl:col-span-3">{renderPage()}</div>

          {/* Sidebar Status */}
          <div className="space-y-4">
            <StatusIndicator status={robotStatus} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
