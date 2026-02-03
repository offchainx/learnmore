import React, { useState, useEffect } from 'react';
import { UserList } from './components/UserList';
import { UserDetail } from './components/UserDetail';
import { User, UserStatus } from './types';
import { generateUsers } from './services/mockData';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setUsers(generateUsers(248)); 
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleUserUpdate = (userId: string, newStatus: UserStatus) => {
    setUsers(currentUsers => 
      currentUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    
    // Also update selected user if it matches
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950">
      {selectedUser ? (
        <UserDetail 
          user={selectedUser} 
          onBack={() => setSelectedUser(null)}
          onUpdateStatus={handleUserUpdate}
        />
      ) : (
        <UserList 
          users={users} 
          isLoading={isLoading} 
          onUserSelect={setSelectedUser}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default App;