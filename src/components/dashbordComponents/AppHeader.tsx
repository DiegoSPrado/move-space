import Logo from "../../assets/images/Logo.png";
import Avatar from "../../assets/images/headerimages/Avatar.png";
import SettingsIcon from "../../assets/images/headerimages/settings.png";
import VolumeIcon from "../../assets/images/headerimages/volume-on.png";
import WifiICon from "../../assets/images/headerimages/Wifi.png";
import BluetoothIcon from "../../assets/images/headerimages/bluetooth.png";
import React, { useEffect, useState, useCallback } from "react";
import SerialPortSelector from "../../components/SerialPortSelector";
import { ConnectionStatus } from "../../types";
import { data, Link } from "react-router-dom";
import { parseResponse } from "../../utils/SerialCommunication";
import "../../constants/Dashboard.css";

type AppHeaderProps = {
  onClose: () => void;
};

function AppHeader({ onClose }: AppHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    portPath: "",
    baudRate: 0,
    error: "",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-us", {
    month: "short",
    day: "2-digit",
    weekday: "short",
  });
  const formattedTime = currentTime.toLocaleTimeString("pt-br", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="App-Header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div>
          <img src={Avatar} alt="User Pfp" />
        </div>
        <div>
          <p className="user-name">Maria dos Santos</p>
          <Link to={"/"}>
            <p className="logout-header">logout</p>
          </Link>
        </div>
      </div>
      <div className="btns-header-div">
        <button className="btn-anamnese"></button>
        <p>ANAMNESE</p>
      </div>
      <div className="btns-header-div">
        <button className="btn-cadastro"></button>
        <p>CADASTRO</p>
      </div>
      {connectionStatus.connected && (
        <div>
          connected at port: {connectionStatus.portPath} -{" "}
          {connectionStatus.baudRate}
        </div>
      )}
      <img src={Logo} alt="Logo DrMove" style={{ margin: "auto" }} />
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <img src={VolumeIcon} alt="Icone do volume" />
        <div style={{ cursor: "pointer" }} onClick={onClose}>
          <img src={SettingsIcon} alt="Icone das confugurações" />
        </div>
        <img src={WifiICon} alt="Icone do Wifi" />
        <div style={{ display: "flex", gap: "5px" }}>
          <p>{formattedTime}</p>
          <p>{formattedDate}</p>
        </div>

        <img src={BluetoothIcon} alt="Bluetooth" />
      </div>
    </div>
  );
}

export default AppHeader;
