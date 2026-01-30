import React, { useState } from 'react';

const NavItem = ({ icon, text, active = false, hasSubmenu = false, expanded = false, onClick }: any) => {
  return (
    <div className={`
      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer select-none
      ${active ? 'bg-primary/10 text-primary dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}
    `} onClick={onClick}>
      <span className={`material-icons-round text-[20px] ${active ? 'text-primary' : 'group-hover:scale-110 transition-transform'}`}>
        {icon}
      </span>
      <span className="text-sm font-medium flex-1">{text}</span>
      {hasSubmenu && (
        <span className={`material-icons-round text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const [contentExpanded, setContentExpanded] = useState(true);

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-sidebar-dark border-r border-gray-200 dark:border-white/10 flex flex-col justify-between transition-colors duration-300 z-20">
      <div>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-icons-round text-xl">school</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">LearnMore</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          <NavItem icon="dashboard" text="Dashboard" />
          <NavItem icon="library_books" text="Courses" />
          <NavItem icon="fitness_center" text="Practice" />
          <NavItem icon="emoji_events" text="Rankings" />

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</div>
            
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg overflow-hidden">
              <NavItem 
                icon="admin_panel_settings" 
                text="Content" 
                hasSubmenu 
                expanded={contentExpanded} 
                onClick={() => setContentExpanded(!contentExpanded)}
              />
              
              <div className={`
                 overflow-hidden transition-all duration-300 ease-in-out
                 ${contentExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
              `}>
                <div className="pl-11 pr-3 pb-2 space-y-1">
                  <a className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer" href="#">Batch Import</a>
                  <a className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer" href="#">Audit Queue</a>
                  <a className="block px-3 py-2 text-sm text-primary font-medium bg-primary/10 dark:bg-primary/20 rounded cursor-pointer" href="#">Statistics</a>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <NavItem icon="analytics" text="Reports" />
            </div>
          </div>
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors group">
          <img 
            alt="User Avatar" 
            className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-gray-700 group-hover:ring-primary transition-all" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuASlxkK4hgdjybpthRmigl0A-nkOrnpTTH5mlTJ7YmZUedoWoHEmPXMBaUkE5aKlTEQlns6rdbWHA1uz5BnelaDCydf-UFVsB286e6Q7JKXy3KYutBkcm7BJ6D_u8bHVdTfwN6VAfY-mTcO_zp9N1X66QgJ41ck40qxTu8wd4XG-NW-EU072UKWIcEij4uoTP4k0hsKDyUIglz4c9wsFy4XdfGk9YvTy09EX-PPaz200PnRmbtS2lv6Am62xJVBZzK8Bqn0LaciYlY"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Alex Morgan</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Admin</p>
          </div>
          <span className="material-icons-round text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">settings</span>
        </div>
        
        <div className="mt-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            System Online
          </div>
          <button 
            className="text-gray-400 hover:text-primary transition-colors"
            onClick={() => document.body.classList.toggle('dark')}
            title="Toggle Theme"
          >
            <span className="material-icons-round text-lg">brightness_4</span>
          </button>
        </div>
      </div>
    </aside>
  );
};