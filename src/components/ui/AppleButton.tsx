"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tapScale } from "@/lib/animations";

interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "left" | "right";
  children: ReactNode;
}

export const AppleButton = forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ variant = "primary", size = "md", icon, iconPosition = "left", children, className, onPointerDown, ...props }, ref) => {
    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e);
      if (!e.defaultPrevented) {
        tapScale(e.currentTarget);
      }
    };

    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary: "bg-primary text-on-primary hover:brightness-110 shadow-sm shadow-primary/20",
      secondary: "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant",
      ghost: "text-primary hover:bg-primary/10",
      danger: "bg-error text-on-error hover:brightness-110",
    };

    const sizes = {
      sm: "px-3 py-2 text-body-sm gap-1.5",
      md: "px-4 py-2.5 text-button gap-2",
      lg: "px-6 py-3.5 text-body-md gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {icon && iconPosition === "left" && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      </button>
    );
  }
);

AppleButton.displayName = "AppleButton";
