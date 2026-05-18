import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';

interface WaveformDisplayProps {
  file: File | null;
  onReady: () => void;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ file, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  useEffect(() => {
    if (!containerRef.current || !file) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(255, 255, 255, 0.1)',
      progressColor: '#22d3ee',
      cursorColor: '#22d3ee',
      barWidth: 3,
      barRadius: 2,
      height: 100,
      normalize: true,
    });

    const url = URL.createObjectURL(file);
    wavesurfer.current.load(url);

    wavesurfer.current.on('ready', () => {
      onReady();
      const totalSeconds = wavesurfer.current?.getDuration() || 0;
      setDuration(formatTime(totalSeconds));
    });

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('audioprocess', () => {
      const current = wavesurfer.current?.getCurrentTime() || 0;
      setCurrentTime(formatTime(current));
    });

    return () => {
      wavesurfer.current?.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file, onReady]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => wavesurfer.current?.playPause();
  const toggleMute = () => {
    if (wavesurfer.current) {
      const newMuted = !isMuted;
      wavesurfer.current.setMuted(newMuted);
      setIsMuted(newMuted);
    }
  };
  const restart = () => {
    wavesurfer.current?.stop();
    wavesurfer.current?.play();
  };

  return (
    <div className="w-full bg-white/[0.02] rounded-2xl p-6 border border-white/5" id="player-container">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">Spectral Signal</span>
        </div>
        <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase">
          {currentTime} <span className="opacity-30">/</span> {duration}
        </div>
      </div>

      <div ref={containerRef} className="cursor-pointer mb-8" />

      <div className="flex items-center justify-center gap-8">
        <button
          onClick={toggleMute}
          className="p-3 text-white/40 hover:text-white transition-colors"
          id="btn-mute"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-purple-400" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:bg-cyan-400 transition-all active:scale-95 shadow-xl group"
          id="btn-play-pause"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" fill="black" />
          ) : (
            <Play className="w-6 h-6 ml-1" fill="black" />
          )}
        </button>

        <button
          onClick={restart}
          className="p-3 text-white/40 hover:text-white transition-colors"
          id="btn-restart"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
