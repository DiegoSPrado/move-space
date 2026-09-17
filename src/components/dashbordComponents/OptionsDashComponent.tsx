import React, { useState, useEffect } from "react";

import SpotifyBtn from "../../assets/images/gridOptionsimages/SpotifyBtn.png";
import VirtualCircle from "../../assets/images/gridOptionsimages/Caminhada.png";
import NetflixBtn from "../../assets/images/gridOptionsimages/Netflix.png";
import WhatsappBtn from "../..//assets/images/gridOptionsimages/Whatsapp.png";
import CheckupBtn from "../../assets/images/gridOptionsimages/Checkup.png";
import MonitoramentoBtn from "../../assets/images/gridOptionsimages/Monitoramento.png";
import ModalCheckup from "./ModalCheckup";
import LedsComponent from "./LedsComponent";

interface OptionsDashComponentProps {
  isConnected: boolean;
  onSendCommand: (data: Uint8Array) => Promise<void>;
  onVirtualWalkOpen?: () => void;
  horizontal?: boolean;
}

function OptionsDashComponent({
  isConnected,
  onSendCommand,
  onVirtualWalkOpen,
  horizontal = false
}: OptionsDashComponentProps) {
  const [openCheckupModal, setOpenCheckupModal] = useState(false);



  const openNetflix = () => {
    if (window.api && window.api.openInternalWindow) {
      window.api
        .openInternalWindow("https://www.netflix.com", "Netflix")
        .then((result) => console.log("Netflix aberto:", result))
        .catch((err) => console.error("Erro ao abrir Netflix:", err));
    } else {
      // Fallback para o método tradicional
      window.open("https://www.netflix.com", "_blank");
    }
  };

  const openWhatsapp = () => {
    if (window.api && window.api.openInternalWindow) {
      window.api
        .openInternalWindow("https://web.whatsapp.com", "WhatsApp")
        .then((result) => console.log("WhatsApp aberto:", result))
        .catch((err) => console.error("Erro ao abrir WhatsApp:", err));
    } else {
      // Fallback para o método tradicional
      window.open("https://web.whatsapp.com", "_blank");
    }
  };

  const openSpotify = () => {
    // Tenta abrir o app do Spotify usando o protocolo spotify:
    const spotifyUri = "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M";
    if (window.api && window.api.openExternal) {
      window.api
        .openExternal(spotifyUri)
        .then((result) => console.log("Spotify app aberto:", result))
        .catch((err) => {
          console.error("Erro ao abrir Spotify app:", err);
          // Fallback para web caso falhe
          window.open(
            "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
            "_blank"
          );
        });
    } else {
      // Fallback para o método tradicional
      window.open(
        "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
        "_blank"
      );
    }
  };

  const openBiotriagem = () => {
    if (window.api && window.api.openInternalWindow) {
      window.api
        .openInternalWindow(
          "https://www.biotriagemplataforma.com.br/",
          "Biotriagem - Monitoramento"
        )
        .then((result) => console.log("Biotriagem aberta:", result))
        .catch((err) => console.error("Erro ao abrir Biotriagem:", err));
    } else {
      window.open("https://www.biotriagemplataforma.com.br/", "_blank");
    }
  };

  return (
    <div className={`div-options-buttons${horizontal ? " div-options-buttons--horizontal" : ""}`}>
      <div className="btns-options" onClick={onVirtualWalkOpen}>
        <div className="div-circle-options">
          <img src={VirtualCircle} alt="Botão Caminhada" width={"100%"} />
        </div>
        <p className="options-title">CAMINHADA VIRTUAL</p>
      </div>
      <div className="btns-options" onClick={() => setOpenCheckupModal(true)}>
        <div className="div-circle-options">
          <img src={CheckupBtn} alt="Checkup Fisiológico" width={"100%"} />
        </div>
        <p className="options-title">CHECKUP FISIOLOGICO BIOTRIAGEM</p>
      </div>
      <div className="btns-options" onClick={openBiotriagem}>
        <div className="div-circle-options">
          <img
            src={MonitoramentoBtn}
            alt="Botão de monitoramento"
            width={"100%"}
          />
        </div>
        <p className="options-title">MONITORAMENTO SAUDE</p>
      </div>

      

      
      
      {openCheckupModal && (
        <ModalCheckup onClose={() => setOpenCheckupModal(false)} />
      )}
    </div>
  );
}

export default OptionsDashComponent;
