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
import ConveyorComp from "./ConveyorComp";

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

  onUserDataSubmit?: (data: UserData) => void;
  onInclinationChange?: (inclination: number) => void;
}

const ConveyorComponent: React.FC<ConveyorControlProps> = ({
  isConnected,
  onSendCommand,
  speed,
  onSpeedChange,
  time,
  distance,
  temperature,
  pressure,
  running,
  onStart,
  onStop,
  onUserDataSubmit,
  onInclinationChange,
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

      // Try to send a zero speed command to the device even when disconnecting
      // This is a safeguard to ensure the device stops if it's still on but app loses connection
      try {
        const command = sendConveyorSpeed(0);
        onSendCommand(command).catch(() => {
          // Ignore errors when trying to send command during disconnect
          console.log(
            "[CONVEYOR] Failed to send zero speed during disconnect - this is expected"
          );
        });
      } catch (error) {
        // Ignore errors when trying to create/send command during disconnect
        console.log(
          "[CONVEYOR] Could not create zero speed command during disconnect"
        );
      }
    }
  }, [isConnected, onSpeedChange, onSendCommand]);

  const handleStopConveyor = async () => {
    if (!isConnected) {
      // Just log instead of showing error
      console.log("[CONVEYOR] Not connected to a device");
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

      // Removido código que salvava dados de exercício
      // Isso agora é gerenciado pelo componente Dashboard
    } catch (error) {
      setSpeedError("Failed to stop conveyor");
      console.error(error);
    }
  };

  const handleSetSpeed = async (change: number) => {
    if (!isConnected) {
      // Just log instead of showing error
      console.log("[CONVEYOR] Not connected to a device");
      return;
    }
    const newSpeed = Math.max(0, Math.min(20, speed + change));
    try {
      if (onSpeedChange) onSpeedChange(newSpeed);
      const command = sendConveyorSpeed(newSpeed);
      await onSendCommand(command);
      setSpeedError("");

      // Removido código que salvava dados de exercício
      // Isso agora é gerenciado pelo componente Dashboard
    } catch (error) {
      setSpeedError("Failed to send speed command");
      console.error(error);
    }

    
  };



  return (
    <div>
      <ConveyorComp
        isConnected={isConnected}
        onSendCommand={onSendCommand}
        speed={speed}
        onSpeedChange={onSpeedChange}
        time={time}
        distance={distance}
        temperature={temperature}
        pressure={pressure}
        running={speed > 0}
        onStart={onStart}
        onStop={onStop}
        onUserDataSubmit={onUserDataSubmit}
        onInclinationChange={onInclinationChange}
      />
    </div>
  );
};

export default ConveyorComponent;
