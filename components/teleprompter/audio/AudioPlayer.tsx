"use client";

import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player/youtube';

// --- Strategy Interface ---
// In React, strategies are often Components or Hooks. 
// Here we use a Container Component that switches implementation based on URL.

interface AudioPlayerProps {
    url: string;
    playing: boolean;
    volume?: number; 
    loop?: boolean;
}

export const UniversalAudioPlayer: React.FC<AudioPlayerProps> = ({ url, playing, volume = 0.5, loop = true }) => {
    if (!url) return null;

    // Detect YouTube
    const isYoutube = ReactPlayer.canPlay(url);

    if (isYoutube) {
        return <YouTubeStrategy url={url} playing={playing} volume={volume} loop={loop} />;
    }

    return <NativeAudioStrategy url={url} playing={playing} volume={volume} loop={loop} />;
};

// --- Strategies ---

const NativeAudioStrategy: React.FC<AudioPlayerProps> = ({ url, playing, volume, loop }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume ?? 1;
            if (playing) { 
                audioRef.current.play().catch(e => console.error("Audio play failed", e)); 
            } else {
                audioRef.current.pause();
            }
        }
    }, [playing, volume, url]);

    return <audio ref={audioRef} src={url} loop={loop} />;
};

const YouTubeStrategy: React.FC<AudioPlayerProps> = ({ url, playing, volume, loop }) => {
    // Note: YouTube iframe API has restrictions on autoplay and background play on mobile.
    // We use ReactPlayer to handle most complexity.
    return (
        <div className="hidden"> 
            <ReactPlayer 
                url={url} 
                playing={playing} 
                loop={loop} 
                volume={volume}
                width="0" 
                height="0"
                config={{
                    youtube: {
                        playerVars: { showinfo: 0, controls: 0, disablekb: 1 }
                    }
                }}
            />
        </div>
    );
};
