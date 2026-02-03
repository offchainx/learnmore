import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Download, 
  ChevronDown, 
  MoreHorizontal, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Eye,
  Ban,
  Mail,
  GraduationCap
} from 'lucide-react';
import { User, UserStatus, SubscriptionTier, SortConfig } from '../types';
import { Badge } from './Badge';
import { BanUserModal } from './Modals';

// --- Helper Components ---

const Avatar: React.FC<{ name: string; colorClass: string }> = ({ name, colorClass }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${colorClass}`}>
      {initials}
    </div>
  );
};

const IconButton: React.FC<{ icon: React.ReactNode; onClick?: (e: React.MouseEvent) => void; className?: string }> = ({ icon, onClick, className = '' }) => (
  <button 
    onClick={onClick}
    className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ${className}`}
  >
    {icon}
  </button>
);

// --- Props Interface ---

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onUserSelect: (user: User) => void;
  onUserUpdate: (userId: string, status: UserStatus) => void;
}

// --- Main Component ---

export const UserList: React.FC<UserListProps> = ({ users, isLoading, onUserSelect, onUserUpdate }) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All');
  const [tierFilter, setTierFilter] = useState<SubscriptionTier | 'All'>('All');
  
  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastActive', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // UI State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // Modals
  const [userToBan, setUserToBan] = useState<User | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.action-menu')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId]);

  // --- Logic ---

  const handleSort = (key: keyof User) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTierFilter('All');
    setCurrentPage(1);
  };

  const isFiltered = searchQuery !== '' || statusFilter !== 'All' || tierFilter !== 'All';

  // Memoized Data Processing
  const processedData = useMemo(() => {
    let result = [...users];

    // 1. Filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.school.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(u => u.status === statusFilter);
    }
    if (tierFilter !== 'All') {
      result = result.filter(u => u.tier === tierFilter);
    }

    // 2. Sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'lastActive') {
        // Date comparison
        const dateA = new Date(a.lastActive).getTime();
        const dateB = new Date(b.lastActive).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, statusFilter, tierFilter, sortConfig]);

  // Pagination Logic
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = processedData.slice(startIndex, startIndex + itemsPerPage);

  // Ensure current page is valid after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // --- Render Helpers ---

  const renderSortIcon = (key: keyof User) => {
    if (sortConfig.key !== key) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-blue-400" />
      : <ArrowDown className="w-4 h-4 ml-1 text-blue-400" />;
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading User Directory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
            <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-700">
              Total {users.length} users
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-all focus:ring-2 focus:ring-slate-700 focus:outline-none">
            <Download size={16} />
            Export
          </button>
        </div>

        {/* --- Toolbar --- */}
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between bg-slate-900/50 p-1 rounded-xl">
          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            {/* Search */}
            <div className="relative group w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search user, email or school..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Filters Group */}
            <div className="flex flex-row gap-3 overflow-x-auto pb-1 md:pb-0">
              {/* Status Select */}
              <div className="relative min-w-[140px]">
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as UserStatus | 'All');
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <option value="All">Status: All</option>
                  {Object.values(UserStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>

              {/* Tier Select */}
              <div className="relative min-w-[140px]">
                <select 
                  value={tierFilter}
                  onChange={(e) => {
                    setTierFilter(e.target.value as SubscriptionTier | 'All');
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <option value="All">Tier: All</option>
                  {Object.values(SubscriptionTier).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Reset Link */}
            {isFiltered && (
              <button 
                onClick={resetFilters}
                className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4 self-center whitespace-nowrap px-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* --- Table Card --- */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/20 flex flex-col min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th 
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      User Info
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                    onClick={() => handleSort('grade')}
                  >
                    <div className="flex items-center">
                      Education
                      {renderSortIcon('grade')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                    onClick={() => handleSort('tier')}
                  >
                    <div className="flex items-center">
                      Subscription Tier
                      {renderSortIcon('tier')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {renderSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                    onClick={() => handleSort('lastActive')}
                  >
                    <div className="flex items-center">
                      Last Active
                      {renderSortIcon('lastActive')}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {currentData.length > 0 ? (
                  currentData.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => onUserSelect(user)}
                      className="group hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} colorClass={user.avatarColor} />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                              {user.name}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                         <div className="flex flex-col">
                            <span className="text-sm text-slate-300">{user.grade}</span>
                            <span className="text-xs text-slate-500 truncate max-w-[120px]" title={user.school}>
                              {user.school}
                            </span>
                          </div>
                      </td>
                      <td className="py-3 px-6">
                        <Badge type="tier" value={user.tier} />
                      </td>
                      <td className="py-3 px-6">
                        <Badge type="status" value={user.status} />
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-slate-400">{user.lastActiveLabel}</span>
                      </td>
                      <td className="py-3 px-6 text-right relative action-menu">
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <IconButton 
                            icon={<MoreHorizontal size={18} />} 
                            onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                            className={activeDropdownId === user.id ? 'bg-slate-800 text-slate-200' : ''}
                          />
                        </div>
                        
                        {/* Dropdown Menu */}
                        {activeDropdownId === user.id && (
                          <div 
                            className="absolute right-6 top-10 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              <button 
                                onClick={() => {
                                  onUserSelect(user);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                              >
                                <Eye size={14} />
                                View Details
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                                <Mail size={14} />
                                Send Invitation
                              </button>
                              <div className="h-px bg-slate-800 my-1 mx-2" />
                              <button 
                                onClick={() => {
                                  if (user.status === UserStatus.BANNED) {
                                    onUserUpdate(user.id, UserStatus.ACTIVE);
                                  } else {
                                    setUserToBan(user);
                                  }
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                              >
                                <Ban size={14} />
                                {user.status === UserStatus.BANNED ? 'Unban User' : 'Quick Ban'}
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Filter className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                        <button 
                          onClick={resetFilters}
                          className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- Pagination Footer --- */}
          <div className="border-t border-slate-800 bg-slate-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none mt-auto">
            
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-300">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-slate-300">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-medium text-slate-300">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) p = currentPage - 2 + i;
                    if (p > totalPages) p = totalPages - (4 - i);
                  }
                  
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === p 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Show</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      <BanUserModal 
        isOpen={!!userToBan}
        userName={userToBan?.name || ''}
        onClose={() => setUserToBan(null)}
        onConfirm={(duration, reason) => {
          if (userToBan) {
            console.log(`Banning user ${userToBan.id} for ${duration} because: ${reason}`);
            onUserUpdate(userToBan.id, UserStatus.BANNED);
          }
        }}
      />
    </div>
  );
};