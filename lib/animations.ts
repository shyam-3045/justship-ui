// Animation configurations for Framer Motion
// These provide reusable animation variants for a premium, smooth feel

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (i = 1) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i = 1) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

// Container animations for staggered children
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Hover animation for cards and interactive elements
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.3,
  },
};

export const hoverGlow = {
  boxShadow: "0 20px 50px rgba(139, 92, 246, 0.3)",
  transition: {
    duration: 0.3,
  },
};

// Scroll reveal animation
export const scrollReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

// Button animations
export const buttonHover = {
  scale: 1.02,
  transition: {
    duration: 0.2,
  },
};

export const buttonTap = {
  scale: 0.98,
};

// Counter animation (for animated numbers)
export const counterVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

// Page transition (used in template.tsx)
export const pageTransition = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
};

// Float animation for hero elements
export const float = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Gradient animation for text
export const gradientFlow = {
  hidden: { backgroundPosition: "0% 50%" },
  visible: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Pulse animation for CTAs
export const pulse = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(139, 92, 246, 0.7)",
      "0 0 0 10px rgba(139, 92, 246, 0)",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
};

// Stagger animation for list items
export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Smooth transitions for theme changes
export const themeTransition = {
  transition: {
    duration: 0.3,
  },
};
