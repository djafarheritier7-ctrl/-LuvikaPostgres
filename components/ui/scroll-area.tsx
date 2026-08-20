// src/components/ui/scroll-area.tsx
'use client';

import * as React from "react";
import { cn } from "../../lib/utils";

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-y-auto",
      // 🔹 Styles scrollbar WebKit (Chrome/Safari/Edge)
      "[&::-webkit-scrollbar]:w-2",
      "[&::-webkit-scrollbar-track]:bg-transparent",
      "[&::-webkit-scrollbar-thumb]:bg-white/10",
      "[&::-webkit-scrollbar-thumb]:rounded-lg",
      "[&::-webkit-scrollbar-thumb]:border-2",
      "[&::-webkit-scrollbar-thumb]:border-transparent",
      "[&::-webkit-scrollbar-thumb]:bg-clip-content",
      "hover:[&::-webkit-scrollbar-thumb]:bg-white/20",
      "transition-[scrollbar-color] duration-300",
      // 🔹 Styles scrollbar Firefox
      "scrollbar-thin",
      "scrollbar-thumb-white/10",
      "scrollbar-track-transparent",
      "hover:scrollbar-thumb-white/20",
      // 🔹 Smooth scrolling
      "scroll-smooth",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };