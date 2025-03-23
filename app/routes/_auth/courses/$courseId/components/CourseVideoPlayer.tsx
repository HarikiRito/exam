'use client';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { cn } from 'app/shared/utils/className';
import {
  Maximize2Icon,
  Minimize2Icon,
  PauseIcon,
  PlayIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeIcon,
  VolumeXIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { CourseVideo } from '../types';

interface CourseVideoPlayerProps {
  readonly video: CourseVideo;
}

export function CourseVideoPlayer({ video }: CourseVideoPlayerProps) {
  const playerRef = useRef<ReactPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  function handlePlayPause() {
    setPlaying((prevPlaying) => !prevPlaying);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(parseFloat(e.target.value));
  }

  function handleProgress(state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) {
    if (!seeking) {
      setPlayed(state.played);
    }
  }

  function handleSeekMouseDown() {
    setSeeking(true);
  }

  function handleSeekChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPlayed(parseFloat(e.target.value));
  }

  function handleSeekMouseUp(e: React.MouseEvent<HTMLInputElement>) {
    setSeeking(false);

    playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value));
  }

  function handleDuration(duration: number) {
    setDuration(duration);
  }

  function toggleFullscreen() {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      void playerContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      void document.exitFullscreen();
    }
  }

  function formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';

    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');

    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  }

  // Determine volume icon based on volume level
  function getVolumeIcon() {
    if (volume === 0) return <VolumeXIcon className='h-5 w-5' />;
    if (volume < 0.3) return <VolumeIcon className='h-5 w-5' />;
    if (volume < 0.7) return <Volume1Icon className='h-5 w-5' />;
    return <Volume2Icon className='h-5 w-5' />;
  }

  function handleMouseMove() {
    // Show controls immediately
    setShowControls(true);

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Set a new timeout to hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }

  return (
    <AppCard.Root className='overflow-hidden'>
      <div ref={playerContainerRef} className='relative bg-black' onMouseMove={handleMouseMove}>
        <div className={cn(isFullscreen ? 'h-screen' : 'aspect-video w-full')}>
          <ReactPlayer
            ref={playerRef}
            url={video.videoUrl}
            width='100%'
            height='100%'
            playing={playing}
            volume={volume}
            onProgress={handleProgress}
            onDuration={handleDuration}
            progressInterval={500}
            // light={video.thumbnail}
            controls={false}
            autoPlay={true}
            config={{
              file: {
                attributes: {
                  poster: video.thumbnail,
                },
              },
            }}
          />
        </div>

        {/* Custom controls with fade transition */}
        <div
          className={cn(
            'absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-500',
            showControls ? 'opacity-100' : 'opacity-0',
          )}>
          {/* Progress bar */}
          <div className='mb-2 flex items-center'>
            <span className='mr-2 text-xs text-white'>{formatTime(duration * played)}</span>
            <input
              type='range'
              min={0}
              max={1}
              step='any'
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className='h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-600 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white'
            />
            <span className='ml-2 text-xs text-white'>{formatTime(duration)}</span>
          </div>

          {/* Control buttons */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <AppButton
                onClick={handlePlayPause}
                variant='ghost'
                className='h-8 w-8 p-0 text-white'
                aria-label={playing ? 'Pause' : 'Play'}
                title={playing ? 'Pause' : 'Play'}>
                {playing ? <PauseIcon className='h-6 w-6' /> : <PlayIcon className='h-6 w-6' />}
              </AppButton>

              <div className='flex items-center'>
                <AppButton variant='ghost' className='mr-1 h-8 w-8 p-0 text-white' aria-label='Volume' title='Volume'>
                  {getVolumeIcon()}
                </AppButton>
                <input
                  type='range'
                  min={0}
                  max={1}
                  step='any'
                  value={volume}
                  onChange={handleVolumeChange}
                  className='h-1 w-16 cursor-pointer appearance-none rounded-full bg-gray-600 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white'
                />
              </div>
            </div>

            <AppButton
              onClick={toggleFullscreen}
              variant='ghost'
              className='h-8 w-8 p-0 text-white'
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullscreen ? <Minimize2Icon className='h-6 w-6' /> : <Maximize2Icon className='h-6 w-6' />}
            </AppButton>
          </div>
        </div>
      </div>
    </AppCard.Root>
  );
}
