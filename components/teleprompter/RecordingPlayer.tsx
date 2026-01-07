/**
 * RecordingPlayer Component
 * Modal player for watching recorded videos
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Recording } from '@/types/recording';

interface RecordingPlayerProps {
  recording: Recording;
  onClose: () => void;
  className?: string;
}

export function RecordingPlayer({ recording, onClose, className }: RecordingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Auto-play when opened
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Auto-play prevented, wait for user interaction
      });
    }
  }, [recording]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ${className}`}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Video Element */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              src={recording.video_url}
              className="max-w-full max-h-[80vh] mx-auto"
              controls={false}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlayPause}
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-white/80">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-pink-500"
                />
                <span className="text-sm text-white/80">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    {isPlaying ? (
                      <span className="block w-4 h-4 bg-white rounded-sm" />
                    ) : (
                      <div className="w-0 h-0 border-l-10 border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={togglePlayPause}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <div className="w-0 h-0 border-l-12 border-l-white border-t-8 border-t-transparent border-b-8 border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Recording Info */}
          <div className="p-4 bg-gray-900 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {new Date(recording.created_at).toLocaleDateString()} at{' '}
                  {new Date(recording.created_at).toLocaleTimeString()}
                </p>
                {recording.script_snapshot && (
                  <p className="text-sm text-gray-300 mt-1 line-clamp-1">
                    {recording.script_snapshot}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                recording.recording_quality === 'standard'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {recording.recording_quality}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
