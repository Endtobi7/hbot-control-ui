import React from 'react';

type Page = 'manual' | 'drawing' | 'image' | 'settings';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isConnected: boolean;
}

const PAGES: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: 'manual',
    label: 'Manual',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    id: 'drawing',
    label: 'AI Drawing',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'image',
    label: 'Image',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const Navigation: React.FC<Props> = ({ activePage, onNavigate, isConnected }) => {
  return (
    <nav className="bg-primary-800 border-b border-primary-600">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">H-Bot Control</span>
            <div className={`flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-green-900/50 text-accent-green border border-green-800'
                : 'bg-red-900/50 text-accent-red border border-red-800'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>

          {/* Page tabs */}
          <div className="flex items-center gap-1">
            {PAGES.map((page) => (
              <button
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activePage === page.id
                    ? 'bg-accent-blue text-white shadow-md'
                    : 'text-primary-300 hover:text-white hover:bg-primary-700'
                }`}
              >
                {page.icon}
                <span className="hidden sm:inline">{page.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
export type { Page };
