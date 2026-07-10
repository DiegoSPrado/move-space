import { useCallback, useEffect, useState } from "react";
import SerialPortSelector from "../components/SerialPortSelector";
import { ConnectionStatus } from "../types";
import { data, Link } from "react-router-dom";
import { parseResponse } from "../utils/SerialCommunication";

function Configuration() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
  });
  const [pressure, setPressure] = useState<number | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [temperature, setTemperature] = useState<number | undefined>(undefined);

  const handleSerialData = useCallback((data: string) => {
    // For backward compatibility, if data is a string but we expect Uint8Array
    let dataArray: Uint8Array;
    if (typeof data === "string") {
      // Convert string to Uint8Array
      dataArray = new TextEncoder().encode(data);
    } else {
      dataArray = data as unknown as Uint8Array;
    }

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
      window.api.onSerialData(handleSerialData);

      // Register listener for serial errors
      window.api.onSerialError((errorMsg) => {
        setError(`Serial error: ${errorMsg}`);
      });

      return () => {
        if (window.api) {
          window.api.removeSerialListeners();
        }
      };
    }
  }, [connectionStatus.connected, handleSerialData]);

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
    <div>
      <div>
        <Link to={"/control"}>Control Page</Link>
      </div>
    </div>
  );
}

export default Configuration;
