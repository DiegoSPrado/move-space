import React, { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  item: any;
}

function getYouTubeVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return "";
}

const VideoModalReal: React.FC<VideoModalProps> = ({ open, onClose, item }) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !item) return;

    const videoId = getYouTubeVideoId(item.youtubeUrl);
    if (!videoId) return;

    let playerInstance: any = null;

    const initializePlayer = () => {
      if (window.YT && window.YT.Player && playerRef.current) {
        // Limpar player anterior se existir
        if (playerInstance) {
          try {
            playerInstance.destroy();
          } catch (e) {
            console.log("Cleanup previous player:", e);
          }
        }

        playerInstance = new window.YT.Player(playerRef.current, {
          height: "100%",
          width: "100%",
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            fs: 0,
            controls: 1, // Habilitar controles do YouTube temporariamente
            disablekb: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log("YouTube Player READY - REAL CONTROL ACTIVE");
              setPlayer(event.target);

              // Definir volume inicial
              setTimeout(() => {
                event.target.setVolume(volume);
                if (isMuted) {
                  event.target.mute();
                }
                console.log("Initial volume set to:", volume);
              }, 500);
            },
            onStateChange: (event: any) => {
              console.log("Player state:", event.data);
            },
          },
        });
      }
    };

    // Carregar YouTube API
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API loaded");
        setTimeout(initializePlayer, 1500);
      };
    } else {
      console.log("YouTube API already loaded");
      setTimeout(initializePlayer, 1000);
    }

    return () => {
      if (playerInstance) {
        try {
          playerInstance.destroy();
          console.log("Player destroyed");
        } catch (e) {
          console.log("Player cleanup error:", e);
        }
      }
    };
  }, [open, item, volume, isMuted]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
      console.log("REAL VOLUME CHANGED TO:", newVolume);

      if (newVolume === 0) {
        setIsMuted(true);
        player.mute();
      } else if (isMuted) {
        setIsMuted(false);
        player.unMute();
      }
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (player) {
      if (newMuted) {
        player.mute();
        console.log("REAL MUTE: ON");
      } else {
        player.unMute();
        player.setVolume(volume);
        console.log("REAL MUTE: OFF, Volume:", volume);
      }
    }
  };

  if (!open || !item) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(158.27deg, #370c94 -11.15%, #0b0121 48.08%)",
          borderRadius: "20px",
          maxWidth: "80vw",
          width: "80vw",
          maxHeight: "97vh",
          height: "90vh",
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.9)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header com controles */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 20px",
            background: "rgba(0, 0, 0, 0.4)",
            borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
            flexShrink: 0,
            gap: "20px",
          }}
        >
          <h2
            style={{
              color: "white",
              margin: 0,
              fontSize: "1.3rem",
              fontWeight: 600,
              flex: 1,
            }}
          >
            Caminhada Virtual - {item.place}
          </h2>

          {/* Controles de volume funcionais */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background:
                "linear-gradient(135deg, rgba(55, 12, 148, 0.8), rgba(11, 1, 33, 0.8))",
              padding: "10px 15px",
              borderRadius: "25px",
              border: "2px solid rgba(255, 255, 255, 0.4)",
            }}
          >
            <button
              onClick={handleMuteToggle}
              style={{
                background: isMuted
                  ? "rgba(255, 0, 0, 0.8)"
                  : "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            <button
              onClick={() => handleVolumeChange(Math.max(0, volume - 10))}
            >
              −
            </button>

            <div
              style={{
                position: "relative",
                width: "80px",
                height: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                cursor: "pointer",
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = Math.round((x / rect.width) * 100);
                const newVolume = Math.max(0, Math.min(100, percentage));
                handleVolumeChange(newVolume);
              }}
            >
              <div
                style={{
                  width: `${volume}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #370c94, #5a1bb8)",
                  borderRadius: "10px",
                }}
              />
            </div>

            <button
              onClick={() => handleVolumeChange(Math.min(100, volume + 10))}
            >
              +
            </button>

            <span
              style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}
            >
              {volume}%
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 0, 0, 0.9)",
              color: "white",
              border: "3px solid white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Container do vídeo */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#000",
          }}
        >
          <div
            ref={playerRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModalReal;
