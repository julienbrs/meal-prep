"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export const USERS: User[] = [
  {
    id: "clara",
    name: "Clara",
    avatar: "/avatar/avatar_clara.png"
  },
  {
    id: "julien",
    name: "Julien",
    avatar: "/avatar/avatar_julien.png"
  }
];

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);

  // Chargement de l'utilisateur depuis localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem("currentUserId");
    if (savedUserId) {
      const user = USERS.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  // Sauvegarde de l'utilisateur dans localStorage
  const handleSetUser = (user: User) => {
    localStorage.setItem("currentUserId", user.id);
    setCurrentUser(user);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, users: USERS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}