import React, { useState, useEffect, useCallback, useRef } from "react";
import "../constants/Dashboard.css";
import "../constants/VirtualPage.css";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/dashbordComponents/AppHeader";
import DockerButtonComponent from "../components/dashbordComponents/DashboardDockerButtons";
import PerformanceComponent from "../components/dashbordComponents/GridCompPerformance";
import ManRunningComponent from "../components/dashbordComponents/ManRunGridComp";
import OptionsDashComponent from "../components/dashbordComponents/OptionsDashComponent";
import VideoModalReal from "../components/VideoModalReal";
import { ConnectionStatus, SerialPortInfo } from "../types";
import {
  parseResponse,
  requestTemperature,
  requestPressure,
  setOperationMode,
  setConveyorSpeed,
  setHeaterPower,
  setPumpPower,
  setLampState,
  setLedState,
  setNeonState,
} from "../utils/CommandHelpers";

import SmallDivsComponent from "../components/dashbordComponents/SmallDivsComponent";
import SerialPortSelector from "../components/SerialPortSelector";
import ConveyorComponent from "../components/dashbordComponents/ConveyorComponent";
import AutoConnectionModal from "../components/AutoConnectionModal";

// Dados e funções do VirtualWalk
const virtualWalkData = [
  {
    id: 1,
    title: "Virtual Running",
    place: "Virtual Running",
    youtubeUrl: "https://www.youtube.com/watch?v=PHXb_VAVpgY",
  },
  {
    id: 2,
    title: "Portofino",
    place: "Portofino, Italy",
    youtubeUrl: "https://www.youtube.com/watch?v=_VpQ1bm-5qU",
  },
  {
    id: 3,
    title: "Bruny Island",
    place: "Bruny Island, Australia",
    youtubeUrl: "https://www.youtube.com/watch?v=bTjETWnwQC8",
  },
  {
    id: 4,
    title: "Miami Beach",
    place: "Miami, USA",
    youtubeUrl: "https://www.youtube.com/watch?v=8R7H7a_vkxE",
  },
  {
    id: 5,
    title: "Workout",
    place: "Virtual Scenery",
    youtubeUrl: "https://www.youtube.com/watch?v=dCjt9eptadI",
  },
  {
    id: 6,
    title: "Virtual Run",
    place: "Treadmill Videos",
    youtubeUrl: "https://www.youtube.com/watch?v=nY_jGLxqelc",
  },
  {
    id: 7,
    title: "Paris",
    place: "Paris, France",
    youtubeUrl: "https://www.youtube.com/watch?v=qYD68Zvw8UE",
  },
  {
    id: 8,
    title: "Central Park",
    place: "New York, USA",
    youtubeUrl: "https://www.youtube.com/watch?v=onxQ1Gj3C6U",
  },
  {
    id: 9,
    title: "London",
    place: "London, UK",
    youtubeUrl: "https://www.youtube.com/watch?v=lij9G5z1xZE",
  },
  {
    id: 10,
    title: "Hawaii",
    place: "Ko'Olina, Hawaii",
    youtubeUrl: "https://www.youtube.com/watch?v=x_buQ7zYqHE",
  },
  {
    id: 11,
    title: "Rome",
    place: "Rome, Italy",
    youtubeUrl: "https://www.youtube.com/watch?v=NZjXod3yblE",
  },
  {
    id: 12,
    title: "Singapore",
    place: "Marina Bay, Singapore",
    youtubeUrl: "https://www.youtube.com/watch?v=NqcWLyfbsyA",
  },
  {
    id: 13,
    title: "Grand Canyon",
    place: "Grand Canyon, USA",
    youtubeUrl: "https://www.youtube.com/watch?v=RsiI_ulx-t8",
  },
  {
    id: 14,
    title: "Trail Run",
    place: "Highbanks Trail",
    youtubeUrl: "https://www.youtube.com/watch?v=K_K_EHDaSew",
  },
  {
    id: 15,
    title: "Forest",
    place: "Forest Trail",
    youtubeUrl: "https://www.youtube.com/watch?v=OOAnuV57Avs",
  },
  {
    id: 16,
    title: "Sydney",
    place: "Bondi Beach, Australia",
    youtubeUrl: "https://www.youtube.com/watch?v=rpM7zlaedYI",
  },
  {
    id: 17,
    title: "Miami Beach",
    place: "Miami Beach, Florida",
    youtubeUrl: "https://www.youtube.com/watch?v=r7OVr1wBri4",
  },
  {
    id: 18,
    title: "Barcelona",
    place: "Barcelona, Spain",
    youtubeUrl: "https://www.youtube.com/watch?v=CkHTx56nZS8",
  },
  {
    id: 19,
    title: "Italy",
    place: "Estrada Napoleônica",
    youtubeUrl: "https://www.youtube.com/watch?v=ghTfgErm64Q",
  },
  {
    id: 20,
    title: "Tokyo",
    place: "Shinjuku, Japan",
    youtubeUrl: "https://www.youtube.com/watch?v=FFYhPs1KcR0",
  },
];

// Função para extrair o ID do vídeo do YouTube
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
      console.log("Video ID extracted:", match[1], "from URL:", url);
      return match[1];
    }
  }

  console.error("Could not extract video ID from URL:", url);
  return "";
}

// Componente para thumbnail com fallback
function ThumbnailImage({
  videoId,
  place,
}: {
  videoId: string;
  place: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [currentThumbnail, setCurrentThumbnail] = useState(0);

  const thumbnailOptions = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/default.jpg`,
  ];

  const handleImageError = () => {
    console.log(`Thumbnail failed for ${place}, trying next option...`);
    if (currentThumbnail < thumbnailOptions.length - 1) {
      setCurrentThumbnail(currentThumbnail + 1);
    } else {
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`Thumbnail loaded successfully for ${place}`);
    setImageError(false);
  };

  if (imageError || !videoId) {
    return (
      <div
        className="virtual-walk-thumbnail"
        style={{
          background: "linear-gradient(45deg, #370c94, #0b0121)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "12px",
          textAlign: "center",
          padding: "10px",
        }}
      >
        <div className="play-button">▶</div>
      </div>
    );
  }

  return (
    <div
      className="virtual-walk-thumbnail"
      style={{
        backgroundImage: `url(${thumbnailOptions[currentThumbnail]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <img
        src={thumbnailOptions[currentThumbnail]}
        alt={place}
        style={{ display: "none" }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <div className="play-button">▶</div>
    </div>
  );
}

// Modal para reprodução de vídeo
function VideoModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
}) {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inicializar YouTube Player API
  useEffect(() => {
    if (!open || !item) return;

    const initializePlayer = () => {
      if (window.YT && window.YT.Player) {
        const ytPlayer = new window.YT.Player(`youtube-player-${videoId}`, {
          height: "100%",
          width: "100%",
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            fs: 0,
            controls: 0,
            disablekb: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log("YouTube Player ready");
              setPlayer(event.target);
              event.target.setVolume(volume);
              if (isMuted) {
                event.target.mute();
              }
            },
            onStateChange: (event: any) => {
              console.log("Player state changed:", event.data);
            },
          },
        });
      }
    };

    // Carregar YouTube API se não estiver carregada
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        setTimeout(initializePlayer, 1000);
      };
    } else {
      setTimeout(initializePlayer, 1000);
    }

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.log("Player cleanup error:", e);
        }
      }
    };
  }, [open, item, volume, isMuted, player]);

  if (!open || !item) return null;

  const videoId = getYouTubeVideoId(item.youtubeUrl);

  if (!videoId) {
    console.error("Invalid YouTube URL:", item.youtubeUrl);
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=0&controls=0&disablekb=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.9)",
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
          maxHeight: "65vh",
          height: "60vh",
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.9)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header com título, controle de som e botão X */}
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                color: "white",
                margin: 0,
                fontSize: "1.3rem",
                fontWeight: 600,
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.7)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Caminhada Virtual - {item.place}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flexShrink: 0,
            }}
          >
            {/* Controlador de som personalizado */}
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
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Botão de mute */}
              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  console.log("Mute/Unmute - Mudo:", newMuted);

                  // Controlar volume real do YouTube
                  if (player) {
                    if (newMuted) {
                      player.mute();
                      console.log("YouTube Player: MUTED");
                    } else {
                      player.unMute();
                      player.setVolume(volume);
                      console.log("YouTube Player: UNMUTED, volume:", volume);
                    }
                  }
                }}
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
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>

              {/* Barra de volume personalizada */}
              <div
                style={{
                  position: "relative",
                  width: "80px",
                  height: "20px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = Math.round((x / rect.width) * 100);
                  const newVolume = Math.max(0, Math.min(100, percentage));
                  setVolume(newVolume);
                  console.log("Volume alterado via clique para:", newVolume);

                  // Controlar volume real do YouTube
                  if (player) {
                    player.setVolume(newVolume);
                    console.log("YouTube Player: Volume set to", newVolume);

                    if (newVolume > 0 && isMuted) {
                      setIsMuted(false);
                      player.unMute();
                    }
                  }
                }}
              >
                {/* Barra de progresso */}
                <div
                  style={{
                    width: `${volume}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #370c94, #5a1bb8)",
                    borderRadius: "10px",
                    transition: "width 0.2s ease",
                    boxShadow: "0 2px 8px rgba(55, 12, 148, 0.4)",
                  }}
                />

                {/* Thumb personalizado */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${volume}%`,
                    transform: "translate(-50%, -50%)",
                    width: "18px",
                    height: "18px",
                    background: "white",
                    borderRadius: "50%",
                    border: "3px solid #370c94",
                    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.5)",
                    cursor: "grab",
                    transition: "transform 0.2s ease",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translate(-50%, -50%) scale(1.3)";
                    e.currentTarget.style.cursor = "grab";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translate(-50%, -50%) scale(1)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.cursor = "grabbing";
                    e.currentTarget.style.transform =
                      "translate(-50%, -50%) scale(1.1)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.cursor = "grab";
                    e.currentTarget.style.transform =
                      "translate(-50%, -50%) scale(1.3)";
                  }}
                />
              </div>

              {/* Botões de controle rápido */}
              <button
                onClick={() => {
                  const newVolume = Math.max(0, volume - 10);
                  setVolume(newVolume);
                  console.log("Volume diminuído para:", newVolume);

                  // Controlar volume real do YouTube
                  if (player) {
                    player.setVolume(newVolume);
                    console.log(
                      "YouTube Player: Volume decreased to",
                      newVolume
                    );

                    if (newVolume === 0) {
                      setIsMuted(true);
                      player.mute();
                    } else if (isMuted) {
                      setIsMuted(false);
                      player.unMute();
                    }
                  }
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                −
              </button>

              <button
                onClick={() => {
                  const newVolume = Math.min(100, volume + 10);
                  setVolume(newVolume);
                  console.log("Volume aumentado para:", newVolume);

                  // Controlar volume real do YouTube
                  if (player) {
                    player.setVolume(newVolume);
                    console.log(
                      "YouTube Player: Volume increased to",
                      newVolume
                    );

                    if (isMuted) {
                      setIsMuted(false);
                      player.unMute();
                    }
                  }
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                +
              </button>

              {/* Indicador de volume */}
              <span
                style={{
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                  minWidth: "35px",
                  textAlign: "center",
                  background: "rgba(0, 0, 0, 0.4)",
                  padding: "3px 8px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
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
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 50, 50, 1)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 0, 0, 0.9)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Container do vídeo */}
        <div
          style={{
            flex: 1,
            position: "relative",
            margin: 0,
            overflow: "hidden",
            minHeight: "200px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "0 0 20px 20px",
              overflow: "hidden",
              background: "#000",
            }}
          >
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={embedUrl}
              title={item.place}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                opacity: volume === 0 ? 0.3 : 1,
                filter: volume === 0 ? "grayscale(100%)" : "none",
                transition: "opacity 0.3s ease, filter 0.3s ease",
              }}
            />

            {/* Overlay de volume - simula controle visual */}
            {isMuted && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "white",
                  padding: "15px 25px",
                  borderRadius: "15px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  backdropFilter: "blur(10px)",
                  zIndex: 10,
                }}
              >
                🔇 MUDO
              </div>
            )}

            {/* Indicador de volume baixo */}
            {volume > 0 && volume < 30 && (
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  zIndex: 10,
                }}
              >
                🔈 Volume Baixo
              </div>
            )}

            {/* Áudio de fundo controlável */}
          </div>
          {/* Camada transparente para bloquear interação */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "transparent",
              zIndex: 1,
              pointerEvents: "auto",
              cursor: "default",
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDoubleClick={(e) => e.preventDefault()}
            onClick={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}

// Modal principal do VirtualWalk
function VirtualWalkModal({
  open,
  onClose,
  selectedItem,
  onItemSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedItem: any;
  onItemSelect: (item: any) => void;
}) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  if (!open) return null;

  const handleItemClick = (item: any) => {
    onItemSelect(item);
    setVideoModalOpen(true);
  };

  const handleVideoModalClose = () => {
    setVideoModalOpen(false);
    onItemSelect(null);
  };

  return (
    <>
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
          zIndex: 2000,
          overflow: "auto",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0f0f23, #1a1a2e)",
            borderRadius: "20px",
            padding: "2rem",
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <h1
              style={{
                color: "white",
                fontSize: "2rem",
                margin: 0,
              }}
            >
              Caminhada Virtual
            </h1>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                padding: "0.5rem",
              }}
            >
              ✕
            </button>
          </div>

          <p
            style={{
              color: "#ccc",
              marginBottom: "2rem",
              lineHeight: "1.5",
            }}
          >
            Dr. Move em sua missão de promover qualidade de vida, saúde e
            longevidade, apresenta o monitoramento de 12 parâmetros de saúde que
            podem ser melhorados com os exercícios realizados!
          </p>

          <div className="virtual-walk-grid">
            {virtualWalkData.map((item) => {
              const videoId = getYouTubeVideoId(item.youtubeUrl);

              return (
                <div
                  key={item.id}
                  className="virtual-walk-card"
                  onClick={() => handleItemClick(item)}
                >
                  <ThumbnailImage videoId={videoId} place={item.place} />
                  <h3 className="virtual-walk-place">{item.place}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <VideoModal
        open={videoModalOpen}
        onClose={handleVideoModalClose}
        item={selectedItem}
      />
    </>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
  });
  const [temperature, setTemperature] = useState<number | undefined>(undefined);
  const [pressure, setPressure] = useState<number | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [speed, setSpeed] = useState(0);
  const [prevSpeed, setPrevSpeed] = useState(0);
  const [dockerTime, setDockerTime] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [hasStartedRunning, setHasStartedRunning] = useState(false);
  const [maxTemperature, setMaxTemperature] = useState<number | undefined>(
    undefined
  );

  // Adicionando estados para rastrear os valores para cálculo de médias
  const [temperatureReadings, setTemperatureReadings] = useState<number[]>([]);
  const [pressureReadings, setPressureReadings] = useState<number[]>([]);
  const [speedReadings, setSpeedReadings] = useState<number[]>([]);
  const [avgTemperature, setAvgTemperature] = useState<number>(0);
  const [avgPressure, setAvgPressure] = useState<number>(0);
  const [avgSpeed, setAvgSpeed] = useState<number>(0);

  // Estado para rastrear o valor atual definido pelo usuário na interface
  const [userSetTemperature, setUserSetTemperature] = useState<number>(25);
  const [userSetPressure, setUserSetPressure] = useState<number>(30);

  // Estados para o modal VirtualWalk
  const [virtualWalkModalOpen, setVirtualWalkModalOpen] = useState(false);
  const [selectedVirtualItem, setSelectedVirtualItem] = useState<any>(null);

  // Estados para o modal de conexão automática
  const [autoConnectionModalVisible, setAutoConnectionModalVisible] =
    useState(false);
  const [autoConnectionSuccess, setAutoConnectionSuccess] = useState(false);
  const [autoConnectionMessage, setAutoConnectionMessage] = useState("");

  const handleDistanceUpdate = (newDistance: number) => {
    setDistance(newDistance);
  };

  // Funções para gerenciar o modal VirtualWalk
  const handleOpenVirtualWalk = () => {
    setVirtualWalkModalOpen(true);
  };

  const handleCloseVirtualWalk = () => {
    setVirtualWalkModalOpen(false);
    setSelectedVirtualItem(null);
  };

  const handleOpenVirtualVideo = (item: any) => {
    setSelectedVirtualItem(item);
    setVirtualWalkModalOpen(false); // Fecha o modal de seleção
  };

  // Função para conexão automática na porta padrão com retry
  const tryAutoConnection = useCallback(async () => {
    const defaultPort = localStorage.getItem("defaultSerialPort");
    const defaultBaudRate = localStorage.getItem("defaultBaudRate");

    console.log("[HARDWARE_LOG] 🔄 AUTO CONNECTION INITIATED");
    console.log("[HARDWARE_LOG] 🔄 Checking localStorage for default port...");
    console.log("[HARDWARE_LOG] 🔄 Default port found:", defaultPort);
    console.log("[HARDWARE_LOG] 🔄 Default baud rate found:", defaultBaudRate);
    console.log("[HARDWARE_LOG] 🔄 Window API available:", !!window.api);

    if (!defaultPort || !window.api) {
      console.log("[HARDWARE_LOG] 🔄 ❌ Auto connection aborted");
      console.log(
        "[HARDWARE_LOG] 🔄 ❌ Reason: No default port or API unavailable"
      );
      console.log(
        "[AUTO_CONNECT] Nenhuma porta padrão encontrada ou API não disponível"
      );
      return;
    }

    const maxRetries = 5;
    const retryDelay = 2000; // 2 segundos

    console.log(
      `[HARDWARE_LOG] 🔄 Starting connection attempts (max ${maxRetries} retries)`
    );
    console.log(`[HARDWARE_LOG] 🔄 Retry delay: ${retryDelay}ms`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const attemptTimestamp = new Date().toISOString();
      console.log(
        `[HARDWARE_LOG] 🔄 [${attemptTimestamp}] ATTEMPT ${attempt}/${maxRetries}`
      );
      console.log(`[HARDWARE_LOG] 🔄 Target port: ${defaultPort}`);
      console.log(
        `[HARDWARE_LOG] 🔄 Target baud rate: ${
          Number(defaultBaudRate) || 115200
        }`
      );
      console.log(
        `[AUTO_CONNECT] Tentativa ${attempt}/${maxRetries} - Conectando à ${defaultPort}`
      );

      try {
        console.log("[HARDWARE_LOG] 🔄 Calling window.api.openSerialPort...");
        const result = await window.api.openSerialPort({
          path: defaultPort,
          baudRate: Number(defaultBaudRate) || 115200,
        });

        console.log("[HARDWARE_LOG] 🔄 API call completed");
        console.log("[HARDWARE_LOG] 🔄 Result:", result);

        if (result.success) {
          console.log(
            `[HARDWARE_LOG] 🔄 ✅ CONNECTION SUCCESSFUL on attempt ${attempt}`
          );
          console.log(`[HARDWARE_LOG] 🔄 ✅ Connected to: ${defaultPort}`);
          console.log(
            `[HARDWARE_LOG] 🔄 ✅ Baud rate: ${
              Number(defaultBaudRate) || 115200
            }`
          );
          console.log(
            `[AUTO_CONNECT] Conectado com sucesso à ${defaultPort} na tentativa ${attempt}`
          );

          setAutoConnectionSuccess(true);
          setAutoConnectionMessage(
            `Esteira pronta para uso na porta ${defaultPort}`
          );

          // Atualizar o status de conexão
          const newConnectionStatus = {
            connected: true,
            portPath: defaultPort,
            baudRate: Number(defaultBaudRate) || 115200,
          };
          console.log(
            "[HARDWARE_LOG] 🔄 ✅ Updating connection status:",
            newConnectionStatus
          );
          setConnectionStatus(newConnectionStatus);

          setAutoConnectionModalVisible(true);
          return; // Sucesso, sai da função
        } else {
          console.log(`[HARDWARE_LOG] 🔄 ❌ Attempt ${attempt} failed`);
          console.log(`[HARDWARE_LOG] 🔄 ❌ Error message: ${result.message}`);
          console.log(`[HARDWARE_LOG] 🔄 ❌ Full result:`, result);
          console.log(
            `[AUTO_CONNECT] Tentativa ${attempt} falhou: ${result.message}`
          );

          // Se é a última tentativa, mostra o erro
          if (attempt === maxRetries) {
            console.log(
              `[HARDWARE_LOG] 🔄 ❌ All attempts exhausted (${maxRetries}/${maxRetries})`
            );
            setAutoConnectionSuccess(false);
            setAutoConnectionMessage(
              `Erro ao conectar na porta ${defaultPort} após ${maxRetries} tentativas: ${result.message}`
            );
            setAutoConnectionModalVisible(true);
          } else {
            // Aguarda antes da próxima tentativa
            console.log(
              `[HARDWARE_LOG] 🔄 ⏳ Waiting ${retryDelay}ms before next attempt...`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      } catch (err: any) {
        console.log(`[HARDWARE_LOG] 🔄 💥 Exception on attempt ${attempt}`);
        console.log(
          `[HARDWARE_LOG] 🔄 💥 Exception type: ${
            err instanceof Error ? err.constructor.name : typeof err
          }`
        );
        console.log(
          `[HARDWARE_LOG] 🔄 💥 Exception message: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.log(
          `[HARDWARE_LOG] 🔄 💥 Exception stack:`,
          err instanceof Error ? err.stack : "No stack trace available"
        );
        console.log(
          `[AUTO_CONNECT] Tentativa ${attempt} erro: ${
            err instanceof Error ? err.message : String(err)
          }`
        );

        // Se é a última tentativa, mostra o erro
        if (attempt === maxRetries) {
          console.log(
            `[HARDWARE_LOG] 🔄 💥 All attempts failed with exceptions`
          );
          setAutoConnectionSuccess(false);
          setAutoConnectionMessage(
            `Erro ao conectar após ${maxRetries} tentativas: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
          setAutoConnectionModalVisible(true);
        } else {
          // Aguarda antes da próxima tentativa
          console.log(
            `[HARDWARE_LOG] 🔄 ⏳ Waiting ${retryDelay}ms before retry after exception...`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
  }, []);

  // Tentar conexão automática quando o Dashboard carrega
  useEffect(() => {
    const timer = setTimeout(() => {
      tryAutoConnection();
    }, 1000); // Aguarda 1 segundo para a UI carregar

    return () => clearTimeout(timer);
  }, [tryAutoConnection]);

  // Função para fechar o modal de auto conexão
  const handleAutoConnectionModalClose = () => {
    setAutoConnectionModalVisible(false);
  };

  // Listener para fechar o modal de configuração
  useEffect(() => {
    const handleCloseSerialModal = () => {
      setOpenModal(false);
    };

    window.addEventListener("closeSerialModal", handleCloseSerialModal);
    return () => {
      window.removeEventListener("closeSerialModal", handleCloseSerialModal);
    };
  }, []);

  // Função para atualizar o valor de temperatura definido pelo usuário
  const handleUserTemperatureChange = (value: number) => {
    setUserSetTemperature(value);
    console.log("[USER_TEMP] Temperatura definida pelo usuário:", value);

    // Quando o usuário define a temperatura, usamos esse valor para a média
    if (speed > 0) {
      // Só registramos na média se estiver em exercício
      setTemperatureReadings((prev) => [...prev, value]);

      // Calcular média de temperatura
      const sum = temperatureReadings.reduce((a, b) => a + b, 0) + value;
      const avg = sum / (temperatureReadings.length + 1);
      setAvgTemperature(avg);
      console.log("[USER_TEMP] Média de temperatura atualizada:", avg);
    }
  };

  // Função para atualizar o valor de pressão definido pelo usuário
  const handleUserPressureChange = (value: number) => {
    setUserSetPressure(value);
    console.log("[USER_PRESSURE] Pressão definida pelo usuário:", value);

    // Quando o usuário define a pressão, usamos esse valor para a média
    if (speed > 0) {
      // Só registramos na média se estiver em exercício
      setPressureReadings((prev) => [...prev, value]);

      // Calcular média de pressão
      const sum = pressureReadings.reduce((a, b) => a + b, 0) + value;
      const avg = sum / (pressureReadings.length + 1);
      setAvgPressure(avg);
      console.log("[USER_PRESSURE] Média de pressão atualizada:", avg);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log("[LOG]", logMessage);
    setLogs((prev) => [...prev, logMessage].slice(-100));
  };

  const clearLogs = () => {
    console.log("[LOG] Clearing logs");
    setLogs([]);
  };

  // Monitorar o valor real de temperatura (atualizado pelo hardware)
  useEffect(() => {
    if (temperature !== undefined) {
      setMaxTemperature((prev) =>
        prev === undefined || temperature > prev ? temperature : prev
      );

      // IMPORTANTE: NÃO usamos o valor do hardware para a média,
      // agora usamos o valor definido pelo usuário
    }
  }, [temperature]);

  // Usamos os efeitos abaixo apenas para o monitoramento da velocidade
  useEffect(() => {
    if (speed > 0) {
      setSpeedReadings((prev) => [...prev, speed]);

      // Calcular média de velocidade
      const sum = speedReadings.reduce((a, b) => a + b, 0) + speed;
      const avg = sum / (speedReadings.length + 1);
      setAvgSpeed(avg);
      console.log(
        "[SPEED] Média atualizada:",
        avg,
        "Leituras:",
        speedReadings.length + 1
      );
    }
  }, [speed]);

  const sendCommand = useCallback(
    async (data: Uint8Array) => {
      if (!connectionStatus.connected || !window.api) {
        console.log(
          "[HARDWARE_LOG] ❌ Command blocked - Not connected to device"
        );
        console.log("[HARDWARE_LOG] 📊 Connection Status:", connectionStatus);
        return;
      }

      try {
        // Log detailed command information
        const hexString = Array.from(data)
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join(" ");

        const timestamp = new Date().toISOString();
        console.log(`[HARDWARE_LOG] 📤 [${timestamp}] SENDING COMMAND`);
        console.log(
          `[HARDWARE_LOG] 📤 Raw bytes: [${Array.from(data).join(", ")}]`
        );
        console.log(`[HARDWARE_LOG] 📤 Hex format: ${hexString}`);
        console.log(`[HARDWARE_LOG] 📤 Command length: ${data.length} bytes`);
        console.log(
          `[HARDWARE_LOG] 📤 Port: ${connectionStatus.portPath || "Unknown"}`
        );

        addLog(`Sending: ${hexString}`);

        // Send the command
        if (window.api) {
          console.log(
            "[HARDWARE_LOG] 📤 Calling window.api.sendSerialCommand..."
          );
          const result = await window.api.sendSerialCommand(data);

          if (result.success) {
            console.log("[HARDWARE_LOG] ✅ Command sent successfully");
            console.log("[HARDWARE_LOG] ✅ API Response:", result);
          } else {
            console.log("[HARDWARE_LOG] ❌ Command failed to send");
            console.log("[HARDWARE_LOG] ❌ Error details:", result.message);
            console.log("[HARDWARE_LOG] ❌ Full API response:", result);
            setError(`Failed to send command: ${result.message}`);
          }
        }
      } catch (err: any) {
        console.log("[HARDWARE_LOG] 💥 Exception while sending command");
        console.log(
          "[HARDWARE_LOG] 💥 Exception type:",
          err instanceof Error ? err.constructor.name : typeof err
        );
        console.log(
          "[HARDWARE_LOG] 💥 Exception message:",
          err instanceof Error ? err.message : String(err)
        );
        console.log(
          "[HARDWARE_LOG] 💥 Exception stack:",
          err instanceof Error ? err.stack : "No stack trace available"
        );
        setError(
          `Error sending command: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.error(err);
      }
    },
    [connectionStatus.connected]
  );

  // Função para definir velocidade e enviar comando ao hardware
  const setSpeedWithCommand = useCallback(
    async (newSpeed: number) => {
      console.log(`[SPEED_CONTROL] Setting speed to ${newSpeed}`);

      // Sempre atualiza o estado local primeiro
      setSpeed(newSpeed);

      // Se estiver conectado, envia o comando para o hardware
      if (connectionStatus.connected && window.api) {
        try {
          console.log(`[SPEED_CONTROL] Sending speed command: ${newSpeed}`);
          const speedCommand = setConveyorSpeed(newSpeed);
          await sendCommand(speedCommand);
          console.log(
            `[SPEED_CONTROL] Successfully sent speed command: ${newSpeed}`
          );

          //Ligar o neon quando a esteira iniciar
          if (newSpeed > 0) {
            console.log('[SPEED_CONTROL] Ligando o neon (setNeonState true)');
            const neonCommand = setNeonState(true);
            await sendCommand(neonCommand);
            console.log('[SPEED_CONTROL] Neon ligado');
          }
        } catch (err) {
          console.error(
            `[SPEED_CONTROL] Failed to send speed command: ${newSpeed}`,
            err
          );
          setError(
            `Failed to set conveyor speed: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      } else {
        console.log(
          `[SPEED_CONTROL] Not connected - only updating local state to ${newSpeed}`
        );
      }
    },
    [connectionStatus.connected, sendCommand]
  );

  // Function to shut down all components
  const shutdownAllComponents = useCallback(async () => {
    if (!connectionStatus.connected || !window.api) {
      console.log("[SHUTDOWN] Not connected, cannot send shutdown commands");
      return;
    }

    console.log("[SHUTDOWN] Shutting down all components before redirecting");
    try {
      // Set conveyor speed to 0
      await setSpeedWithCommand(0);
      console.log("[SHUTDOWN] Set conveyor speed to 0");

      // Set temperature to 0
      const tempCommand = setHeaterPower(0);
      await sendCommand(tempCommand);
      console.log("[SHUTDOWN] Set heater power to 0");

      // Set vacuum to 0
      const pumpCommand = setPumpPower(0);
      await sendCommand(pumpCommand);
      console.log("[SHUTDOWN] Set pump power to 0");

      // Turn off lamp/collagen
      const lampCommand = setLampState(false);
      await sendCommand(lampCommand);
      console.log("[SHUTDOWN] Turned off lamp");

      // Turn off LEDs
      const ledCommand = setLedState(false);
      await sendCommand(ledCommand);
      console.log("[SHUTDOWN] Turned off LEDs");

      // Turn off neon
      const neonCommand = setNeonState(false);
      await sendCommand(neonCommand);
      console.log("[SHUTDOWN] Turned off neon");

      // Set operation mode to STOP/manual
      const modeCommand = setOperationMode(false);
      await sendCommand(modeCommand);
      console.log("[SHUTDOWN] Set operation mode to MANUAL/STOP");

      console.log("[SHUTDOWN] All components have been shut down");
    } catch (err) {
      console.error("[SHUTDOWN] Error shutting down components:", err);
      setError("Failed to shut down all components");
    }
  }, [connectionStatus.connected, sendCommand, setSpeedWithCommand]);

  useEffect(() => {
    if (speed > 0) {
      setHasStartedRunning(true);
    }

    if (prevSpeed > 0 && speed === 0 && hasStartedRunning) {
      // Garantir que temos valores para temperatura e pressão
      const finalAvgTemp = avgTemperature || userSetTemperature || 0;
      const finalAvgPressure = avgPressure || userSetPressure || 0;

      console.log("[EXERCISE_END] Valores finais:", {
        avgTemp: finalAvgTemp,
        avgPress: finalAvgPressure,
        avgSpeed,
      });

      const exerciseData = {
        duration: time,
        distance: distance,
        temperature: temperature,
        maxTemperature: maxTemperature,
        pressure: pressure,
        maxSpeed: prevSpeed,
        // Adicionar valores médios aos dados do exercício
        avgTemperature: finalAvgTemp,
        avgPressure: finalAvgPressure,
        avgSpeed: avgSpeed,
      };

      console.log(
        "[EXERCISE_DATA] Saving exercise data:",
        JSON.stringify(exerciseData)
      );
      sessionStorage.setItem("exerciseData", JSON.stringify(exerciseData));

      // Salvar maxTemperature separadamente para compatibilidade
      if (maxTemperature !== undefined) {
        sessionStorage.setItem("maxTemperature", maxTemperature.toString());
      }

      // Shut down all components before redirecting
      shutdownAllComponents().then(() => {
        setTimeout(() => {
          navigate("/result");
        }, 500);
      });
    }

    setPrevSpeed(speed);
  }, [
    speed,
    hasStartedRunning,
    navigate,
    time,
    distance,
    temperature,
    maxTemperature,
    pressure,
    prevSpeed,
    shutdownAllComponents,
    avgTemperature,
    avgPressure,
    avgSpeed,
    userSetTemperature,
    userSetPressure,
  ]);

  useEffect(() => {
    setPrevSpeed(speed);
  }, [speed]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (speed > 0) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (!hasStartedRunning) {
        setTime(0);
        // Resetar as leituras e médias quando não estiver em exercício
        if (!hasStartedRunning) {
          setTemperatureReadings([]);
          setPressureReadings([]);
          setSpeedReadings([]);
          setAvgTemperature(0);
          setAvgPressure(0);
          setAvgSpeed(0);
        }
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speed, hasStartedRunning]);

  const handleSerialData = useCallback((data: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[HARDWARE_LOG] 📥 [${timestamp}] RECEIVED DATA`);
    console.log("[HARDWARE_LOG] 📥 Raw data type:", typeof data);
    console.log("[HARDWARE_LOG] 📥 Raw data length:", data.length);
    console.log("[HARDWARE_LOG] 📥 Raw data content:", data);

    try {
      // Convertendo os dados para um Uint8Array
      let dataArray: Uint8Array;

      // Ao receber dados da porta serial via IPC, eles vêm como string
      if (typeof data === "string") {
        console.log("[HARDWARE_LOG] 📥 Converting string to byte array...");
        // Temos que converter a string para um array de bytes
        const bytes: number[] = [];
        for (let i = 0; i < data.length; i++) {
          bytes.push(data.charCodeAt(i));
        }
        dataArray = new Uint8Array(bytes);
        console.log(
          "[HARDWARE_LOG] 📥 Converted to bytes:",
          Array.from(dataArray)
        );
      } else {
        console.log("[HARDWARE_LOG] 📥 Data already in binary format");
        dataArray = data as unknown as Uint8Array;
      }

      // Mostrar dados como hex
      const hexString = Array.from(dataArray)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");

      console.log("[HARDWARE_LOG] 📥 Hex representation:", hexString);
      console.log("[HARDWARE_LOG] 📥 Byte count:", dataArray.length);
      addLog(`Received: ${hexString}`);

      // Parse the response
      console.log("[HARDWARE_LOG] 📥 Parsing response...");
      const parsedData = parseResponse(dataArray);
      console.log("[HARDWARE_LOG] 📥 Parsed result:", parsedData);

      if (parsedData) {
        console.log(
          `[HARDWARE_LOG] 📥 Successfully parsed ${parsedData.type} data`
        );
        console.log(`[HARDWARE_LOG] 📥 Parsed value: ${parsedData.value}`);

        switch (parsedData.type) {
          case "temperature":
            console.log("[HARDWARE_LOG] 🌡️  Processing temperature data...");
            // Verificação adicional para valores de temperatura válidos
            if (parsedData.value >= 0 && parsedData.value <= 150) {
              console.log(
                `[HARDWARE_LOG] 🌡️  ✅ Valid temperature: ${parsedData.value.toFixed(
                  1
                )}°C`
              );
              console.log(
                `[HARDWARE_LOG] 🌡️  Previous temperature: ${temperature}°C`
              );
              setTemperature(parsedData.value);
              addLog(`Temperature: ${parsedData.value.toFixed(1)} °C`);
              console.log(
                `[SENSOR_INIT] Temperature sensor responding with valid data: ${parsedData.value.toFixed(
                  1
                )} °C`
              );
            } else {
              console.log(
                `[HARDWARE_LOG] 🌡️  ❌ Invalid temperature: ${parsedData.value}°C (out of range 0-150)`
              );
              console.warn(
                `[SENSOR_INIT] Temperature sensor returned invalid value: ${parsedData.value}`
              );
              addLog(
                `Warning: Invalid temperature reading: ${parsedData.value}`
              );
            }
            break;
          case "pressure":
            console.log("[HARDWARE_LOG] 🔘 Processing pressure data...");
            // Verificação adicional para valores de pressão válidos
            if (parsedData.value >= 0 && parsedData.value <= 2000) {
              console.log(
                `[HARDWARE_LOG] 🔘 ✅ Valid pressure: ${parsedData.value.toFixed(
                  1
                )} hPa`
              );
              console.log(
                `[HARDWARE_LOG] 🔘 Previous pressure: ${pressure} hPa`
              );
              setPressure(parsedData.value);
              addLog(`Pressure: ${parsedData.value.toFixed(1)} hPa`);
              console.log(
                `[SENSOR_INIT] Pressure sensor responding with valid data: ${parsedData.value.toFixed(
                  1
                )} hPa`
              );
            } else {
              console.log(
                `[HARDWARE_LOG] 🔘 ❌ Invalid pressure: ${parsedData.value} hPa (out of range 0-2000)`
              );
              console.warn(
                `[SENSOR_INIT] Pressure sensor returned invalid value: ${parsedData.value}`
              );
              addLog(`Warning: Invalid pressure reading: ${parsedData.value}`);
            }
            break;
          case "speed":
            console.log("[HARDWARE_LOG] 🏃 Processing speed data...");
            console.log(`[HARDWARE_LOG] 🏃 New speed: ${parsedData.value}`);
            console.log(`[HARDWARE_LOG] 🏃 Previous speed: ${speed}`);
            setSpeed(parsedData.value);
            addLog(`Conveyor Speed: ${parsedData.value}`);
            break;
          case "inclination":
            console.log("[HARDWARE_LOG] ⛰️  Processing inclination data...");
            console.log(`[HARDWARE_LOG] ⛰️  Inclination: ${parsedData.value}`);
            addLog(`Conveyor Inclination: ${parsedData.value}`);
            break;
          default:
            console.log(
              `[HARDWARE_LOG] ❓ Unknown data type: ${parsedData.type}`
            );
            break;
        }
      } else {
        console.log("[HARDWARE_LOG] 📥 ❌ Failed to parse response");
        console.log("[HARDWARE_LOG] 📥 ❌ Raw hex data:", hexString);
        console.log("[HARDWARE_LOG] 📥 ❌ Raw bytes:", Array.from(dataArray));
        console.warn(
          "[SERIAL_DATA] Resposta inválida ou não reconhecida:",
          hexString
        );
      }
    } catch (err) {
      console.log("[HARDWARE_LOG] 💥 Exception while processing serial data");
      console.log(
        "[HARDWARE_LOG] 💥 Exception type:",
        err instanceof Error ? err.constructor.name : typeof err
      );
      console.log(
        "[HARDWARE_LOG] 💥 Exception message:",
        err instanceof Error ? err.message : String(err)
      );
      console.log(
        "[HARDWARE_LOG] 💥 Exception stack:",
        err instanceof Error ? err.stack : "No stack trace available"
      );
      console.error("[SERIAL_DATA] Erro ao processar dados:", err);
    }
  }, []);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[HARDWARE_LOG] 🔗 [${timestamp}] CONNECTION STATUS CHANGED`);
    console.log("[HARDWARE_LOG] 🔗 Previous status:", connectionStatus);
    console.log("[HARDWARE_LOG] 🔗 Connected:", connectionStatus.connected);
    console.log("[HARDWARE_LOG] 🔗 Port path:", connectionStatus.portPath);
    console.log("[HARDWARE_LOG] 🔗 Baud rate:", connectionStatus.baudRate);
    console.log("[CONNECTION] Connection status changed:", connectionStatus);

    if (connectionStatus.connected && window.api) {
      console.log("[HARDWARE_LOG] 🔗 ✅ Setting up serial communication");
      console.log("[HARDWARE_LOG] 🔗 ✅ Window API available:", !!window.api);
      console.log("[CONNECTION] Setting up serial data listeners");

      // Define o callback para receber dados
      const onDataReceived = (data: string) => {
        console.log("[HARDWARE_LOG] 🔗 📥 Data received callback triggered");
        console.log("[SERIAL_RECEIVED] Dados recebidos do dispositivo:", data);
        handleSerialData(data);
      };

      // Define o callback para erros
      const onErrorReceived = (errorMsg: string) => {
        console.log("[HARDWARE_LOG] 🔗 ❌ Error callback triggered");
        console.log("[HARDWARE_LOG] 🔗 ❌ Error message:", errorMsg);
        console.error("[SERIAL_ERROR] Serial error received:", errorMsg);
        setError(`Serial error: ${errorMsg}`);
      };

      console.log("[HARDWARE_LOG] 🔗 📡 Registering data listener...");
      // Registra o listener
      window.api.onSerialData(onDataReceived);

      console.log("[HARDWARE_LOG] 🔗 ⚠️  Registering error listener...");
      // Registra o listener de erros
      window.api.onSerialError(onErrorReceived);

      console.log("[HARDWARE_LOG] 🔗 ✅ All listeners registered successfully");

      // Função de limpeza
      return () => {
        console.log("[HARDWARE_LOG] 🔗 🧹 Cleaning up serial listeners");
        console.log("[CONNECTION] Removing serial listeners");
        if (window.api) {
          console.log("[HARDWARE_LOG] 🔗 🧹 Calling removeSerialListeners...");
          window.api.removeSerialListeners();
          console.log("[HARDWARE_LOG] 🔗 🧹 Listeners removed successfully");
        } else {
          console.log("[HARDWARE_LOG] 🔗 🧹 ❌ No API available for cleanup");
        }
      };
    } else {
      console.log("[HARDWARE_LOG] 🔗 ❌ Not setting up listeners");
      console.log(
        "[HARDWARE_LOG] 🔗 ❌ Reason - Connected:",
        connectionStatus.connected,
        "API:",
        !!window.api
      );
    }
  }, [connectionStatus.connected, handleSerialData]);

  // Solicitar dados de temperatura e pressão periodicamente
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(
      `[HARDWARE_LOG] 🌡️  [${timestamp}] ENVIRONMENT DATA EFFECT TRIGGERED`
    );
    console.log("[HARDWARE_LOG] 🌡️  Connected:", connectionStatus.connected);
    console.log("[HARDWARE_LOG] 🌡️  Window API:", !!window.api);
    console.log("[HARDWARE_LOG] 🌡️  Current temperature:", temperature);
    console.log("[HARDWARE_LOG] 🌡️  Current pressure:", pressure);
    console.log(
      "[ENVIRONMENT] Environment data request effect. Connected:",
      connectionStatus.connected
    );

    if (!connectionStatus.connected || !window.api) {
      console.log("[HARDWARE_LOG] 🌡️  ❌ Environment data request aborted");
      console.log(
        "[HARDWARE_LOG] 🌡️  ❌ Reason - Connected:",
        connectionStatus.connected,
        "API:",
        !!window.api
      );
      return;
    }

    console.log("[HARDWARE_LOG] 🌡️  ✅ Starting environment data monitoring");

    // Variáveis para controlar as tentativas de inicialização
    let initRetryCount = 0;
    const maxInitRetries = 5;
    let temperatureInitialized = false;
    let pressureInitialized = false;

    // Função para solicitar temperatura e pressão
    const requestEnvironmentData = async () => {
      const requestTimestamp = new Date().toISOString();
      console.log(
        `[HARDWARE_LOG] 🌡️  [${requestTimestamp}] REQUESTING ENVIRONMENT DATA`
      );

      try {
        // Verificar estado atual dos sensores
        temperatureInitialized =
          temperature !== undefined && temperature !== null;
        pressureInitialized = pressure !== undefined && pressure !== null;

        console.log("[HARDWARE_LOG] 🌡️  📊 Current sensor status:");
        console.log(
          "[HARDWARE_LOG] 🌡️  📊 Temperature initialized:",
          temperatureInitialized,
          "(value:",
          temperature,
          ")"
        );
        console.log(
          "[HARDWARE_LOG] 🌡️  📊 Pressure initialized:",
          pressureInitialized,
          "(value:",
          pressure,
          ")"
        );
        console.log(
          "[HARDWARE_LOG] 🌡️  📊 Retry count:",
          initRetryCount,
          "/",
          maxInitRetries
        );

        // Se ainda não inicializou os sensores, adiciona logs específicos
        if (!temperatureInitialized || !pressureInitialized) {
          console.log(
            `[HARDWARE_LOG] 🌡️  🔄 Initialization attempt ${
              initRetryCount + 1
            }/${maxInitRetries}`
          );
          console.log(
            `[ENVIRONMENT] Initialization attempt ${
              initRetryCount + 1
            }/${maxInitRetries}`
          );
          console.log(
            `[ENVIRONMENT] Temperatura initialized: ${temperatureInitialized}`
          );
          console.log(
            `[ENVIRONMENT] Pressure initialized: ${pressureInitialized}`
          );
        }

        // Solicita temperatura
        console.log("[HARDWARE_LOG] 🌡️  📤 Requesting temperature data...");
        console.log("[ENVIRONMENT] Requesting temperature data");
        const tempCommand = requestTemperature();
        console.log(
          "[HARDWARE_LOG] 🌡️  📤 Temperature command bytes:",
          Array.from(tempCommand)
        );
        console.log(
          "[ENVIRONMENT] Temperature command:",
          Array.from(tempCommand)
        );
        await sendCommand(tempCommand);

        // Add a small delay between commands to prevent buffer overflow
        console.log("[HARDWARE_LOG] 🌡️  ⏳ Waiting 100ms between commands...");
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Solicita pressão
        console.log("[HARDWARE_LOG] 🌡️  📤 Requesting pressure data...");
        console.log("[ENVIRONMENT] Requesting pressure data");
        const pressCommand = requestPressure();
        console.log(
          "[HARDWARE_LOG] 🌡️  📤 Pressure command bytes:",
          Array.from(pressCommand)
        );
        console.log(
          "[ENVIRONMENT] Pressure command:",
          Array.from(pressCommand)
        );
        await sendCommand(pressCommand);

        console.log("[HARDWARE_LOG] 🌡️  📊 Post-request status:");
        console.log("[HARDWARE_LOG] 🌡️  📊 Temperature:", temperature);
        console.log("[HARDWARE_LOG] 🌡️  📊 Pressure:", pressure);
        console.log(
          "[ENVIRONMENT] Current temperature:",
          temperature,
          "Current pressure:",
          pressure
        );

        // Atualizar status de inicialização após solicitações
        temperatureInitialized =
          temperature !== undefined && temperature !== null;
        pressureInitialized = pressure !== undefined && pressure !== null;

        // Se os sensores não foram inicializados e ainda estamos dentro do limite de tentativas
        if (
          (!temperatureInitialized || !pressureInitialized) &&
          initRetryCount < maxInitRetries
        ) {
          initRetryCount++;
          console.log(
            `[HARDWARE_LOG] 🌡️  ⚠️  Sensors not fully initialized - scheduling retry`
          );
          console.log(
            `[HARDWARE_LOG] 🌡️  ⚠️  Retry count: ${initRetryCount}/${maxInitRetries}`
          );
          console.log(`[HARDWARE_LOG] 🌡️  ⚠️  Will retry in 1 second...`);
          console.log(
            `[ENVIRONMENT] Sensors not fully initialized. Retrying in 1 second (attempt ${initRetryCount}/${maxInitRetries})`
          );

          // Tenta novamente após 1 segundo
          setTimeout(requestEnvironmentData, 1000);
        } else if (
          (!temperatureInitialized || !pressureInitialized) &&
          initRetryCount >= maxInitRetries
        ) {
          // Se atingimos o número máximo de tentativas sem sucesso, apenas loga o erro
          console.log(
            "[HARDWARE_LOG] 🌡️  ❌ Maximum initialization attempts reached - sensors may not be responding"
          );
          console.warn(
            "[ENVIRONMENT] Maximum initialization attempts reached without success. Sensors may not be responding properly."
          );
          setError(
            "Temperature/Pressure sensors not responding after multiple attempts"
          );
        } else if (temperatureInitialized && pressureInitialized) {
          console.log(
            "[HARDWARE_LOG] 🌡️  ✅ All sensors initialized successfully"
          );
        }
      } catch (err) {
        console.log(
          "[HARDWARE_LOG] 🌡️  💥 Exception during environment data request"
        );
        console.log(
          "[HARDWARE_LOG] 🌡️  💥 Exception type:",
          err instanceof Error ? err.constructor.name : typeof err
        );
        console.log(
          "[HARDWARE_LOG] 🌡️  💥 Exception message:",
          err instanceof Error ? err.message : String(err)
        );
        console.log(
          "[HARDWARE_LOG] 🌡️  💥 Exception stack:",
          err instanceof Error ? err.stack : "No stack trace available"
        );
        console.error(
          "[ENVIRONMENT] Error requesting environmental data:",
          err
        );

        // Em caso de erro durante a inicialização, tenta novamente
        if (
          (!temperatureInitialized || !pressureInitialized) &&
          initRetryCount < maxInitRetries
        ) {
          initRetryCount++;
          console.log(
            `[HARDWARE_LOG] 🌡️  💥 Error during initialization - scheduling retry`
          );
          console.log(
            `[HARDWARE_LOG] 🌡️  💥 Retry count: ${initRetryCount}/${maxInitRetries}`
          );
          console.log(`[HARDWARE_LOG] 🌡️  💥 Will retry in 2 seconds...`);
          console.log(
            `[ENVIRONMENT] Error during initialization. Retrying in 2 seconds (attempt ${initRetryCount}/${maxInitRetries})`
          );

          // Tenta novamente após 2 segundos em caso de erro
          setTimeout(requestEnvironmentData, 2000);
        } else if (
          (!temperatureInitialized || !pressureInitialized) &&
          initRetryCount >= maxInitRetries
        ) {
          // Se atingimos o número máximo de tentativas sem sucesso, apenas loga o erro
          console.log(
            "[HARDWARE_LOG] 🌡️  💥 Maximum attempts reached with errors - sensors may not be responding"
          );
          console.warn(
            "[ENVIRONMENT] Maximum initialization attempts reached with errors. Sensors may not be responding properly."
          );
          setError(
            "Temperature/Pressure sensors not responding after multiple attempts with errors"
          );
        }
      }
    };

    // Solicita imediatamente ao conectar
    console.log(
      "[HARDWARE_LOG] 🌡️  🚀 Making initial environment data request"
    );
    console.log("[ENVIRONMENT] Initial request for environment data");
    requestEnvironmentData();

    // Configura intervalo para solicitar periodicamente
    console.log(
      "[HARDWARE_LOG] 🌡️  ⏰ Setting up periodic environment data requests (5000ms interval)"
    );
    console.log(
      "[ENVIRONMENT] Setting up interval for environment data (5000ms)"
    );
    const interval = setInterval(() => {
      console.log(
        "[HARDWARE_LOG] 🌡️  ⏰ Periodic environment data request triggered"
      );
      console.log(
        "[HARDWARE_LOG] 🌡️  ⏰ Checking if request should be made..."
      );
      console.log(
        "[HARDWARE_LOG] 🌡️  ⏰ Init retry count:",
        initRetryCount,
        "Max retries:",
        maxInitRetries
      );
      console.log(
        "[HARDWARE_LOG] 🌡️  ⏰ Temp initialized:",
        temperatureInitialized,
        "Press initialized:",
        pressureInitialized
      );

      // Se ainda estamos na fase de inicialização, não solicita novamente pelo intervalo
      if (
        initRetryCount >= maxInitRetries ||
        (temperatureInitialized && pressureInitialized)
      ) {
        console.log(
          "[HARDWARE_LOG] 🌡️  ⏰ ✅ Making periodic environment data request"
        );
        requestEnvironmentData();
      } else {
        console.log(
          "[HARDWARE_LOG] 🌡️  ⏰ ⏭️  Skipping periodic request (initialization in progress)"
        );
      }
    }, 5000); // A cada 5 segundos

    return () => {
      console.log(
        "[HARDWARE_LOG] 🌡️  🧹 Cleaning up environment data monitoring"
      );
      console.log("[ENVIRONMENT] Clearing environment data interval");
      clearInterval(interval);
    };
  }, [connectionStatus.connected, sendCommand]);

  // Log whenever temperature or pressure changes
  useEffect(() => {
    const tempTimestamp = new Date().toISOString();
    console.log(
      `[HARDWARE_LOG] 🌡️  [${tempTimestamp}] TEMPERATURE STATE CHANGED`
    );
    console.log("[HARDWARE_LOG] 🌡️  New temperature value:", temperature);
    console.log("[HARDWARE_LOG] 🌡️  Temperature type:", typeof temperature);
    console.log(
      "[HARDWARE_LOG] 🌡️  Temperature defined:",
      temperature !== undefined
    );
    console.log("[HARDWARE_LOG] 🌡️  Temperature null:", temperature === null);
    if (temperature !== undefined && temperature !== null) {
      console.log(
        "[HARDWARE_LOG] 🌡️  ✅ Valid temperature reading:",
        temperature.toFixed(2),
        "°C"
      );
    } else {
      console.log("[HARDWARE_LOG] 🌡️  ❌ Invalid temperature reading");
    }
    console.log("[STATE] Temperature updated:", temperature);
  }, [temperature]);

  useEffect(() => {
    const pressTimestamp = new Date().toISOString();
    console.log(`[HARDWARE_LOG] 🔘 [${pressTimestamp}] PRESSURE STATE CHANGED`);
    console.log("[HARDWARE_LOG] 🔘 New pressure value:", pressure);
    console.log("[HARDWARE_LOG] 🔘 Pressure type:", typeof pressure);
    console.log("[HARDWARE_LOG] 🔘 Pressure defined:", pressure !== undefined);
    console.log("[HARDWARE_LOG] 🔘 Pressure null:", pressure === null);
    if (pressure !== undefined && pressure !== null) {
      console.log(
        "[HARDWARE_LOG] 🔘 ✅ Valid pressure reading:",
        pressure.toFixed(2),
        "hPa"
      );
    } else {
      console.log("[HARDWARE_LOG] 🔘 ❌ Invalid pressure reading");
    }
    console.log("[STATE] Pressure updated:", pressure);
  }, [pressure]);

  useEffect(() => {
    const initTimestamp = new Date().toISOString();
    console.log(
      `[HARDWARE_LOG] ⚙️  [${initTimestamp}] DEVICE INITIALIZATION EFFECT`
    );
    console.log("[HARDWARE_LOG] ⚙️  Connected:", connectionStatus.connected);
    console.log("[HARDWARE_LOG] ⚙️  Window API:", !!window.api);
    console.log("[HARDWARE_LOG] ⚙️  Connection status:", connectionStatus);

    if (connectionStatus.connected && window.api) {
      console.log("[HARDWARE_LOG] ⚙️  ✅ Starting device initialization");
      console.log("[CONNECTION] Setting operation mode to MANUAL");

      const setManualMode = async () => {
        try {
          console.log(
            "[HARDWARE_LOG] ⚙️  🔧 Setting operation mode to MANUAL..."
          );
          // Set operation mode to MANUAL (false = manual, true = auto)
          const manualModeCommand = setOperationMode(false);
          console.log(
            "[HARDWARE_LOG] ⚙️  🔧 Manual mode command:",
            Array.from(manualModeCommand)
          );
          await sendCommand(manualModeCommand);
          console.log(
            "[HARDWARE_LOG] ⚙️  ✅ Successfully set operation mode to MANUAL"
          );
          console.log("[CONNECTION] Successfully set operation mode to MANUAL");

          // Small delay between commands
          console.log(
            "[HARDWARE_LOG] ⚙️  ⏳ Waiting 200ms between initialization commands..."
          );
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Set conveyor speed to 0 during initialization
          console.log(
            "[HARDWARE_LOG] ⚙️  🏃 Initializing conveyor speed to 0..."
          );
          console.log("[CONNECTION] Initializing conveyor speed to 0");
          await setSpeedWithCommand(0);
          console.log(
            "[HARDWARE_LOG] ⚙️  ✅ Successfully initialized conveyor speed to 0"
          );
          console.log("[CONNECTION] Successfully set conveyor speed to 0");

          console.log(
            "[HARDWARE_LOG] ⚙️  ✅ Device initialization completed successfully"
          );
        } catch (err) {
          console.log(
            "[HARDWARE_LOG] ⚙️  💥 Exception during device initialization"
          );
          console.log(
            "[HARDWARE_LOG] ⚙️  💥 Exception type:",
            err instanceof Error ? err.constructor.name : typeof err
          );
          console.log(
            "[HARDWARE_LOG] ⚙️  💥 Exception message:",
            err instanceof Error ? err.message : String(err)
          );
          console.log(
            "[HARDWARE_LOG] ⚙️  💥 Exception stack:",
            err instanceof Error ? err.stack : "No stack trace available"
          );
          console.error(
            "[CONNECTION] Failed to initialize device settings:",
            err
          );
          setError("Failed to initialize device settings");
        }
      };

      // Call the function to set manual mode
      console.log("[HARDWARE_LOG] ⚙️  🚀 Calling setManualMode function...");
      setManualMode();
    } else {
      console.log("[HARDWARE_LOG] ⚙️  ❌ Device initialization skipped");
      console.log(
        "[HARDWARE_LOG] ⚙️  ❌ Reason - Connected:",
        connectionStatus.connected,
        "API:",
        !!window.api
      );
    }
  }, [connectionStatus.connected, sendCommand]);

  // Set speed to 0 when connection is lost
  useEffect(() => {
    const connectionTimestamp = new Date().toISOString();
    console.log(
      `[HARDWARE_LOG] 🔌 [${connectionTimestamp}] CONNECTION STATUS MONITOR`
    );
    console.log(
      "[HARDWARE_LOG] 🔌 Connection status:",
      connectionStatus.connected
    );
    console.log("[HARDWARE_LOG] 🔌 Current speed:", speed);

    if (!connectionStatus.connected) {
      console.log(
        "[HARDWARE_LOG] 🔌 ❌ Connection lost - resetting speed to 0"
      );
      console.log("[HARDWARE_LOG] 🔌 ❌ Previous speed was:", speed);
      console.log(
        "[CONNECTION] Connection lost or not established. Setting speed to 0."
      );
      // Quando não há conexão, só atualiza o estado local
      setSpeed(0);
      console.log(
        "[HARDWARE_LOG] 🔌 ❌ Speed reset to 0 due to connection loss"
      );
    } else {
      console.log("[HARDWARE_LOG] 🔌 ✅ Connection is active");
    }
  }, [connectionStatus.connected]);

  return (
    <div className="container-dashboard">
      <DashboardHeader onClose={() => setOpenModal(!openModal)} temperature={temperature} />
      <main className="container-dashboard-grid">
        <div className="grid-docker-component">
          <DockerButtonComponent
            isConnected={connectionStatus.connected}
            onSendCommand={sendCommand}
            currentTemperature={temperature}
            currentPressure={pressure}
            time={time}
            speed={speed}
            onDistanceUpdate={handleDistanceUpdate}
            onTemperatureChange={handleUserTemperatureChange}
            onPressureChange={handleUserPressureChange}
            onSpeedChange={setSpeedWithCommand}
          />
        </div>
        <div className="grid-man-running-component">
          <ManRunningComponent speed={speed} />
        </div>
        <div className="grid-conveyor-component">
          <ConveyorComponent
            isConnected={connectionStatus.connected}
            onSendCommand={sendCommand}
            speed={speed}
            onSpeedChange={setSpeedWithCommand}
            time={time}
            distance={distance}
            temperature={temperature ?? 0}
            pressure={pressure ?? 0}
          />
        </div>
        <div className="grid-smallDiv-component">
          <SmallDivsComponent
            running={speed > 0}
            onStart={() => setSpeedWithCommand(1)}
            onStop={() => setSpeedWithCommand(0)}
          />
        </div>
        <div className="grid-comp-performance">
          <PerformanceComponent />
        </div>
        <div className="grid-options-component">
          <OptionsDashComponent onVirtualWalkOpen={handleOpenVirtualWalk} />
        </div>
      </main>

      {/* Modal de Conexão Automática */}
      <AutoConnectionModal
        isVisible={autoConnectionModalVisible}
        isSuccess={autoConnectionSuccess}
        message={autoConnectionMessage}
        onClose={handleAutoConnectionModalClose}
      />

      {/* Modal VirtualWalk */}
      {!selectedVirtualItem && (
        <VirtualWalkModal
          open={virtualWalkModalOpen}
          onClose={handleCloseVirtualWalk}
          selectedItem={selectedVirtualItem}
          onItemSelect={handleOpenVirtualVideo}
        />
      )}

      {/* Modal de Vídeo com Controle Real */}
      {selectedVirtualItem && (
        <VideoModalReal
          open={!!selectedVirtualItem}
          onClose={() => {
            setSelectedVirtualItem(null);
            setVirtualWalkModalOpen(true);
          }}
          item={selectedVirtualItem}
        />
      )}

      {/* Modal de Configuração da Porta Serial */}
      {openModal && (
        <div className="serial-modal-overlay-dashboard">
          <SerialPortSelector onConnectionStatusChange={setConnectionStatus} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;