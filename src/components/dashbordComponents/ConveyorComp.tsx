import React, { useEffect, useRef, useState } from "react";
import { setNeonState } from "../../utils/SerialCommunication";
import { useNavigate } from "react-router-dom";
import VelocidadeImg from "../../assets/images/Velocidade-1.png";
import InclinacaoImg from "../../assets/images/Distancia-1.png";
import DistanciaImg from "../../assets/images/Distancia3-1.png";
import CapsulaColageno from "../../assets/images/capsulaneon.png";
import CapsulaOff from "../../assets/images/capsulaoff.png";

import "../../constants/GridDashboard.css";
import {
  setConveyorSpeed as sendConveyorSpeed,
  setConveyorInclination as sendConveyorInclination,
} from "../../utils/CommandHelpers";

interface UserData {
  weight: number;
  sex: "male" | "female";
}

interface ConveyorControlProps {
  isConnected: boolean;
  onSendCommand: (data: Uint8Array) => Promise<void>;
  speed: number;
  onSpeedChange?: (speed: number) => void;
  time: number;
  distance: number;
  temperature: number;
  pressure: number;
  running: boolean;
  onStart: () => void;
  onStop: () => void;
  onDistanceUpdate?: (distance: number) => void;
  onUserDataSubmit?: (data: UserData) => void;
  onInclinationChange?: (inclination: number) => void;
};

const NumericKeypad: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const handleDigit = (digit: string) => {
    // Evita múltiplos pontos decimais e limita tamanho
    if (digit === "." && value.includes(".")) return;
    if (value.length >= 6) return;
    onChange(value + digit);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange("");
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        marginTop: "10px",
      }}
    >
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => (key === "⌫" ? handleBackspace() : handleDigit(key))}
          style={{
            padding: "18px 0",
            fontSize: "22px",
            fontWeight: "bold",
            borderRadius: "10px",
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            cursor: "pointer",
          }}
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={handleClear}
        style={{
          gridColumn: "1 / span 3",
          padding: "14px 0",
          fontSize: "16px",
          borderRadius: "10px",
          border: "none",
          background: "rgba(255,80,80,0.3)",
          color: "white",
          cursor: "pointer",
        }}
      >
        LIMPAR
      </button>
    </div>
  );
};

const ConveyorComp: React.FC<ConveyorControlProps> = ({
  isConnected,
  onSendCommand,
  speed,
  onSpeedChange,
  running,
  onStart,
  onStop,
  onDistanceUpdate,
  distance: traveledDistance,
  onUserDataSubmit,
  onInclinationChange,
}) => {
  const navigate = useNavigate();
  const [inclination, setInclination] = useState<number>(0);
  
  const [speedError, setSpeedError] = useState<string>("");
  const [inclinationError, setInclinationError] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  const [error, setError] = useState<string>("");
  const onDistanceUpdateRef = useRef(onDistanceUpdate);
  const [showUserDataModal, setShowUserDataModal] = useState(false);
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [userDataError, setUserDataError] = useState("");
  const distanceRef = useRef(traveledDistance);


  useEffect(() => {
    if (!isConnected) {
      if (onSpeedChange) onSpeedChange(0);
      setInclination(0);
      setSpeedError("");
      setInclinationError("");
    }
  }, [isConnected, onSpeedChange]);

  useEffect(() => {
      onDistanceUpdateRef.current = onDistanceUpdate;
    }, [onDistanceUpdate]);

  useEffect(() => {
    distanceRef.current = traveledDistance;
  }, [traveledDistance]);

   

  const handleSetSpeed = async (change: number) => {
    if (!isConnected) {
      console.log("[CONVEYOR_COMP] Not connected to a device");
      return;
    }
    const newSpeed = Math.max(0, Math.min(20, speed + change));
    try {
      if (onSpeedChange) onSpeedChange(newSpeed);
      const command = sendConveyorSpeed(newSpeed);
      await onSendCommand(command);
      setSpeedError("");
    } catch (error) {
      setSpeedError("Failed to send speed command");
      console.error(error);
    }
  };

  const handleConfirmUserData = () => {
    const parsedWeight = Number(weight);

    if (!parsedWeight || parsedWeight <= 0 || parsedWeight > 300) {
      setUserDataError("Informe um peso válido.");
      return;
    }

    if (!sex) {
      setUserDataError("Selecione o sexo.");
      return;
    }

    // Envia os dados para o Dashboard
    onUserDataSubmit?.({
    weight: parsedWeight,
    sex,
  });

    // Fecha o modal
    setShowUserDataModal(false);
    setUserDataError("");

    // Agora sim começa a contagem
    handleStartWithCountdown(onStart);
  };


  const handleSetInclination = async (change: number) => {
    if (!isConnected) {
      console.log("[CONVEYOR_COMP] Not connected to a device");
      return;
    }

    const newInclination = Math.max(0, Math.min(30, inclination + change));

    if (newInclination < 0 || newInclination > 30) {
      setInclinationError("Inclination must be between 0 and 30");
      return;
    }

    try {
      setInclination(newInclination);
      onInclinationChange?.(newInclination);
      const command = sendConveyorInclination(newInclination);
      await onSendCommand(command);
      
      setInclinationError("");
    } catch (error) {
      setInclinationError("Failed to send inclination command");
      console.error(error);
    }
  };
  const handleStartWithCountdown = (action: () => void) => {
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
    <div style={{ width: "100%", marginTop: '80px' }}>
      <div
        style={{ display: "flex", gap: "20px", justifyContent: "space-around" }}
      >
        <div style={{gap: "20px", justifyContent: "space-around"}}>
          <div style={{justifySelf: "center"}}>
            <div
              className="div-circle-vel"
              style={{ cursor: countdown ? "not-allowed" : "pointer" }}
              onClick={() => {
                if (!countdown) {
                  if (running) {
                    onStop();
                  } else {
                    setShowUserDataModal(true);
                  }
                }
              }}
            >
            <div className={running ? "btn-stop" : "btn-start"}>
              <p className="value-results" style={{ fontSize: "50px", fontWeight: "bold", lineHeight: "100%",  }}>
                {running ? "PARAR" : "INICIAR"}
              </p>
            </div>
          </div>
          </div>
          
            {showUserDataModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#1a1a2e",
        borderRadius: "20px",
        padding: "30px",
        width: "400px",
        maxWidth: "90%",
      }}
    >
      <h2 style={{ color: "white", marginBottom: "25px" }}>
        Dados do cliente
      </h2>

      <label style={{ color: "white" }}>
        Peso (kg)
      </label>

      <div
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "8px",
          marginBottom: "12px",
          borderRadius: "8px",
          background: "white",
          fontSize: "22px",
          fontWeight: "bold",
          textAlign: "center",
          minHeight: "28px",
          color: "black",
        }}
      >
        {weight || "0"}
      </div>

      <NumericKeypad value={weight} onChange={setWeight} />

      <label style={{ color: "white", marginTop: "20px", display: "block" }}>
        Sexo
      </label>

      <div style={{ display: "flex", gap: "10px", marginTop: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setSex("male")}
          style={{
            flex: 1,
            padding: "14px 0",
            borderRadius: "8px",
            border: sex === "male" ? "2px solid #00C9FF" : "2px solid transparent",
            background: sex === "male" ? "rgba(0,201,255,0.2)" : "rgba(255,255,255,0.1)",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          MASCULINO
        </button>
        <button
          type="button"
          onClick={() => setSex("female")}
          style={{
            flex: 1,
            padding: "14px 0",
            borderRadius: "8px",
            border: sex === "female" ? "2px solid #00C9FF" : "2px solid transparent",
            background: sex === "female" ? "rgba(0,201,255,0.2)" : "rgba(255,255,255,0.1)",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          FEMININO
        </button>
      </div>

      {userDataError && (
        <p style={{ color: "#ff5555" }}>
          {userDataError}
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            setShowUserDataModal(false);
            setUserDataError("");
          }}
          style={{
            flex: 1,
            padding: "14px 0",
            borderRadius: "8px",
            border: "2px solid transparent",
            background:  "rgba(43, 72, 231, 0.16)",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          CANCELAR
        </button>

        <button
          onClick={handleConfirmUserData}
          style={{
            flex: 1,
            padding: "14px 0",
            borderRadius: "8px",
            border: "2px solid transparent",
            background:  "rgba(43, 72, 231, 0.16)",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          CONTINUAR
        </button>
      </div>
    </div>
  </div>
)}

          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px",gap: "10px" }}>

            <div className="div-circle-vel">
              
              <div style={{ display: "flex"}}>
              <div >
                <div>
                  <p className="dash-subtitles">VELOCIDADE</p>
                    <span className="value-results" style={{ color: "#00C9FF" }}>
                      {" "}
                      {speed}{" "}
                    </span>{" "}
                    <span className="span-velocimeter" style={{ color: "#00C9FF" }}>
                      {" "}
                      km/h{" "}
                    </span>{" "}
                </div>
                <div
                  style={{
                    display: "flex",
                  }}
                  >
                  <button
                    className="arrow-button"
                    onClick={() => handleSetSpeed(-0.5)}
                    disabled={!isConnected || speed <= 0}
                  >
                    -
                  </button>
                  <button
                    className="arrow-button"
                    onClick={() => handleSetSpeed(0.5)}
                    disabled={!isConnected}
                  >
                    +
                  </button>
                </div>
              </div>
              
                <img
                  src={VelocidadeImg}
                  alt="Imagem de uma velocidade"
                  width={130}
                  height={130}
                />
              </div>
            {speedError && <div className="error-message">{speedError}</div>}
          </div>
            <div className="div-circle-vel">
              <div style={{ display: "flex"}}>
                <div>
                  <div>
                    <p className="dash-subtitles" >INCLINAÇÃO</p>
                    <span
                      className="value-results"
                      style={{ color: "#00C9FF" }}
                    >{`${inclination}º`}</span>
                    
                  </div>
                  <div
                    style={{
                      display: "flex",
        
                    }}
                  >
                    <button
                      className="arrow-button"
                      onClick={() => handleSetInclination(-1)}
                    >
                      -
                    </button>
                    <button
                      className="arrow-button"
                      onClick={() => handleSetInclination(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              <div className="inclination-img-div">
                <img src={InclinacaoImg} alt="Imagem de uma velocidade" />
              </div>
              {inclinationError && (
                <div className="error-message">{inclinationError}</div>
              )}
              </div>
            </div>
          </div>
          <div>
            
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
          
        </div>

        
        
      </div>

        
    </div>
  );
};

export default ConveyorComp;
