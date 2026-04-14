import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index?: number;
}

/**
 * Feature Card Component
 * Displays a feature with icon, title, and description.
 * Designed for feature grid sections with staggered animations.
 */
export function FeatureCard({
  icon,
  title,
  description,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md p-8 transition-all duration-300 hover:bg-card/70"
      variants={fadeInUp}
      custom={index}
      whileHover={{ y: -5 }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Icon Container */}
      <motion.div
        className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground group-hover:bg-muted/80 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
      >
        {icon}
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="mb-3 text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-br from-foreground/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
    </motion.div>
  );
}
