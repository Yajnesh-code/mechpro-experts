import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Lead, UserRole } from '../types';
import { mockCurrentUser } from '../data/mockData';
import { getLeads } from '../services/api';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  leads: Lead[];
  setLeads: (l: Lead[]) => void;
  addLead: (l: Lead) => void;
  updateLead: (l: Lead) => void;
  refreshLeads: () => Promise<void>;
  logout: () => void;
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: ReactNode }) {
  const storedUser = localStorage.getItem('mp_user');
  const storedToken = localStorage.getItem('mp_token') || localStorage.getItem('mechpro_access_token');
  const [currentUser, setCurrentUserState] = useState<User>(storedUser ? JSON.parse(storedUser) : mockCurrentUser);
  const [token, setTokenState] = useState<string | null>(storedToken);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>((storedUser ? JSON.parse(storedUser).role : mockCurrentUser.role) || 'admin');

  const addLead = (lead: Lead) => setLeads(prev => [lead, ...prev]);
  const updateLead = (updated: Lead) =>
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem('mp_user', JSON.stringify(user));
    setActiveRole(user.role);
  };

  const setToken = (nextToken: string | null) => {
    setTokenState(nextToken);
    if (nextToken) localStorage.setItem('mp_token', nextToken);
    else localStorage.removeItem('mp_token');
  };

  const refreshLeads = async () => {
    try {
      const result = await getLeads();
      setLeads(result.leads);
    } catch {
      setLeads([]);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('mp_user');
    localStorage.removeItem('mechpro_access_token');
    localStorage.removeItem('mechpro_refresh_token');
    setCurrentUserState(mockCurrentUser);
    setActiveRole('admin');
    setLeads([]);
  };

  useEffect(() => {
    if (token) refreshLeads();
  }, [token]);

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, token, setToken, leads, setLeads, addLead, updateLead, refreshLeads, logout, activeRole, setActiveRole }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
