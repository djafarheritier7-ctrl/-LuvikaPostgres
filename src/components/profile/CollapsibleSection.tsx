// src/components/profile/CollapsibleSection.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  title: string;
  icon: React.ReactNode;
  itemCount: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function CollapsibleSection({
  title,
  icon,
  itemCount,
  children,
  defaultOpen = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="glass-border border-white/10 bg-transparent">
      <CardHeader
        className="px-4 pt-3 pb-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            {icon} {title}
            {itemCount > 0 && (
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <CardContent className="px-4 pb-4">
          {children}
        </CardContent>
      </motion.div>
    </Card>
  );
}