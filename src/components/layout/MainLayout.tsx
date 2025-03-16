"use client";

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import PageHydrationWrapper from './PageHydrationWrapper';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <PageHydrationWrapper>
      <div className="flex flex-col min-h-screen" suppressHydrationWarning>
        <Header />
        <main className="flex-grow" suppressHydrationWarning>{children}</main>
        <Footer />
      </div>
    </PageHydrationWrapper>
  );
};

export default MainLayout; 