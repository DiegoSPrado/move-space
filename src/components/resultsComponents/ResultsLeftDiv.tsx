import CronometroImg from "../../assets/images/Cronometro-1.png";
import FrequenciaImg from "../../assets/images/Frequencia-1.png";
import HeartBeat from "../../assets/images/heartBeat.png";
import TemperaturaImg from "../../assets/images/Temperatura1.png";
import Vetor1 from "../../assets/images/results/vetorResult.png";

import PlusImg from "../../assets/images/Vector.png";
import MinusImg from "../../assets/images/Group.png";
import { useState } from "react";

interface ResultsLeftDivProps {
  temperature: string;
  duration: string;
}

function ResultsLeftDivComponent({
  temperature,
  duration,
}: ResultsLeftDivProps) {
  const [level, setLevel] = useState(8);
  const maxLevel = 12;


  return (
    <div className="div-results-left">
      <div
        className="results-right-div-content"
        style={{ position: "relative", top: "0", left: "80px" }}
      >
        <div className="temperature-button">
          <img src={TemperaturaImg} alt="Imagem Temperatura" />
        </div>
        <div className="vacuo-info">
          <div className="quantifier-results" style={{ color: "#FF2424" }}>
            <span className="value-results">{temperature}°C</span>
          </div>
          <p className="dash-subtitles">TEMPERATURA MÉDIA</p>
        </div>
      </div>

      <div className="results-right-div-content">
        <img src={CronometroImg} alt="Cronometro" className="vacuo-img" />
        <div className="vacuo-info">
          <div className="quantifier-results">
            <span className="value-results" style={{ color: "#F28A01" }}>
              {duration}
            </span>
          </div>
          <p className="dash-subtitles">TEMPO DE TREINO</p>
        </div>
      </div>
      <img
        src={Vetor1}
        alt=""
        style={{ transform: "translate(-40px, -40px)" }}
      />
      
      
    </div>
  );
}

export default ResultsLeftDivComponent;
