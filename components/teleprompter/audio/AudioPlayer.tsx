import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

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
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Player = ReactPlayer as any;

const YouTubeStrategy: React.FC<AudioPlayerProps> = ({ url, playing, volume, loop }) => {
    // Debug YouTube Payer
    useEffect(() => {
        console.log("[AudioPlayer] YouTube Strategy Prop Update:", { url, playing, volume, loop });
    }, [url, playing, volume, loop]);

    // Note: YouTube iframe API has restrictions on autoplay and background play on mobile.
    // We use ReactPlayer to handle most complexity.
    return (
        <div className="hidden">
            <Player
                url={url}
                playing={playing}
                loop={loop}
                volume={volume}
                onReady={() => console.log("[AudioPlayer] Player Ready")}
                onStart={() => console.log("[AudioPlayer] Player Started")}
                onPlay={() => console.log("[AudioPlayer] Player Playing")}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError={(e: any) => console.error("[AudioPlayer] Player Error", e)}
                controls={false}
                width="0" 
                height="0"
                config={{
                    youtube: {
                        disablekb: 1,
                        rel: 0,
                        iv_load_policy: 3,
                        cc_load_policy: 1
                    }
                }}
            />
        </div>
    );
};
