import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { fadeInUp } from "@/lib/animations";

interface AnimatedCounterProps {
  target: number;
  label: string;
  suffix?: string;
  index?: number;
}

/**
 * Animated Counter Component
 * Animates a number from 0 to the target value when scrolled into view.
 * Perfect for displaying stats and metrics.
 */
export function AnimatedCounter({
  target,
  label,
  suffix = "",
  index = 0,
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, Math.round);

  useEffect(() => {
    if (isInView) {
      animate(motionValue, target, {
        duration: 2.5,
        ease: "easeOut",
      });
    }
  }, [isInView, motionValue, target]);

  return (
    <motion.div
      ref={ref}
      className="text-center space-y-2"
      variants={fadeInUp}
      custom={index}
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
        <motion.span>{displayValue}</motion.span>
        <span className="text-2xl md:text-3xl ml-1">{suffix}</span>
      </div>
      <p className="text-base text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}
