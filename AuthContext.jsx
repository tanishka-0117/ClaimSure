import React, { createContext, useEffect, useState, useContext } from 'react';

const AuthContext = createContext();

const USERS_KEY = 'claimsure.auth.users';
const SESSION_KEY = 'claimsure.auth.session';

// Demo credentials - DO NOT use real passwords!
// These are for development only. In production, use proper authentication services.
const seedUsers = [
  {
    id: 'seed-worker-1',
    name: 'Demo Worker',
    email: 'worker@claimsure.com',
    password: import.meta.env.VITE_DEMO_WORKER_PASSWORD || 'changeme',
    role: 'worker',
  },
  {
    id: 'seed-worker-2',
    name: 'Ravi Sharma',
    email: 'ravi@claimsure.com',
    password: import.meta.env.VITE_DEMO_WORKER_PASSWORD || 'changeme',
    role: 'worker',
  },
  {
    id: 'seed-worker-3',
    name: 'Priya Nair',
    email: 'priya@claimsure.com',
    password: import.meta.env.VITE_DEMO_WORKER_PASSWORD || 'changeme',
    role: 'worker',
  },
  {
    id: 'seed-worker-4',
    name: 'Arjun Singh',
    email: 'arjun@claimsure.com',
    password: import.meta.env.VITE_DEMO_WORKER_PASSWORD || 'changeme',
    role: 'worker',
  },
  {
    id: 'seed-admin-1',
    name: 'Demo Admin',
    email: 'admin@claimsure.com',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'changeme',
    role: 'admin',
  },
];

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const mergeMissingSeedUsers = (users) => {
  const existingByEmail = new Set(users.map((u) => normalizeEmail(u.email)));
  const missing = seedUsers.filter((seed) => !existingByEmail.has(normalizeEmail(seed.email)));
  return missing.length ? [...users, ...missing] : users;
};

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
      return seedUsers;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
      return seedUsers;
    }

    const merged = mergeMissingSeedUsers(parsed);
    if (merged.length !== parsed.length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
};

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ public_settings: {} });

  useEffect(() => {
    setIsLoadingAuth(true);
    const session = readSession();

    if (session) {
      setUser(session);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setIsLoadingAuth(false);
  }, []);

  const checkAppState = async () => {
    const session = readSession();
    if (session) {
      setUser(session);
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required' });
    }
  };

  const signup = async ({ name, email, password }) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const users = readUsers();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Email is already registered. Please login instead.');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name?.trim() || 'User',
      email: normalizedEmail,
      password,
      // Security rule: self-service signup can only create worker accounts.
      role: 'worker',
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, newUser];
    writeUsers(nextUsers);

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsAuthenticated(true);
    setAuthError(null);

    return sessionUser;
  };

  const login = async (email, password) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.password === password);

    if (!found) {
      throw new Error('Invalid email or password');
    }

    const sessionUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsAuthenticated(true);
    setAuthError(null);

    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    window.location.href = '/auth';
  };

  const navigateToLogin = () => {
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      signup,
      login,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
