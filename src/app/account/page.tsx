"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Image from "next/image";

export default function AccountPage() {
  const { session, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your account...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
            
            <div className="flex items-center space-x-4 mb-8">
              {session.user?.image ? (
                <div className="h-16 w-16 rounded-full overflow-hidden">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{session.user?.name}</h2>
                <p className="text-gray-600">{session.user?.email}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{session.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-gray-900">{session.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account ID</p>
                  <p className="text-gray-900">{session.user?.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 