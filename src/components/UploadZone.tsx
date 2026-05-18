import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.m4a'] },
    multiple: false,
    disabled: isProcessing
  } as any);

  return (
    <div
      {...getRootProps()}
      className="relative w-full max-w-xl mx-auto cursor-pointer group"
      id="dropzone-container"
    >
      <input {...getInputProps()} id="audio-input" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex flex-col items-center justify-center p-16
          border border-white/10 rounded-[2.5rem] transition-all duration-500
          ${isDragActive ? 'bg-cyan-500/10 border-cyan-400/50 scale-[1.02]' : 'bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          backdrop-blur-xl shadow-2xl relative overflow-hidden
        `}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <Music className="w-12 h-12 text-white/20" />
        </div>

        <div className="w-20 h-20 mb-8 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
          <Upload className="w-8 h-8 text-cyan-400" />
        </div>
        
        <h3 className="text-2xl font-light mb-2 tracking-tight text-white/90">
          {isDragActive ? 'Drop to start analyzer' : 'Initialize Analysis'}
        </h3>
        <p className="text-white/30 text-xs font-mono uppercase tracking-[0.2em] mb-8">
          AI-Drive TEMPO & KEY DETERMINATION
        </p>
        
        <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">
          <span className="hover:text-cyan-400 transition-colors">WAV</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span className="hover:text-cyan-400 transition-colors">MP3</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span className="hover:text-cyan-400 transition-colors">FLAC</span>
        </div>
      </motion.div>

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem] backdrop-blur-md z-30">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className="mb-6"
            >
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-t-transparent shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
            </motion.div>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400 animate-pulse">Scanning Frequencies...</span>
          </div>
        </div>
      )}
    </div>
  );
};
