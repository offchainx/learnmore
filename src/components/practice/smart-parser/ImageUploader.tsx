
import React, { useState, useRef } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }
    setError(null);
    onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
        />
        
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
          <Upload size={32} />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Upload Question Image
        </h3>
        <p className="text-slate-500 text-center mb-6">
          Drag and drop your homework or textbook photo here,<br />
          and our AI will automatically recognize and parse it.
        </p>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1"><FileImage size={14} /> JPG</span>
          <span className="flex items-center gap-1"><FileImage size={14} /> PNG</span>
          <span className="flex items-center gap-1"><FileImage size={14} /> WEBP</span>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
