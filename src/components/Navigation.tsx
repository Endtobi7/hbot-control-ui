import React from 'react';

export type PageId = 'manual' | 'drawing' | 'image' | 'settings';

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
}

interface NavigationProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'manual', label: 'Manual Control', icon: '🕹️' },
  { id: 'drawing', label: 'AI Drawing', icon: '✏️' },
  { id: 'image', label: 'Image Import', icon: '🖼️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const Navigation: React.FC<NavigationProps> = ({ activePage, onPageChange }) => {
  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="flex overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activePage === item.id
                ? 'border-blue-500 text-blue-400 bg-gray-800'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
