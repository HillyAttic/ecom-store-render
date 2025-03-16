"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { User, ShoppingBag, Heart, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState } from "react";

export default function UserProfile() {
  const { session, status, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setIsDropdownOpen(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="animate-pulse h-8 w-8 rounded-full bg-gray-200"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
      >
        <User size={18} />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 focus:outline-none"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          {session?.user?.image ? (
            <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 hidden md:inline">
            {session?.user?.name?.split(" ")[0] || "User"}
          </span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
          
          <div className="py-1">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User size={16} className="text-gray-500" />
              <span>My Account</span>
            </Link>
            
            <Link
              href="/orders"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <ShoppingBag size={16} className="text-gray-500" />
              <span>My Orders</span>
            </Link>
            
            <Link
              href="/wishlist"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Heart size={16} className="text-gray-500" />
              <span>My Wishlist</span>
            </Link>
            
            <Link
              href="/account/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings size={16} className="text-gray-500" />
              <span>Account Settings</span>
            </Link>
          </div>
          
          <div className="py-1 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={16} className="text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 