// src/components/ui/tabs.tsx
'use client';

import * as React from 'react';
import clsx from 'clsx';

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  defaultValue?: string;
};

export function Tabs({ children, defaultValue, ...props }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div {...props}>
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
}

// ------------------- Context -------------------
type TabsContextType = {
  activeTab?: string;
  setActiveTab?: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextType>({});

// ------------------- TabsList -------------------
type TabsListProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export const TabsList = ({ children, className, ...props }: TabsListProps) => {
  return (
    <div
      className={clsx(
        'flex border-b border-white/20 mb-4 overflow-x-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ------------------- TabsTrigger -------------------
type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  children: React.ReactNode;
};

export const TabsTrigger = ({ value, children, className, ...props }: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);

  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={clsx(
        'px-4 py-2 font-medium whitespace-nowrap transition-colors',
        isActive
          ? 'border-b-2 border-blue-400 text-white'
          : 'text-gray-400 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// ------------------- TabsContent -------------------
type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  children: React.ReactNode;
};

export const TabsContent = ({ value, children, className, ...props }: TabsContentProps) => {
  const { activeTab } = React.useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div className={clsx('pt-4', className)} {...props}>
      {children}
    </div>
  );
};
