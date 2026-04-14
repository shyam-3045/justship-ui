import React from "react";
import { motion, MotionProps } from "framer-motion";
import { hoverScale } from "@/lib/animations";

interface PremiumCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

/**
 * Premium Card Component
 * A luxury card component with glassmorphism effect, optional gradient border,
 * and smooth hover animations. Perfect for feature cards, deployment cards, etc.
 */
export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      children,
      className = "",
      hover = true,
      gradient = false,
      onClick,
      ...motionProps
    },
    ref,
  ) => {
    const baseStyles =
      "relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-6 transition-all duration-300";

    const hoverStyles = hover ? "hover:border-border hover:bg-card/80 cursor-pointer" : "";

    const finalClass = `${baseStyles} ${hoverStyles} ${className}`.trim();

    return (
      <motion.div
        ref={ref}
        className={finalClass}
        whileHover={hover ? { ...hoverScale } : undefined}
        onClick={onClick}
        {...motionProps}
      >
        {gradient && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-foreground/10 to-transparent pointer-events-none" />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  },
);

PremiumCard.displayName = "PremiumCard";
