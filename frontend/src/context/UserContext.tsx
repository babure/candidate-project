import { createContext, useContext, useState, type ReactNode } from 'react';

export type AppUser = {
  id: number;
  name: string;
  email: string;
};

export const USERS: AppUser[] = [
  { id: 1, name: 'Alice Martin', email: 'alice@marketnode.com' },
  { id: 2, name: 'Bob Chen', email: 'bob@marketnode.com' },
  { id: 3, name: 'Carol Smith', email: 'carol@marketnode.com' },
];

type UserContextValue = {
  currentUser: AppUser;
  users: AppUser[];
  setCurrentUser: (user: AppUser) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser>(USERS[0]);

  return (
    <UserContext.Provider value={{ currentUser, users: USERS, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
