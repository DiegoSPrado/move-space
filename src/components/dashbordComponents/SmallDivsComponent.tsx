
import React, { useState } from "react";

import FrequenciaImg from "../../assets/images/Frequencia-1.png";
import PaDiastolicaImg from "../../assets/images/PADiastolica.png";
import PaSistolicaImg from "../../assets/images/PASistolica 1.png";
import HeartBeat from "../../assets/images/heartBeat.png";


interface SmallDivsComponentProps {
  running: boolean;
  onStart: () => void;
  onStop: () => void;
}

const SmallDivsComponent: React.FC<SmallDivsComponentProps> = ({ running, onStart, onStop }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const handleActionWithCountdown = (action: () => void) => {
    setCountdown(3);
    setPendingAction(() => action);
    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current === 0) {
        clearInterval(interval);
        setCountdown(null);
        setPendingAction(null);
        action();
      }
    }, 1000);
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        marginTop: "20px",
        position: "relative",
      }}
    >
      
      <div
        className="div-circle-subresults"
        style={{ cursor: countdown ? "not-allowed" : "pointer" }}
        onClick={() => {
          if (!countdown) {
            handleActionWithCountdown(running ? onStop : onStart);
          }
        }}
        >
        <div className={running ? "btn-stop" : "btn-start"}>
          <p className="dash-subtitles">{running ? "PARAR" : "INICIAR"}</p>
        </div>
        </div>
       {countdown !== null && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <span style={{ color: "#fff", fontSize: 48, fontWeight: "bold" }}>{countdown}</span>
        </div>
        )}
      </div>
  );
};

export default SmallDivsComponent;
