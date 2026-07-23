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
}

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
}) => {
  const navigate = useNavigate();
  const [inclination, setInclination] = useState<number>(0);
  
  const [speedError, setSpeedError] = useState<string>("");
  const [inclinationError, setInclinationError] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  const [error, setError] = useState<string>("");
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const onDistanceUpdateRef = useRef(onDistanceUpdate);
  const distanceRef = useRef(traveledDistance);
  const CALORIES_PER_METER = 0.64;

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

  useEffect(() => {
    if (!isConnected) {
      setCaloriesBurned(0);
      return;
    }

    const updateCalories = () => {
      setCaloriesBurned(distanceRef.current * CALORIES_PER_METER);
    };

    updateCalories();

    const intervalId = window.setInterval(updateCalories, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isConnected]);
   
    const calculateDistanceIncrement = (deltaTimeMs: number, speedKmh: number) => {
      return (speedKmh / 3.6) * (deltaTimeMs / 1000);
    };

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



  const handleStopConveyor = async () => {
    if (!isConnected) {
      console.log("[CONVEYOR_COMP] Not connected to a device");
      return;
    }
    if (speed === 0) {
      return;
    }
    try {
      if (onSpeedChange) onSpeedChange(0);
      const command = sendConveyorSpeed(0);
      await onSendCommand(command);
      setSpeedError("");

      // Just store exercise data, let Dashboard handle navigation and shutdown
      const exerciseData = {
        duration: 300,
        distance: 500,
        temperature: 35,
        pressure: 50,
        maxSpeed: speed,
      };

      sessionStorage.setItem("exerciseData", JSON.stringify(exerciseData));
    } catch (error) {
      setSpeedError("Failed to stop conveyor");
      console.error(error);
    }
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
                    handleStartWithCountdown(onStart);
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
