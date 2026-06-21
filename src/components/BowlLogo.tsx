import { motion } from 'motion/react';

export default function BowlLogo() {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center justify-center w-12 h-12 bg-orange-100 border-2 border-zinc-900 rounded-xl shadow-[2px_2px_0px_0px_#18181b] overflow-visible cursor-pointer select-none"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-10 h-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Steam waves rising */}
        <path
          d="M 35 23 Q 40 14 35 7"
          stroke="#18181b"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M 50 23 Q 55 12 50 5"
          stroke="#18181b"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M 65 23 Q 70 14 65 7"
          stroke="#18181b"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Chopsticks cross-crossing */}
        <line
          x1="26"
          y1="48"
          x2="78"
          y2="10"
          stroke="#18181b"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="48"
          x2="86"
          y2="18"
          stroke="#18181b"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Bowl base with bright orange fill and heavy outline */}
        <path
          d="M 15 45 A 35 35 0 0 0 85 45 Z"
          fill="#ea580c"
          stroke="#18181b"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Thick elegant rim */}
        <rect
          x="10"
          y="39"
          width="80"
          height="10.5"
          rx="2"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />

        {/* Internal aesthetic design curve for the bowl */}
        <path
          d="M 32 64 Q 50 78 68 64"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
