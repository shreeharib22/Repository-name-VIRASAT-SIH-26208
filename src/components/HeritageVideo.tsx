import { useEffect, useRef, useState } from 'react';

type HeritageVideoProps = {
  src: string;
  title: string;
  location: string;
  description?: string;
  onClose: () => void;
  onComplete?: () => void;
};

export function HeritageVideo({
  src,
  title,
  location,
  description,
  onClose,
  onComplete,
}: HeritageVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!video.duration) return;

      setProgress(video.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    const onPlay = () => {
      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    const onEnded = () => {
      setPlaying(false);

      if (!completed) {
        setCompleted(true);
        onComplete?.();
      }
    };

    video.addEventListener(
      'timeupdate',
      onTimeUpdate,
    );

    video.addEventListener(
      'loadedmetadata',
      onLoadedMetadata,
    );

    video.addEventListener(
      'play',
      onPlay,
    );

    video.addEventListener(
      'pause',
      onPause,
    );

    video.addEventListener(
      'ended',
      onEnded,
    );

    return () => {
      video.removeEventListener(
        'timeupdate',
        onTimeUpdate,
      );

      video.removeEventListener(
        'loadedmetadata',
        onLoadedMetadata,
      );

      video.removeEventListener(
        'play',
        onPlay,
      );

      video.removeEventListener(
        'pause',
        onPause,
      );

      video.removeEventListener(
        'ended',
        onEnded,
      );
    };
  }, [completed, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  };

  const seek = (value: number) => {
    const video = videoRef.current;

    if (!video || !duration) return;

    video.currentTime =
      value * duration;
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = Math.max(
      0,
      Math.min(
        video.duration || 0,
        video.currentTime + seconds,
      ),
    );
  };

  const percentage =
    duration > 0
      ? (progress / duration) * 100
      : 0;

  return (
    <div className="heritage-video-backdrop">
      <div className="heritage-video">
        <div className="heritage-video-head">
          <div>
            <div className="eyebrow">
              VIRASAT · CINEMATIC DISCOVERY
            </div>

            <h2>{title}</h2>

            <div className="heritage-video-location">
              {location}
            </div>
          </div>

          <button
            className="small-btn"
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>

        <div className="heritage-video-frame">
          <video
            ref={videoRef}
            src={src}
            playsInline
            preload="metadata"
            controls={false}
            onClick={togglePlay}
          />

          {!playing && (
            <button
              className="heritage-video-play"
              onClick={togglePlay}
              aria-label="Play video"
            >
              ▶
            </button>
          )}

          <div className="heritage-video-gradient" />

          <div className="heritage-video-controls">
            <button
              className="video-control"
              onClick={togglePlay}
            >
              {playing ? 'PAUSE' : 'PLAY'}
            </button>

            <button
              className="video-control"
              onClick={() => skip(-10)}
            >
              −10
            </button>

            <button
              className="video-control"
              onClick={() => skip(10)}
            >
              +10
            </button>

            <div className="video-time">
              {formatTime(progress)} /{' '}
              {formatTime(duration)}
            </div>
          </div>

          <input
            className="heritage-video-progress"
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={
              duration > 0
                ? progress / duration
                : 0
            }
            onChange={(event) =>
              seek(
                Number(
                  event.target.value,
                ),
              )
            }
            style={{
              background: `linear-gradient(
                90deg,
                #d6aa67 ${percentage}%,
                rgba(255,255,255,.16) ${percentage}%
              )`,
            }}
            aria-label="Video progress"
          />
        </div>

        <div className="heritage-video-info">
          <div>
            <div className="eyebrow">
              STORY FRAGMENT
            </div>

            <p>
              {description ??
                'Discover the history, architecture and cultural story behind this heritage location.'}
            </p>
          </div>

          <div className="heritage-video-status">
            <span
              className={
                completed
                  ? 'video-complete'
                  : ''
              }
            >
              {completed
                ? 'DISCOVERY COMPLETE'
                : 'WATCH TO DISCOVER'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return '00:00';
  }

  const totalSeconds = Math.max(
    0,
    Math.floor(seconds),
  );

  const minutes =
    Math.floor(totalSeconds / 60);

  const remaining =
    totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remaining,
  ).padStart(2, '0')}`;
}
