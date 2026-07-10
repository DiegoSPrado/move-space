import React, { useState, useEffect } from "react";
import { SerialPortInfo, ConnectionStatus } from "../types";
import { Link } from "react-router-dom";

interface SerialPortSelectorProps {
  onConnectionStatusChange: (status: ConnectionStatus) => void;
}

const SerialPortSelector: React.FC<SerialPortSelectorProps> = ({
  onConnectionStatusChange,
}) => {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const baudRates = [9600, 19200, 38400, 57600, 115200];

  // Carregar porta padrão do localStorage
  useEffect(() => {
    const savedPort = localStorage.getItem("defaultSerialPort");
    const savedBaudRate = localStorage.getItem("defaultBaudRate");

    if (savedPort) {
      setSelectedPort(savedPort);
    }
    if (savedBaudRate) {
      setBaudRate(Number(savedBaudRate));
    }
  }, []);

  // Salvar porta padrão no localStorage
  const saveAsDefault = () => {
    if (selectedPort) {
      localStorage.setItem("defaultSerialPort", selectedPort);
      localStorage.setItem("defaultBaudRate", baudRate.toString());
      setError("Porta padrão salva com sucesso!");
      setTimeout(() => setError(""), 3000);
    }
  };

  const loadPorts = async () => {
    try {
      setIsLoading(true);
      if (window.api) {
        const availablePorts = await window.api.listSerialPorts();
        setPorts(availablePorts);

        // Se não tiver porta selecionada e tiver portas disponíveis
        if (availablePorts.length > 0 && !selectedPort) {
          const savedPort = localStorage.getItem("defaultSerialPort");
          const portExists = availablePorts.find((p) => p.path === savedPort);

          if (portExists) {
            setSelectedPort(savedPort!);
          } else {
            setSelectedPort(availablePorts[0].path);
          }
        }
      } else {
        setError("API Electron não disponível");
      }
    } catch (err) {
      setError("Falha ao carregar portas seriais");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Adiciona portas virtuais COM0COM manualmente
  const addVirtualPorts = () => {
    const virtualPorts = [
      { path: "COM30", manufacturer: "COM0COM (Virtual)" },
      { path: "COM31", manufacturer: "COM0COM (Virtual)" },
    ];

    setPorts((prevPorts) => {
      const existingPaths = prevPorts.map((port) => port.path);
      const newVirtualPorts = virtualPorts.filter(
        (vp) => !existingPaths.includes(vp.path)
      );

      if (newVirtualPorts.length === 0) {
        setError("Portas virtuais já estão na lista");
        return prevPorts;
      }

      const updatedPorts = [...prevPorts, ...newVirtualPorts];

      if (!selectedPort) {
        setSelectedPort("COM30");
      }

      setError("");
      return updatedPorts;
    });
  };

  // Removido o auto refresh - carrega somente uma vez
  useEffect(() => {
    loadPorts();
  }, []);

  useEffect(() => {
    onConnectionStatusChange({
      connected: isConnected,
      portPath: selectedPort,
      baudRate,
      error,
    });
  }, [isConnected, selectedPort, baudRate, error]);

  const handleConnect = async () => {
    if (!selectedPort) {
      setError("Por favor, selecione uma porta");
      return;
    }

    if (!window.api) {
      setError("API Electron não disponível");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await window.api.openSerialPort({
        path: selectedPort,
        baudRate,
      });

      if (result.success) {
        setIsConnected(true);
        // Salva automaticamente como porta padrão quando conecta
        localStorage.setItem("defaultSerialPort", selectedPort);
        localStorage.setItem("defaultBaudRate", baudRate.toString());
      } else {
        setError(`Falha ao conectar: ${result.message}`);
      }
    } catch (err: any) {
      setError(`Erro de conexão: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.api) {
      setError("API Electron não disponível");
      return;
    }

    try {
      setIsLoading(true);
      const result = await window.api.closeSerialPort();

      if (result.success) {
        setIsConnected(false);
      } else {
        setError(`Falha ao desconectar: ${result.message}`);
      }
    } catch (err: any) {
      setError(`Erro de desconexão: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="serial-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="serial-modal-content">
        <div className="serial-modal-header">
          <button
            className="modal-close-btn"
            onClick={() => {
              // Se chamado pelo botão do header, fecha apenas o modal manual
              // Se não há conexão, o modal permanecerá aberto automaticamente
              const event = new CustomEvent("closeSerialModal");
              window.dispatchEvent(event);
            }}
            title="Fechar modal"
          >
            ×
          </button>
          <h2>Conexão da Porta Serial</h2>
          <p className="modal-subtitle">
            Configure a comunicação com a esteira
          </p>
        </div>

        <div className="serial-form-container">
          <div className="form-group">
            <label htmlFor="port-select">Porta:</label>
            <div className="input-row">
              <select
                id="port-select"
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                disabled={isConnected || isLoading}
                className="port-select"
              >
                <option value="">Selecionar porta</option>
                {ports.map((port) => (
                  <option key={port.path} value={port.path}>
                    {port.path}{" "}
                    {port.manufacturer ? `(${port.manufacturer})` : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={loadPorts}
                disabled={isConnected || isLoading}
                className="refresh-btn"
                title="Atualizar lista de portas"
              >
                Atualizar
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="baud-select">Taxa de Transmissão:</label>
            <select
              id="baud-select"
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
              disabled={isConnected || isLoading}
              className="baud-select"
            >
              {baudRates.map((rate) => (
                <option key={rate} value={rate}>
                  {rate} bps
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button
              onClick={addVirtualPorts}
              disabled={isConnected || isLoading}
              className="virtual-ports-btn"
              title="Adicionar portas virtuais COM0COM"
            >
              Portas Virtuais
            </button>

            <button
              onClick={saveAsDefault}
              disabled={!selectedPort || isLoading}
              className="save-default-btn"
              title="Salvar como porta padrão"
            >
              Salvar Padrão
            </button>
          </div>

          <div className="connection-actions">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={!selectedPort || isLoading}
                className="connect-button"
              >
                {isLoading ? "Conectando..." : "Conectar"}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="disconnect-button"
              >
                {isLoading ? "Desconectando..." : "Desconectar"}
              </button>
            )}
          </div>

          {error && (
            <div
              className={`status-message ${
                error.includes("sucesso") ? "success" : "error"
              }`}
            >
              {error}
            </div>
          )}

          {isConnected && (
            <div className="status-message success">
              Conectado à {selectedPort} - {baudRate} bps
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Link to={"/control"} className="control-link">
            Página de Controle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SerialPortSelector;
