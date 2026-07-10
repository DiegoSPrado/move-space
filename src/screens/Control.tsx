import React, { useState, useEffect, useCallback } from "react";
import "../constants/App.css";
import SerialPortSelector from "../components/SerialPortSelector";
import ConveyorControl from "../components/ConveyorControl";
import EnvironmentControl from "../components/EnvironmentControl";
import PeripheralControl from "../components/PeripheralControl";
import { ConnectionStatus, SerialPortInfo } from "../types";
import { parseResponse } from "../utils/CommandHelpers";
import { Link } from "react-router-dom";

function Control() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
  });
  const [temperature, setTemperature] = useState<number | undefined>(undefined);
  const [pressure, setPressure] = useState<number | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // Handle received data from serial port
  const handleSerialData = useCallback((data: string) => {
    // For backward compatibility, if data is a string but we expect Uint8Array
    let dataArray: Uint8Array;
    if (typeof data === "string") {
      // Convert string to Uint8Array
      dataArray = new TextEncoder().encode(data);
    } else {
      dataArray = data as unknown as Uint8Array;
    }

    // Add raw data to logs
    const hexString = Array.from(dataArray)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(" ");

    addLog(`Received: ${hexString}`);

    // Parse the response
    const parsedData = parseResponse(dataArray);
    if (parsedData) {
      switch (parsedData.type) {
        case "temperature":
          setTemperature(parsedData.value);
          addLog(`Temperature: ${parsedData.value.toFixed(1)} °C`);
          break;
        case "pressure":
          setPressure(parsedData.value);
          addLog(`Pressure: ${parsedData.value.toFixed(1)} hPa`);
          break;
        case "speed":
          addLog(`Conveyor Speed: ${parsedData.value}`);
          break;
        case "inclination":
          addLog(`Conveyor Inclination: ${parsedData.value}`);
          break;
      }
    }
  }, []);

  // Setup serial data listener
  useEffect(() => {
    if (connectionStatus.connected && window.api) {
      // Register listener for serial data
      window.api.onSerialData(handleSerialData);

      // Register listener for serial errors
      window.api.onSerialError((errorMsg) => {
        setError(`Serial error: ${errorMsg}`);
      });

      return () => {
        // Remove listeners when component unmounts or connection changes
        if (window.api) {
          window.api.removeSerialListeners();
        }
      };
    }
  }, [connectionStatus.connected, handleSerialData]);

  // Send command to device
  const sendCommand = async (data: Uint8Array) => {
    if (!connectionStatus.connected || !window.api) {
      setError("Not connected to a device");
      return;
    }

    try {
      // Log the command being sent
      const hexString = Array.from(data)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");

      addLog(`Sending: ${hexString}`);

      // Send the command
      const result = await window.api.sendSerialCommand(data);

      if (!result.success) {
        setError(`Failed to send command: ${result.message}`);
      }
    } catch (err: any) {
      setError(`Error sending command: ${err.message || err}`);
      console.error(err);
    }
  };

  // Add a log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`].slice(-100)); // Keep last 100 logs
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DrMove Control System</h1>
      </header>
      <Link to={"/"}>Dashboard</Link>
      <main className="App-main">
        <div className="connection-panel">
          <Link to={"/config"}>confi</Link>
          <SerialPortSelector onConnectionStatusChange={setConnectionStatus} />
        </div>

        <div
          className="control-panels"
          style={{ opacity: connectionStatus.connected ? 1 : 0.5 }}
        >
          <ConveyorControl
            isConnected={connectionStatus.connected}
            onSendCommand={sendCommand}
          />

          <EnvironmentControl
            isConnected={connectionStatus.connected}
            onSendCommand={sendCommand}
            currentTemperature={temperature}
            currentPressure={pressure}
          />

          <PeripheralControl
            isConnected={connectionStatus.connected}
            onSendCommand={sendCommand}
          />
        </div>

        <div className="logs-panel">
          <div className="logs-header">
            <h3>Communication Logs</h3>
            <button onClick={clearLogs}>Clear</button>
          </div>
          <div className="logs-content">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>
      </main>

      {error && (
        <div className="global-error">
          <span>{error}</span>
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      <footer className="App-footer">
        <p>DrMove Control System v1.0</p>
      </footer>
    </div>
  );
}

export default Control;
