"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUser, User } from "@/context/UserContext";

export default function UserSelector() {
  const { currentUser, setCurrentUser, users } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  // Fermer le menu déroulant lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-start items-center gap-2"
      >
        <Image
          src={currentUser.avatar}
          alt={`Avatar de ${currentUser.name}`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="justify-center text-gray-600 text-sm font-semibold font-['Inter']">
          {currentUser.name}
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200">
          <div className="py-1">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserChange(user)}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  currentUser.id === user.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Image
                  src={user.avatar}
                  alt={`Avatar de ${user.name}`}
                  width={24}
                  height={24}
                  className="rounded-full mr-3"
                />
                {user.name}
                {currentUser.id === user.id && (
                  <svg
                    className="ml-auto h-4 w-4 text-emerald-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}