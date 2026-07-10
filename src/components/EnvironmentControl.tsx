import React, { useState, useEffect } from "react";
import {
  setTemperature as sendTemperature,
  setPressure as sendPressure,
  requestTemperature,
  requestPressure,
  setOperationMode,
  setHeaterPower as sendHeaterPower,
  setPumpPower as sendPumpPower,
} from "../utils/CommandHelpers";
import { OperationMode } from "../types";

interface EnvironmentControlProps {
  isConnected: boolean;
  onSendCommand: (data: Uint8Array) => Promise<void>;
  currentTemperature?: number;
  currentPressure?: number;
}

const EnvironmentControl: React.FC<EnvironmentControlProps> = ({
  isConnected,
  onSendCommand,
  currentTemperature,
  currentPressure,
}) => {
  const [temperatureSetpoint, setTemperatureSetpoint] = useState<number>(25);
  const [pressureSetpoint, setPressureSetpoint] = useState<number>(1013.2);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
  const [heaterPower, setHeaterPower] = useState<number>(0);
  const [pumpPower, setPumpPower] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Reset values when connection state changes
  useEffect(() => {
    if (!isConnected) {
      setTemperatureSetpoint(25);
      setPressureSetpoint(1013.2);
      setIsAutoMode(true);
      setHeaterPower(0);
      setPumpPower(0);
      setError("");
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

  const handleSetTemperature = async () => {
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
  };

  const handleSetPressure = async () => {
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

  const handleSetHeaterPower = async () => {
    if (!isConnected) {
      setError("Not connected to a device");
      return;
    }

    if (isAutoMode) {
      setError("Cannot set heater power in AUTO mode");
      return;
    }

    try {
      setError("");
      const command = sendHeaterPower(heaterPower);
      await onSendCommand(command);
    } catch (error) {
      setError("Failed to set heater power");
      console.error(error);
    }
  };

  const handleSetPumpPower = async () => {
    if (!isConnected) {
      setError("Not connected to a device");
      return;
    }

    if (isAutoMode) {
      setError("Cannot set pump power in AUTO mode");
      return;
    }

    try {
      setError("");
      const command = sendPumpPower(pumpPower);
      await onSendCommand(command);
    } catch (error) {
      setError("Failed to set pump power");
      console.error(error);
    }
  };

  return (
    <div className="control-panel environment-control">
      <h2>Environment Control</h2>

      <div className="status-display">
        <div className="status-item">
          <span>Current Temperature:</span>
          <span className="reading">
            {currentTemperature !== undefined
              ? `${currentTemperature.toFixed(1)} °C`
              : "N/A"}
          </span>
        </div>
        <div className="status-item">
          <span>Current Pressure:</span>
          <span className="reading">
            {currentPressure !== undefined
              ? `${currentPressure.toFixed(1)} hPa`
              : "N/A"}
          </span>
        </div>
        <button
          onClick={handleRequestData}
          disabled={!isConnected}
          className="refresh-button"
        >
          Refresh Data
        </button>
      </div>

      <div className="mode-switch">
        <span>Operation Mode:</span>
        <button
          onClick={handleToggleMode}
          disabled={!isConnected}
          className={`mode-button ${isAutoMode ? "auto" : "manual"}`}
        >
          {isAutoMode ? "AUTO" : "MANUAL"}
        </button>
      </div>

      <div className="control-group">
        <div className="input-group">
          <label htmlFor="temperature-input">Temperature Setpoint (°C):</label>
          <input
            id="temperature-input"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={temperatureSetpoint}
            onChange={(e) => setTemperatureSetpoint(parseFloat(e.target.value))}
            disabled={!isConnected}
          />
          <button onClick={handleSetTemperature} disabled={!isConnected}>
            Set Temperature
          </button>
        </div>

        <div className="input-group">
          <label htmlFor="pressure-input">Pressure Setpoint (hPa):</label>
          <input
            id="pressure-input"
            type="number"
            min="0"
            max="2000"
            step="0.1"
            value={pressureSetpoint}
            onChange={(e) => setPressureSetpoint(parseFloat(e.target.value))}
            disabled={!isConnected}
          />
          <button onClick={handleSetPressure} disabled={!isConnected}>
            Set Pressure
          </button>
        </div>
      </div>

      <div
        className="manual-controls"
        style={{ opacity: isAutoMode ? 0.5 : 1 }}
      >
        <h3>Manual Controls</h3>

        <div className="slider-container">
          <label htmlFor="heater-power-slider">Heater Power (0-100%):</label>
          <input
            id="heater-power-slider"
            type="range"
            min="0"
            max="100"
            value={heaterPower}
            onChange={(e) => setHeaterPower(parseInt(e.target.value, 10))}
            disabled={!isConnected || isAutoMode}
          />
          <div className="value-display">
            <input
              type="number"
              min="0"
              max="100"
              value={heaterPower}
              onChange={(e) => setHeaterPower(parseInt(e.target.value, 10))}
              disabled={!isConnected || isAutoMode}
            />
            <button
              onClick={handleSetHeaterPower}
              disabled={!isConnected || isAutoMode}
            >
              Set Heater Power
            </button>
          </div>
        </div>

        <div className="slider-container">
          <label htmlFor="pump-power-slider">Vacuum Pump Power (0-100%):</label>
          <input
            id="pump-power-slider"
            type="range"
            min="0"
            max="100"
            value={pumpPower}
            onChange={(e) => setPumpPower(parseInt(e.target.value, 10))}
            disabled={!isConnected || isAutoMode}
          />
          <div className="value-display">
            <input
              type="number"
              min="0"
              max="100"
              value={pumpPower}
              onChange={(e) => setPumpPower(parseInt(e.target.value, 10))}
              disabled={!isConnected || isAutoMode}
            />
            <button
              onClick={handleSetPumpPower}
              disabled={!isConnected || isAutoMode}
            >
              Set Pump Power
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default EnvironmentControl;
