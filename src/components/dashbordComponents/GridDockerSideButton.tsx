import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  setTemperature as sendTemperature,
  setPressure as sendPressure,
  requestTemperature,
  requestPressure,
  setOperationMode,
  setNeonState,
  setHeaterPower as sendHeaterPower,
  setPumpPower as sendPumpPower,
} from "../../utils/CommandHelpers";

import ColagenoImg from "../../assets/images/Colageno2-1.png";
import { setLampState } from "../../utils/SerialCommunication";

import NeonImg from "../../assets/images/neonimg.png";
import CapsulaColageno from "../../assets/images/capsulaneon.png";
import CapsulaOff from "../../assets/images/capsulaoff.png";


interface GridDockerSideButtonProps {
  isConnected: boolean;
  onSendCommand: (command: Uint8Array) => Promise<void>;
  speed?: number;
  isRunning: boolean;
  onDistanceUpdate?: (distance: number) => void;
  currentTemperature?: number;
  currentPressure?: number;
}

export default function GridDockerSideButton({
  isConnected,
  onSendCommand,
  speed = 0,
  isRunning,
  onDistanceUpdate,
  currentTemperature,
  currentPressure,
}: GridDockerSideButtonProps) {
  const [isColagenoOn, setIsColagenoOn] = useState(false);
  const [distance, setDistance] = useState(0);
  const [temperatureSetpoint, setTemperatureSetpoint] = useState<number>(25);
  const [pressureSetpoint, setPressureSetpoint] = useState<number>(1013.2);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
  const [heaterPower, setHeaterPower] = useState<number>(0);
  const [pumpPower, setPumpPower] = useState<number>(0);
  const [error, setError] = useState("");
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [neonOn, setNeonOn] = useState<boolean>(false);


 

  useEffect(() => {
    if (!isConnected) {
      setTemperatureSetpoint(25);
      setPressureSetpoint(1013.2);
      setIsAutoMode(true);
      setHeaterPower(0);
      setNeonOn(true);
      setDistance(0);
      setIsColagenoOn(false);
      
    }
  }, [isConnected]);

  const handleRequestData = async () => {
      if (!isConnected) {
        setError("Not connected to a device");
        return;
      }
  
      try {
        setError("");
        // Request current temperature and pressure readings
        await onSendCommand(requestTemperature());
        await onSendCommand(requestPressure());
      } catch (error) {
        setError("Failed to request data");
        console.error(error);
      }
    };
  
    const handleSetTemperature = useCallback(async () => {
      if (!isConnected) {
        setError("Not connected to a device");
        return;
      }
  
      try {
        setError("");
        const command = sendTemperature(temperatureSetpoint);
        await onSendCommand(command);
      } catch (error) {
        setError("Failed to set temperature");
        console.error(error);
      }
    }, [isConnected, onSendCommand, temperatureSetpoint]);
  
    const handleSetPressure = useCallback(async () => {
      if (!isConnected) {
        setError("Not connected to a device");
        return;
      }
  
      try {
        setError("");
        const command = sendPressure(pressureSetpoint);
        await onSendCommand(command);
      } catch (error) {
        setError("Failed to set pressure");
        console.error(error);
      }
    }, [isConnected, onSendCommand, pressureSetpoint]);
  
    useEffect(() => {
      if (!isConnected || !isRunning) {
        return;
      }
  
      let intervalId: number | null = null;
      const sendUpdates = async () => {
        try {
          await handleSetTemperature();
          await handleSetPressure();
        } catch (error) {
          console.error("Failed to send temperature or pressure on interval", error);
        }
      };
  
      void sendUpdates();
      intervalId = window.setInterval(sendUpdates, 10000);
  
      return () => {
        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }
      };
    }, [isConnected, isRunning, handleSetPressure, handleSetTemperature]);
  
    const handleToggleMode = async () => {
      if (!isConnected) {
        setError("Not connected to a device");
        return;
      }
  
      try {
        setError("");
        const newMode = !isAutoMode;
        const command = setOperationMode(newMode);
        await onSendCommand(command);
        setIsAutoMode(newMode);
      } catch (error) {
        setError("Failed to toggle operation mode");
        console.error(error);
      }
    };

    const handleNeonToggle = async () => {
          if (!isConnected) {
            setError("Not connected to a device");
            return;
          }
      
          try {
            setError("");
            const newState = !neonOn;
            const command = setNeonState(newState);
            await onSendCommand(command);
            setNeonOn(newState);
          } catch (error) {
            setError("Failed to toggle neon");
            console.error(error);
          }
        };

  const confirmColagenoToggle = async () => {
    if (!isConnected) {
      console.log("[DOCKER] Not connected to a device");
      setShowSafetyWarning(false);
      return;
    }

    try {
      setError("");
      const newState = !isColagenoOn;
      const command = setLampState(newState);
      await onSendCommand(command);
      setIsColagenoOn(newState);
    } catch (toggleError) {
      setError("Failed to toggle colageno lamp");
      console.error(toggleError);
    } finally {
      setShowSafetyWarning(false);
    }
  };

  const handleColagenoToggle = () => {
    if (!isConnected) {
      console.log("[DOCKER] Not connected to a device");
      return;
    }

    if (!isColagenoOn) {
      setShowSafetyWarning(true);
      return;
    }

    confirmColagenoToggle();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingRight: '20px', marginLeft: '40px'}}>

      <div className="dash-results-div">
        
        <div className="vacuo-info">
          <div style={{marginBottom: "10px"}}>
            <span className="dash-subtitles">COLÁGENO/LUZ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="temperature-button">
              <img src={ColagenoImg} alt="Colágeno" className="vacuo-img" width={78} height={78} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="toggle-switch">
                <input
                  id="colageno-switch"
                  type="checkbox"
                  checked={isColagenoOn}
                  onChange={handleColagenoToggle}
                  disabled={!isConnected}
                />
                <label htmlFor="colageno-switch" />
              </div>
              <p className="dash-subtitles">{isColagenoOn ? "LIGADO" : "DESLIGADO"}</p>
            </div>
          </div>
          
          
          {error && <p className="vacuo-label" style={{ color: "#ff4d4f" }}>{error}</p>}
        </div>
      </div>
      
      {showSafetyWarning && (
        <div>
            <div className="safety-warning" >
              <p className="dash-subtitles">
                Certifique-se de utilizar o óculos de segurança antes de ligar essa luz
              </p>
              <button
                type="button"
                onClick={confirmColagenoToggle}
                style={{
                  marginTop: 10,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#0057d9",
                  color: "white",
                  cursor: "pointer",
                  width: "200px",
                  height: "100px"
                }}
              >
                OK  
              </button>
            </div>
          </div>
          )}

      <div className="dash-results-div">
        
        <div className="vacuo-info">
          <div style={{marginBottom: "10px"}}>
            <span className="dash-subtitles">LUZ NEON</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="neonDis-background">
              <img src={NeonImg} alt="Neon" className="vacuo-img" width={98} height={88} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="toggle-switch">
                <input
                  id="neon-switch"
                  type="checkbox"
                  checked={neonOn}
                  onChange={handleNeonToggle}
                  disabled={!isConnected}
                />
                <label htmlFor="neon-switch" />
              </div>
              <p className="dash-subtitles">{neonOn ? "LIGADO" : "DESLIGADO"}</p>
            </div>
          </div>
          
          
          {error && <p className="vacuo-label" style={{ color: "#ff4d4f" }}>{error}</p>}
        </div>
      </div>



    </div>
  );
}
