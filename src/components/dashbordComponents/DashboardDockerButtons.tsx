import TemperaturaImg from "../../assets/images/Temperatura1.png";
import VacuoImg from "../../assets/images/Vacuo1.png";
import CronometroImg from "../../assets/images/Cronometro-1.png";
import CapsulaOffImg from "../../assets/images/capsulaoff.png";
import CapsulaTemp from "../../assets/images/capsulatemp.png";
import CapsulaImg from "../../assets/images/ChatGPT Image 15 de jul. de 2026, 14_15_53.png";
import { useNavigate } from "react-router-dom";
import "../../constants/Dashboard.css";
import React, { useState, useEffect, useRef } from "react";
import {
  setTemperature as sendTemperature,
  setPressure as sendPressure,
  requestTemperature,
  requestPressure,
  setOperationMode,
  setHeaterPower as sendHeaterPower,
  setPumpPower as sendPumpPower,
  setConveyorSpeed
} from "../../utils/CommandHelpers";

declare global {
  interface Window {
    speed?: number;
  }
}

interface EnvironmentControlProps {
  isConnected: boolean;
  onSendCommand: (data: Uint8Array) => Promise<void>;
  currentTemperature?: number;
  currentPressure?: number;
  time: number;
  speed?: number;
  onDistanceUpdate?: (distance: number) => void;
  onTemperatureChange?: (temperature: number) => void;
  onPressureChange?: (pressure: number) => void;
  onSpeedChange?: (speed: number) => void;
}

function DockerButtonComponent({
  isConnected,
  onSendCommand,
  currentTemperature,
  currentPressure,
  time,
  speed = 0,
  onDistanceUpdate,
  onTemperatureChange,
  onPressureChange,
  onSpeedChange,
}: EnvironmentControlProps) {
  const [temperatureSetpoint, setTemperatureSetpoint] = useState<number>(0);
  const [pressureSetpoint, setPressureSetpoint] = useState<number>(0);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false);
  const [heaterPower, setHeaterPower] = useState<number>(0);
  const [pumpPower, setPumpPower] = useState<number>(0);
  const [isColagenoOn, setIsColagenoOn] = useState(false);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const predefinedTimes = [0, 10, 20, 30, 45, 60, 90];
  const navigate = useNavigate();
  const [lastSpeed, setLastSpeed] = useState(0);
  const [lastTimeCalculated, setLastTimeCalculated] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState(1800);
  const lastTimeCalculatedRef = useRef(0);
  const lastSpeedRef = useRef(0);
  const hasStoppedRef = useRef(false);

  
 
  useEffect(() => {
  if (!isConnected || !isRunning) return;

  if (timerSeconds === 0 && !hasStoppedRef.current) {
    hasStoppedRef.current = true;
    const stopConveyor = async () => {
      try {
        await onSendCommand(setConveyorSpeed(0));
        onSpeedChange?.(0); // <-- Isso vai acionar o shutdown no Dashboard!
      } catch (error) {
        console.error("Erro ao desligar a esteira automaticamente:", error);
      }
    };
    stopConveyor();
    return;
  }

  if (timerSeconds > 0) {
    hasStoppedRef.current = false;
  }

  const interval = setInterval(() => {
    setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
  }, 1000);

  return () => clearInterval(interval);
}, [isConnected, isRunning, timerSeconds, onSendCommand, onSpeedChange]);


  useEffect(() => {
    if (!isConnected) {
  
      setDistance(0);
      setLastSpeed(0);
      setLastTimeCalculated(0);
    }
  }, [isConnected]);

  

  useEffect(() => {
    if (!isConnected) {
      setIsColagenoOn(false);
      setIsAutoMode(false);
      setHeaterPower(0);
      setPumpPower(0);
      setIsRunning(false);
      setError("");
      lastSpeedRef.current = 0;
    } else {
      // When connected, request current temperature and pressure data
      
      
      // When connected, explicitly set the device to manual mode
      

      
    }
  }, [isConnected, onSendCommand]);

  useEffect(() => {
    if (!isConnected) {
      lastSpeedRef.current = 0;
      return;
    }

    lastSpeedRef.current = speed;
  }, [isConnected, speed,]);

  useEffect(() => {
   
  if (isConnected && speed && speed > 0) {
    setIsRunning(true);
  } else {
    setIsRunning(false);
  }
}, [isConnected, speed]);

  useEffect(() => {
  if (!isRunning && speed === 0 && temperatureSetpoint > 0) {
    setTemperatureSetpoint(0);
    setHeaterPower(0);
    setPressureSetpoint(0);
    setPumpPower(0);
  }
}, [isRunning, speed]);


  const handleTimerChange = (delta: number) => {
  setTimerSeconds((prev) => {
    let next = prev + delta;
    // Limite mínimo: 10 minutos (600 segundos)
    if (next < 600) next = 600;
    // Limite máximo: 90 minutos (5400 segundos)
    if (next > 5400) next = 5400;
    return next;
  });
};

useEffect(() => {
    console.log("Temperatura atual:", currentTemperature);
}, [currentTemperature]);

useEffect(() => {
    console.log("Pressão atual:", currentPressure);
}, [currentPressure]);

  function formatTime(seconds: number) {
    
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  }

  const handleSetTemperature = async (change: number) => {
    if (!isConnected) {
      console.log("[DOCKER] Not connected to a device");
      return;
    }

    // Se está em 0 e aumenta, define para 25°C e 65%
    if (temperatureSetpoint === 0 && change > 0) {
      try {
        setTemperatureSetpoint(25);
        setHeaterPower(65);
        setError("");

        const tempCommand = sendTemperature(25);
        await onSendCommand(tempCommand);

        const powerCommand = sendHeaterPower(65);
        await onSendCommand(powerCommand);

        // Notificar o Dashboard sobre a mudança de temperatura
        if (onTemperatureChange) {
          onTemperatureChange(25);
        }

        return;
      } catch (error) {
        setError("Failed to set temperature");
        console.error(error);
        return;
      }
    }

    const increment = change > 0 ? 5 : -5;

    // Se está entre 1 e 5 e vai diminuir, confirma desligamento
    if (temperatureSetpoint > 0 && temperatureSetpoint <= 5 && change < 0) {
      try {
        setTemperatureSetpoint(0);
        setHeaterPower(0);
        setError("");

        const tempCommand = sendTemperature(0);
        await onSendCommand(tempCommand);

        const powerCommand = sendHeaterPower(0);
        await onSendCommand(powerCommand);

        // Notificar o Dashboard sobre a mudança de temperatura
        if (onTemperatureChange) {
          onTemperatureChange(0);
        }

        return;
      } catch (error) {
        setError("Failed to disable heating");
        console.error(error);
        return;
      }
    }

    // Se já está em 0 e clicar para diminuir, não faz nada
    if (temperatureSetpoint === 0 && change < 0) {
      return;
    }

    let newTemperature = Math.min(
      50,
      Math.max(0, temperatureSetpoint + increment)
    );
    newTemperature = Math.round(newTemperature / 5) * 5;
    if (newTemperature < 5 && newTemperature > 0) {
      newTemperature = 5;
    }

    try {
      setTemperatureSetpoint(newTemperature);
      setError("");

      if (newTemperature > 0) {
        const baseTemperature = 25;
        const basePower = 65;
        const temperatureDifference = newTemperature - baseTemperature;
        const powerIncrement = Math.floor(temperatureDifference / 5) * 5;
        const calculatedPower = Math.min(100, basePower + powerIncrement);

        setHeaterPower(calculatedPower);

        const tempCommand = sendTemperature(newTemperature);
        await onSendCommand(tempCommand);

        const powerCommand = sendHeaterPower(calculatedPower);
        await onSendCommand(powerCommand);

        // Notificar o Dashboard sobre a mudança de temperatura
        if (onTemperatureChange) {
          onTemperatureChange(newTemperature);
        }
      }
    } catch (error) {
      setError("Failed to set temperature");
      console.error(error);
    }
  };

  const handleSetPressure = async (change: number) => {
    if (!isConnected) {
      console.log("[DOCKER] Not connected to a device");
      return;
    }

    if (pressureSetpoint === 0 && change > 0) {
      try {
        setPressureSetpoint(5);
        setPumpPower(55);
        setError("");

        const pressureCommand = sendPressure(5);
        await onSendCommand(pressureCommand);

        const powerCommand = sendPumpPower(5);
        await onSendCommand(powerCommand);

        // Notificar o Dashboard sobre a mudança de pressão
        if (onPressureChange) {
          onPressureChange(5);
        }

        return;
      } catch (error) {
        setError("Failed to set pressure");
        console.error(error);
        return;
      }
    }

    const increment = change > 0 ? 5 : -5;

    if (pressureSetpoint > 0 && pressureSetpoint <= 5 && change < 0) {
      try {
        setPressureSetpoint(0);
        setPumpPower(0);
        setError("");

        const pressureCommand = sendPressure(0);
        await onSendCommand(pressureCommand);

        const powerCommand = sendPumpPower(0);
        await onSendCommand(powerCommand);

        // Notificar o Dashboard sobre a mudança de pressão
        if (onPressureChange) {
          onPressureChange(0);
        }

        return;
      } catch (error) {
        setError("Failed to disable vacuum");
        console.error(error);
        return;
      }
    }

    let newPressure = Math.min(80, Math.max(0, pressureSetpoint + increment));
    newPressure = Math.round(newPressure / 5) * 5;

    if (newPressure < 5 && newPressure > 0) {
      newPressure = 5;
    }

    try {
      setPressureSetpoint(newPressure);
      setError("");

      if (newPressure > 0) {
        const basePressure = 5;
        const basePower = 5;
        const pressureDifference = newPressure - basePressure;
        const powerIncrement = Math.floor(pressureDifference / 5) * 5;
        const calculatedPower = Math.min(80, basePower + powerIncrement);

        setPumpPower(calculatedPower);

        const pressureCommand = sendPressure(newPressure);
        await onSendCommand(pressureCommand);

        const powerCommand = sendPumpPower(calculatedPower);
        await onSendCommand(powerCommand);

        // Notificar o Dashboard sobre a mudança de pressão
        if (onPressureChange) {
          onPressureChange(newPressure);
        }
      }
    } catch (error) {
      setError("Failed to set pressure");
      console.error(error);
    }
  };

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



  return (
    <div className="container-docker">
      <div className="dash-results-div">
        <div className="temperature-button">
          <img src={TemperaturaImg} alt="Imagem Temperatura" />
        </div>
        <div className="vacuo-info">
          <div style={{ display: "flex", alignItems: "center" }}>
            {" "}
            <div className="quantifier-results" style={{ color: "#FF2424" }}>
              {" "}
              <span className="value-results">
                {" "}
                {temperatureSetpoint !== undefined
                  ? `${temperatureSetpoint.toFixed(1)}`
                  : "N/A"}{" "}
              </span>{" "}
              <span className="value-results">°C</span>{" "}
            </div>
            <div
              style={{
                display: "flex",
                
                marginLeft: "8px",
              }}
            >
              <button
                className="arrow-button"
                onClick={() => handleSetTemperature(1)}
                disabled={!isConnected}
                style={{
                  fontSize: "25px",
                  padding: "0px 4px",
                  minHeight: "18px",
                  fontWeight: "bold",
                }}
              >
                +
              </button>
              <button
                className="arrow-button"
                onClick={() => handleSetTemperature(-1)}
                disabled={!isConnected}
                style={{
                  fontSize: "25px",
                  padding: "0px 4px",
                  minHeight: "18px",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                -
              </button>
            </div>
          </div>
          <p className="dash-subtitles">AJUSTE DE TEMPERATURA</p>
        </div>
      </div>

      <div className="dash-results-div">
        <div className="temperature-button">
          <img src={TemperaturaImg} alt="Imagem Temperatura" />
        </div>
        <div className="vacuo-info">
          <div style={{ display: "flex", alignItems: "center" }}>
            
            <div className="quantifier-results" style={{ color: "#FF2424" }}>
              
              <span className="value-results">
                 {currentTemperature !== undefined
              ? `${currentTemperature.toFixed(1)}`
              : "N/A"}
              </span>
              <span className="value-results">°C</span>
            </div>
            

            
          </div>
          <p className="dash-subtitles">TEMPERATURA</p>
        </div>
        
        
      </div>

      <div className="dash-results-div">
        <div className="vacDis-background">
          <img src={CapsulaImg} alt="Imagem Temperatura" width="105" height="105" />
        </div>
        <div className="vacuo-info">
          <div style={{ display: "flex", alignItems: "center" }}>
            
            <div className="quantifier-results" style={{ color: "#f1f2ff" }}>
              
              <span className="value-results" style={{ color: "#5D91ED" }}>
                 {currentPressure !== undefined
              ? `${currentPressure.toFixed(1)}`
              : "N/A"}
              </span>
              <span className="mesuare-results" style={{ color: "#5D91ED" }}>hPa</span>
            </div>
            
          </div>
          <p className="dash-subtitles" >VÁCUO/POTÊNCIA</p>
        </div>
        
      </div>

      <div className="dash-results-div">
        <div className="vacDis-background">
          <img src={VacuoImg} alt="Vácuo" className="vacuo-img" />
        </div>
        <div className="vacuo-info">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="quantifier-results" style={{ color: "#5D91ED" }}>
              <span className="value-results">
                {pressureSetpoint !== undefined
                  ? `${Math.floor(pressureSetpoint)} `
                  : "N/A"}
              </span>
              <span className="mesuare-results">hPa</span>
            </div>
            <div
              style={{
                display: "flex",
                
                marginLeft: "8px",
              }}
            >
              <button
                className="arrow-button"
                onClick={() => handleSetPressure(1)} 
                disabled={!isConnected}
                style={{
                  fontSize: "25px",
                  padding: "0px 4px",
                  minHeight: "18px",
                  fontWeight: "bold",
                }}
              >
                +
              </button>
              <button
                className="arrow-button"
                onClick={() => handleSetPressure(-1)} 
                disabled={!isConnected}
                style={{
                  fontSize: "25px",
                  padding: "0px 4px",
                  minHeight: "18px",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                -
              </button>
            </div>
          </div>
          <p className="dash-subtitles">VÁCUO</p>
        </div>
      </div>
      <div className="dash-results-div">
        <div>
          <img src={CronometroImg} alt="Cronometro" className="vacuo-img" />
        </div>
        
        <div className="vacuo-info">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="quantifier-results">
              <span className="value-results" style={{ color: "#F28A01" }}>
                {formatTime(timerSeconds)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                
                marginLeft: "8px",
              }}
            >
              <button
                className="arrow-button"
                onClick={() => handleTimerChange(300)}
                disabled={!isConnected || isRunning}
                style={{
                  fontSize: "25px",
                  padding: "0px 4px",
                  minHeight: "18px",
                  fontWeight: "bold",
                }}
              >
                +
              </button>
              <button
                className="arrow-button"
                onClick={() => handleTimerChange(-300)}
                disabled={!isConnected || isRunning}
                style={{
                  fontSize: "25px",
                  padding: "0px 4px",
                  minHeight: "18px",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                -
              </button>
            </div>
          </div>
          
          <p className="dash-subtitles">TEMPO DE TREINO</p>
        </div>
      </div>
    </div>
  );
}

export default DockerButtonComponent;
