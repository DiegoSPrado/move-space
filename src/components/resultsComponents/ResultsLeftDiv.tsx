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

  const gradients = [
    "#000000",
    "#010304",
    "#050E12",
    "#0C2028",
    "#163947",
    "#235A6F",
    "#3281A1",
    "#44AFDA",
    "#4CC2F1",
    "#317E9C",
    "#1C4859",
    "#0C2129",
    "#03080B",
    "#000000",
  ];

  const handleIncrease = () => {
    if (level < maxLevel) setLevel(level + 1);
  };

  const handleDecrease = () => {
    if (level > 0) setLevel(level - 1);
  };

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
      <div
        className="results-right-div-content"
        style={{ position: "relative", bottom: "40px", right: "50px" }}
      >
        <div className="img-frequencia">
          <img
            src={FrequenciaImg}
            alt=""
            style={{ zIndex: "0", display: "block" }}
          />
          <img
            src={HeartBeat}
            alt=""
            style={{
              zIndex: "1",
              position: "absolute",
              top: "20px",
              left: "-10px",
            }}
          />
        </div>
        <div style={{ transform: "translateY(-22px)" }}>
          <div>
            <span className="value-results" style={{ color: "#23E3FF" }}>
              0
            </span>
            <span> bpm</span>
          </div>
          <div>
            <p className="title-subresults">FREQUÊNCIA CARDÍACA</p>
          </div>
        </div>
      </div>
      <div
        className="control-result"
        style={{ position: "relative", bottom: "40px" }}
      >
        <button className="btn-control-result" onClick={handleIncrease}>
          <img src={PlusImg} alt="" />
        </button>
        <div className="bars">
          {[...Array(maxLevel)].map((_, i) => (
            <div
              key={i}
              className={`bar ${i < level ? "active" : ""}`}
              style={{
                transform: `rotateY(${(i - maxLevel / 2) * 6}deg)`,
                background: gradients[i],
                opacity: i < level ? 1 : 0.2,
              }}
            />
          ))}
        </div>
        <button className="btn-control-result" onClick={handleDecrease}>
          <img src={MinusImg} alt="" />
        </button>
      </div>
    </div>
  );
}

export default ResultsLeftDivComponent;
