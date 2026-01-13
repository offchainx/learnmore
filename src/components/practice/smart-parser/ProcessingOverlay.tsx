
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const ProcessingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-indigo-600"
        >
          <Loader2 size={64} strokeWidth={1.5} />
        </motion.div>
        
        {/* Scanning Line Effect */}
        <motion.div
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(79,70,229,0.5)]"
        />
        
        <p className="mt-8 text-lg font-medium text-slate-700 animate-pulse">
          AI is recognizing question content...
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Parsing formulas and text structures
        </p>
      </div>
    </div>
  );
};
