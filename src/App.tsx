import React, { useState, useCallback } from 'react';
import { analyze } from 'web-audio-beat-detector';
import { motion, AnimatePresence } from 'motion/react';
import { UploadZone } from './components/UploadZone';
import { WaveformDisplay } from './components/WaveformDisplay';
import { detectKey } from './lib/audioUtils';
import { cn } from './lib/utils';
import { Activity, Music2, Share2, Layers } from 'lucide-react';

interface AnalysisResult {
  bpm: number;
  key: string;
  scale: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      alert('Please select a valid audio file.');
      return;
    }
    setFile(selectedFile);
    setIsProcessing(true);
    setResults(null);

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const bpmValue = await analyze(audioBuffer);
      const keyResult = await detectKey(audioBuffer);
      setResults({
        bpm: Math.round(bpmValue),
        key: keyResult.key,
        scale: keyResult.scale
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Could not analyze this file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = () => {
    setFile(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans overflow-hidden relative">
      {/* Background Atmospheric Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />

      {/* Navigation Header */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-white/5 z-20 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">SonicPulse</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
          <span className="text-cyan-400">Analyzer</span>
          <span className="hover:text-white transition-colors cursor-pointer">Library</span>
          <span className="hover:text-white transition-colors cursor-pointer">Camelot Wheel</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
          <span className="text-[10px] text-white/40">DEV</span>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full flex flex-col items-center justify-center"
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                  Sonic Pulse
                </h1>
                <p className="text-white/40 uppercase tracking-[0.3em] text-sm">Computational Music Analysis</p>
              </div>
              <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="col-span-full grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-7xl mx-auto"
            >
              {/* LEFT COLUMN: Input & Waveform */}
              <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col shadow-2xl">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-light text-white/90 truncate max-w-md">{file.name}</h2>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                        {file.type.split('/')[1]} • {(file.size / (1024 * 1024)).toFixed(2)} MB • Analysis Engine ACTIVE
                      </p>
                    </div>
                    <button 
                      onClick={reset}
                      className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Change Track
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <WaveformDisplay file={file} onReady={() => {}} />
                  </div>
                  
                  <div className="mt-8 grid grid-cols-3 gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Analysis State</span>
                      <span className="text-xl font-mono text-cyan-400">READY</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Data Type</span>
                      <span className="text-xl">{file.name.split('.').pop()?.toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Confidence</span>
                      <span className="text-xl text-purple-400">HIGH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Primary Results */}
              <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
                {/* BPM Card */}
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group py-12">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 font-bold">Tempo</span>
                  <span className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                    {results ? results.bpm : '--'}
                  </span>
                  <span className="text-[10px] font-light text-cyan-400 tracking-[0.5em] mt-2 uppercase">BPM</span>
                </div>

                {/* Key Card */}
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group py-12">
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="text-[10px] text-white/20 font-mono">ENCODER: CHROMA v2</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 font-bold">Musical Key</span>
                  <span className={cn(
                    "text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b",
                    results?.scale === 'Major' ? "from-cyan-400 to-cyan-800" : "from-purple-400 to-purple-800"
                  )}>
                    {results ? results.key : '--'}
                  </span>
                  <span className={cn(
                    "text-[10px] font-light tracking-[0.5em] mt-2 text-center uppercase",
                    results?.scale === 'Major' ? "text-cyan-400" : "text-purple-400"
                  )}>
                    {results ? `${results.key} ${results.scale}` : '---'}
                  </span>
                </div>

                {/* Share Button Placeholder */}
                <button className="h-20 bg-cyan-400 text-black font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] text-xs">
                  Export Metadata
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="h-2 w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </div>
  );
}
