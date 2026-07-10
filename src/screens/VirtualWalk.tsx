import React, { useState, useEffect, useRef } from "react";
import AppHeader from "../components/dashbordComponents/AppHeader";
import StaticBgRun from "../assets/images/virtualWalk/static-man.png";
import "../constants/VirtualPage.css";
import { Link } from "react-router-dom";

// Função melhorada para extrair o ID do vídeo do YouTube da URL
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

// Função para gerar URL da thumbnail do YouTube com múltiplas opções
function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) {
    console.error("No video ID provided for thumbnail");
    return "";
  }

  // Tentar diferentes resoluções de thumbnail
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  console.log("Generated thumbnail URL:", thumbnailUrl);
  return thumbnailUrl;
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

function Modal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
}) {
  const [volume, setVolume] = useState(50);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!open || !item) return null;

  const videoId = getYouTubeVideoId(item.youtubeUrl);

  if (!videoId) {
    console.error("Invalid YouTube URL:", item.youtubeUrl);
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=0&controls=0&disablekb=1&iv_load_policy=3&cc_load_policy=0&playsinline=1`;

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
        zIndex: 2000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-walking-video-new">
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
                onClick={() => setVolume(volume === 0 ? 50 : 0)}
                style={{
                  background:
                    volume === 0
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
                {volume === 0 ? "🔇" : "🔊"}
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
                    width: "16px",
                    height: "16px",
                    background: "white",
                    borderRadius: "50%",
                    border: "2px solid #370c94",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translate(-50%, -50%) scale(1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translate(-50%, -50%) scale(1)";
                  }}
                />
              </div>

              {/* Indicador de volume */}
              <span
                style={{
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                  minWidth: "35px",
                  textAlign: "center",
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "2px 6px",
                  borderRadius: "8px",
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

        {/* Container do vídeo reduzido */}
        <div className="video-section-compact">
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src={embedUrl}
            title={item.place}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            className="video-iframe"
          />
          {/* Camada transparente para bloquear interação */}
          <div className="video-overlay" />
        </div>
      </div>
    </div>
  );
}

function VirtualWalk() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const handleOpenModal = (item: any) => {
    console.log("Opening modal for:", item);
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="virtual-walk-bg">
      <img src={StaticBgRun} alt="Homem correndo estatico" className="img-bg" />
      <AppHeader onClose={handleCloseModal} />
      <Link to={"/"} className="btn-back">
        ←
      </Link>

      <div className="virtual-walk-content">
        <div className="virtual-walk-header">
          <h1 className="virtual-walk-title">Caminhada Virtual</h1>
          <p className="virtual-walk-description">
            O Dr. Move, em sua missão de promover qualidade de vida, saúde e
            longevidade, apresenta a caminhada virtual com cenários inspiradores
            para tornar seus exercícios mais motivadores e prazerosos!
          </p>
        </div>

        <div className="virtual-walk-grid">
          {virtualWalkData.map((item) => {
            const videoId = getYouTubeVideoId(item.youtubeUrl);

            return (
              <div
                key={item.id}
                className="virtual-walk-card"
                onClick={() => handleOpenModal(item)}
              >
                <ThumbnailImage videoId={videoId} place={item.place} />
                <h3 className="virtual-walk-place">{item.place}</h3>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={openModal} onClose={handleCloseModal} item={selectedItem} />
    </div>
  );
}

export default VirtualWalk;
