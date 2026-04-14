import React from "react";
import { motion } from "framer-motion";
import { fadeInUp, containerVariants } from "@/lib/animations";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  centered?: boolean;
  gradient?: boolean;
}

/**
 * Section Header Component
 * Used for consistent section titles with optional gradient text,
 * subtitle, and description. Provides visual hierarchy and polish.
 */
export function SectionHeader({
  title,
  subtitle,
  description,
  icon,
  centered = true,
  gradient = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      className={`space-y-4 ${centered ? "text-center" : ""}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {icon && (
        <motion.div
          className="flex justify-center mb-4"
          variants={fadeInUp}
          custom={0}
        >
          <div className="text-foreground text-4xl">{icon}</div>
        </motion.div>
      )}

      {subtitle && (
        <motion.div
          className="text-sm font-semibold text-muted-foreground uppercase tracking-widest"
          variants={fadeInUp}
          custom={icon ? 1 : 0}
        >
          {subtitle}
        </motion.div>
      )}

      <motion.h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground ${
          gradient ? "gradient-text" : ""
        }`}
        variants={fadeInUp}
        custom={icon || subtitle ? (subtitle ? 2 : 1) : 0}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          variants={fadeInUp}
          custom={icon || subtitle ? (subtitle ? 3 : 2) : 1}
        >
          {description}
        </motion.p>
      )}

      {/* Decorative underline */}
      <motion.div
        className="mx-auto mt-6 h-1 w-12 rounded-full bg-border/60"
        variants={fadeInUp}
        custom={icon || subtitle || description ? 4 : 2}
      />
    </motion.div>
  );
}
