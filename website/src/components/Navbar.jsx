import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth, onAuthStateChanged } from '../firebase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="w-full py-2 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 7.92c.11.002.22.003.33.003a.75.75 0 0 1 0 1.5c-.11 0-.22 0-.33.003a7.5 7.5 0 0 0-7.92 7.92c-.007.13-.007.261-.007.391a.75.75 0 0 1-1.5 0c0-.13 0-.261-.007-.391a7.5 7.5 0 0 0-7.92-7.92C2.86 12.44 2.75 12.43 2.64 12.43a.75.75 0 0 1 0-1.5c.11 0 .22-.001.33-.003a7.5 7.5 0 0 0 7.92-7.92C10.9 3.004 11.03 3 11.16 3a.75.75 0 0 1 .84 0Z"/>
          </svg>
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight text-white block leading-none">Quick Comment AI</span>
          <span className="text-[10px] font-mono text-zinc-500">AI Companion</span>
        </div>
      </Link>

      {/* Action Pill with Button-in-Button Trailing Icon */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden md:inline-block text-[11px] font-mono text-zinc-400 truncate max-w-[140px]">
            {user.email}
          </span>
        )}
        <Link
          to="/extension"
          className="group rounded-full p-1 pl-4 pr-1.5 bg-white text-black font-mono font-semibold text-xs flex items-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all duration-300"
        >
          <span>{user ? 'Portal' : 'Sign In'}</span>
          <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
            <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
      </div>
    </nav>
  );
}
