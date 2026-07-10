import React, { useState, useEffect } from "react";
import {
  setConveyorSpeed as sendConveyorSpeed,
  setConveyorInclination as sendConveyorInclination,
} from "../utils/CommandHelpers";


interface ConveyorControlProps {
  isConnected: boolean;
  onSendCommand: (data: Uint8Array) => Promise<void>;
}

const ConveyorControl: React.FC<ConveyorControlProps> = ({
  isConnected,
  onSendCommand,
}) => {
  const [speed, setSpeed] = useState<number>(0);
  const [inclination, setInclination] = useState<number>(0);
  const [speedError, setSpeedError] = useState<string>("");
  const [inclinationError, setInclinationError] = useState<string>("");

  // Reset values when connection state changes
  useEffect(() => {
    if (!isConnected) {
      setSpeed(0);
      setInclination(0);
      setSpeedError("");
      setInclinationError("");
    }
  }, [isConnected]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSpeed(value);
    setSpeedError("");
  };

  const handleInclinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setInclination(value);
    setInclinationError("");
  };

  const handleSetSpeed = async () => {
    if (!isConnected) {
      setSpeedError("Not connected to a device");
      return;
    }

    if (speed < 0 || speed > 169) {
      setSpeedError("Speed must be between 0 and 169");
      return;
    }

    try {
      const command = sendConveyorSpeed(speed);
      await onSendCommand(command);
    } catch (error) {
      setSpeedError("Failed to send speed command");
      console.error(error);
    }
  };

  const handleSetInclination = async () => {
    if (!isConnected) {
      setInclinationError("Not connected to a device");
      return;
    }

    if (inclination < 0 || inclination > 30) {
      setInclinationError("Inclination must be between 0 and 30");
      return;
    }

    try {
      const command = sendConveyorInclination(inclination);
      await onSendCommand(command);
    } catch (error) {
      setInclinationError("Failed to send inclination command");
      console.error(error);
    }
  };

  return (
    <div className="control-panel">
              <h2>DrMove Belt Control</h2>
      
      <div className="control-group">
        <div className="slider-container">
          <label htmlFor="speed-slider">Speed (0-169):</label>
          <input
            id="speed-slider"
            type="range"
            min="0"
            max="169"
            value={speed}
            onChange={handleSpeedChange}
            disabled={!isConnected}
          />
          <div className="value-display">
            <input
              type="number"
              min="0"
              max="169"
              value={speed}
              onChange={handleSpeedChange}
              disabled={!isConnected}
            />
            <button onClick={handleSetSpeed} disabled={!isConnected}>
              Set Speed
            </button>
          </div>
          {speedError && <div className="error-message">{speedError}</div>}
        </div>

        <div className="slider-container">
          <label htmlFor="inclination-slider">Inclination (0-30):</label>
          <input
            id="inclination-slider"
            type="range"
            min="0"
            max="30"
            value={inclination}
            onChange={handleInclinationChange}
            disabled={!isConnected}
          />
          <div className="value-display">
            <input
              type="number"
              min="0"
              max="30"
              value={inclination}
              onChange={handleInclinationChange}
              disabled={!isConnected}
            />
            <button onClick={handleSetInclination} disabled={!isConnected}>
              Set Inclination
            </button>
          </div>
          {inclinationError && (
            <div className="error-message">{inclinationError}</div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ConveyorControl;
