import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VelocidadeImg from "../../assets/images/Velocidade-1.png";
import InclinacaoImg from "../../assets/images/Distancia-1.png";
import "../../constants/GridDashboard.css";
import {
  setConveyorSpeed as sendConveyorSpeed,
  setConveyorInclination as sendConveyorInclination,
} from "../../utils/CommandHelpers";
import LedsComponent from "./LedsComponent";

interface ConveyorControlProps {
  isConnected: boolean;
  onSendCommand: (data: Uint8Array) => Promise<void>;
  speed: number;
  onSpeedChange?: (speed: number) => void;
  time: number;
  distance: number;
  temperature: number;
  pressure: number;
}

const ConveyorComp: React.FC<ConveyorControlProps> = ({
  isConnected,
  onSendCommand,
  speed,
  onSpeedChange,
}) => {
  const navigate = useNavigate();
  const [inclination, setInclination] = useState<number>(0);
  const [speedError, setSpeedError] = useState<string>("");
  const [inclinationError, setInclinationError] = useState<string>("");

  useEffect(() => {
    if (!isConnected) {
      if (onSpeedChange) onSpeedChange(0);
      setInclination(0);
      setSpeedError("");
      setInclinationError("");
    }
  }, [isConnected, onSpeedChange]);

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

  return (
    <div style={{ width: "100%", marginBottom: "20px" }}>
      <div
        style={{ display: "flex", gap: "20px", justifyContent: "space-around" }}
      >
        <div style={{ display: "flex", gap: "30px" }}>
          <div className="div-circle-vel">
            <img
              src={VelocidadeImg}
              alt="Imagem de uma velocidade"
              style={{ transform: "translateY(15px)" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "95%",
              }}
            >
              <button
                className="arrow-button"
                onClick={() => handleSetSpeed(-0.5)}
                disabled={!isConnected || speed <= 0}
              >
                ▼
              </button>
              <button
                className="arrow-button"
                onClick={() => handleSetSpeed(0.5)}
                disabled={!isConnected}
              >
                ▲
              </button>
            </div>
            <div className="value-div">
              {" "}
              <span className="value-results" style={{ color: "#00C9FF" }}>
                {" "}
                {speed}{" "}
              </span>{" "}
              <span className="span-velocimeter" style={{ color: "#00C9FF" }}>
                {" "}
                km/h{" "}
              </span>{" "}
              <p className="dash-subtitles">VELOCIDADE</p>{" "}
            </div>{" "}
            {speedError && <div className="error-message">{speedError}</div>}
          </div>
          <div className="div-circle-vel">
            <div className="inclination-img-div">
              <img src={InclinacaoImg} alt="Imagem de uma velocidade" />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "95%",
                height: "45px",
                marginTop: "20px",
              }}
            >
              <button
                className="arrow-button"
                onClick={() => handleSetInclination(-1)}
              >
                ▼
              </button>
              <button
                className="arrow-button"
                onClick={() => handleSetInclination(1)}
              >
                ▲
              </button>
            </div>
            <div className="value-div" style={{ marginBottom: "20px" }}>
              <span
                className="value-results"
                style={{ color: "#00C9FF" }}
              >{`${inclination}º`}</span>
              <p className="dash-subtitles">INCLINAÇÃO</p>
            </div>
            {inclinationError && (
              <div className="error-message">{inclinationError}</div>
            )}
          </div>
        </div>
        <LedsComponent
          isConnected={isConnected}
          onSendCommand={onSendCommand}
        />
      </div>
    </div>
  );
};

export default ConveyorComp;
