"use client";

import * as React from "react";
import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

export interface CustomToasterProps extends Omit<ToasterProps, 'theme'> {
  position?: ToasterProps['position']
}

const Toaster = React.forwardRef<
  React.ElementRef<typeof Sonner>,
  CustomToasterProps
>(({ className, position = "bottom-right", ...props }, ref) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      ref={ref}
      theme={theme as ToasterProps["theme"]}
      position={position}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast: cn(
            // Base styles using design tokens
            "group toast font-sans",
            "bg-[var(--card)] text-[var(--card-foreground)]",
            "border border-[var(--border)]",
            "rounded-[var(--radius-lg)]",
            "shadow-[var(--shadow-lg)]",
            "overflow-hidden",
            
            // Modern single-line layout - perfect padding for close button
            "pr-8", // Reduced from pr-10 for tighter layout
            "pl-4 py-3", // Consistent padding
            
            // GROUP 7: NOTIFICATIONS - Toast slide-ins from corner
            // Timing: 200ms open, 150ms close
            // Curve: cubic-bezier(0, 0, 0.2, 1)
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-top-full",
            
            // Perfect timing compliance
            "data-[state=open]:duration-200",
            "data-[state=closed]:duration-150",
            
            // Standard easing curve
            "[animation-timing-function:cubic-bezier(0,0,0.2,1)]",
            
            // Swipe support
            "data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)]",
            "data-[swipe=cancel]:translate-y-0",
            "data-[swipe=end]:animate-out data-[swipe=end]:fade-out-80",
            "data-[swipe=end]:slide-out-to-top-full",
            
            // Accessibility
            "motion-reduce:animate-none",
          ),
          
          // Modern multi-line title (Linear/Vercel style)
          title: cn(
            "text-sm font-medium leading-snug",
            "text-[var(--card-foreground)]",
            "pr-1", // Prevent overlap with close button
            "whitespace-pre-wrap",
          ),
          
          // Description - hidden for ultra-modern single-line look
          description: cn(
            "hidden",
          ),
          
          actionButton: cn(
            // Design tokens
            "bg-[var(--primary)] text-[var(--primary-foreground)]",
            "border border-transparent",
            "rounded-[var(--radius)]",
            "px-3 py-1.5 text-xs font-medium",
            "shadow-[var(--shadow-sm)]",
            "ml-3",
            
            // GROUP 4: STATE TRANSITION - Button hover states
            "transition-colors duration-150",
            "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
            "hover:bg-[var(--primary-hover)]",
            
            // Focus styles
            "focus:outline-none focus:ring-2",
            "focus:ring-[var(--focus-ring)] focus:ring-offset-1",
            
            // Accessibility
            "motion-reduce:transition-none",
          ),
          
          cancelButton: cn(
            // Design tokens
            "bg-transparent text-[var(--muted-foreground)]",
            "border border-[var(--border)]",
            "rounded-[var(--radius)]",
            "px-3 py-1.5 text-xs font-medium",
            "ml-2",
            
            // GROUP 4: STATE TRANSITION
            "transition-colors duration-150",
            "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
            "hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
            
            // Focus styles
            "focus:outline-none focus:ring-2",
            "focus:ring-[var(--focus-ring)] focus:ring-offset-1",
            
            // Accessibility
            "motion-reduce:transition-none",
          ),
          
          // 🎯 PERFECT INDUSTRY STANDARD: EXACT top-right corner positioning
          closeButton: cn(
            // EXACT corner positioning - Linear/Vercel/Stripe style
            "!absolute !top-2 !right-2",
            "!left-auto !bottom-auto",
            "!translate-x-0 !translate-y-0 !m-0 !p-0",
            
            // Ultra-modern minimal sizing
            "!flex !h-4 !w-4 !items-center !justify-center",
            
            // Design tokens - subtle appearance
            "!bg-transparent !text-[var(--muted-foreground)]",
            "!border-0 !shadow-none",
            "!rounded-[var(--radius-sm)]",
            
            // Modern visibility - subtle but always present
            "!opacity-60 hover:!opacity-100",
            
            // GROUP 4: STATE TRANSITION - smooth hover
            "!transition-opacity !duration-150",
            "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
            "hover:!bg-[var(--muted)]",
            
            // Perfect icon sizing - compact and modern
            "[&_svg]:!h-3 [&_svg]:!w-3 [&_svg]:!shrink-0",
            
            // Focus styles - minimal ring
            "focus:!outline-none focus:!ring-1 focus:!ring-[var(--focus-ring)]",
            "focus:!ring-offset-0",
            
            // Accessibility
            "motion-reduce:!transition-none",
          ),
          
          // State variants - soft backgrounds for visual hierarchy
          error: cn(
            "!border-[var(--destructive)]/20",
            "!bg-[var(--error-soft)]",
            "[&>[data-icon]]:!text-[var(--destructive)]",
          ),
          
          success: cn(
            "!border-[var(--success)]/20", 
            "!bg-[var(--success-soft)]",
            "[&>[data-icon]]:!text-[var(--success)]",
          ),
          
          warning: cn(
            "!border-[var(--warning)]/20",
            "!bg-[var(--warning-soft)]", 
            "[&>[data-icon]]:!text-[var(--warning)]",
          ),
          
          info: cn(
            "!border-[var(--info)]/20",
            "!bg-[var(--info-soft)]",
            "[&>[data-icon]]:!text-[var(--info)]",
          ),
          
          loading: cn(
            "!border-[var(--primary)]/20",
            "!bg-[var(--accent)]",
            "[&>[data-icon]]:!text-[var(--primary)]",
          ),
        },
      }}
      icons={{
        success: (
          <CheckCircle2 
            className="h-4 w-4 text-[var(--success)] shrink-0" 
            data-icon 
          />
        ),
        info: (
          <Info 
            className="h-4 w-4 text-[var(--info)] shrink-0" 
            data-icon 
          />
        ),
        warning: (
          <AlertTriangle 
            className="h-4 w-4 text-[var(--warning)] shrink-0" 
            data-icon 
          />
        ),
        error: (
          <XCircle 
            className="h-4 w-4 text-[var(--destructive)] shrink-0" 
            data-icon 
          />
        ),
        loading: (
          <Loader2 
            className="h-4 w-4 text-[var(--primary)] animate-spin motion-reduce:animate-none shrink-0" 
            data-icon 
          />
        ),
      }}
      closeButton={true}
      {...props}
    />
  );
});

Toaster.displayName = "Toaster";

export { Toaster };