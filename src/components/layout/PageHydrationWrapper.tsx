"use client";

import React from 'react';

interface PageHydrationWrapperProps {
  children: React.ReactNode;
}

// This component wraps pages and ensures all DOM elements have suppressHydrationWarning
// This helps prevent hydration errors from browser extensions like Bitdefender
export default function PageHydrationWrapper({ children }: PageHydrationWrapperProps) {
  // Apply suppressHydrationWarning to all elements in the tree
  const addSuppressHydrationWarning = (element: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(element)) {
      return element;
    }

    // Clone the element with suppressHydrationWarning
    const childrenWithSuppressWarning = React.Children.map(
      element.props.children,
      addSuppressHydrationWarning
    );

    return React.cloneElement(element, {
      suppressHydrationWarning: true,
      children: childrenWithSuppressWarning,
    });
  };

  return (
    <div suppressHydrationWarning>
      {React.Children.map(children, addSuppressHydrationWarning)}
    </div>
  );
} 