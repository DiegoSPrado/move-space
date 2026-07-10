import React, { useState, useEffect } from "react";
import {
  setLampState,
  setNeonState,
  setLedState,
  setLedColors as sendLedColors,
  activateAromatizer,
} from "../utils/CommandHelpers";
import { LedColors } from "../types";

interface PeripheralControlProps {
  isConnected: boolean;
  onSendCommand: (data: Uint8Array) => Promise<void>;
}

const PeripheralControl: React.FC<PeripheralControlProps> = ({
  isConnected,
  onSendCommand,
}) => {
  const [lampOn, setLampOn] = useState<boolean>(false);
  const [neonOn, setNeonOn] = useState<boolean>(false);
  const [ledsOn, setLedsOn] = useState<boolean>(false);
  const [ledColors, setLedColors] = useState<LedColors>({
    external: { r: 255, g: 0, b: 0 },
    internal: { r: 0, g: 0, b: 255 },
  });
  const [error, setError] = useState<string>("");

  // Reset values when connection state changes
  useEffect(() => {
    if (!isConnected) {
      setLampOn(false);
      setNeonOn(false);
      setLedsOn(false);
      setError("");
    }
  }, [isConnected]);

  const handleLampToggle = async () => {
    if (!isConnected) {
      setError("Not connected to a device");
      return;
    }

    try {
      setError("");
      const newState = !lampOn;
      const command = setLampState(newState);
      await onSendCommand(command);
      setLampOn(newState);
    } catch (error) {
      setError("Failed to toggle lamp");
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

  const handleLedsToggle = async () => {
    if (!isConnected) {
      setError("Not connected to a device");
      return;
    }

    try {
      setError("");
      const newState = !ledsOn;
      const command = setLedState(newState);
      await onSendCommand(command);
      setLedsOn(newState);
    } catch (error) {
      setError("Failed to toggle LEDs");
      console.error(error);
    }
  };

  const handleActivateAromatizer = async () => {
    if (!isConnected) {
      setError("Not connected to a device");
      return;
    }

    try {
      setError("");
      const command = activateAromatizer();
      await onSendCommand(command);
    } catch (error) {
      setError("Failed to activate aromatizer");
      console.error(error);
    }
  };

  const handleLedColorChange = async () => {
    if (!isConnected) {
      setError("Not connected to a device");
      return;
    }

    try {
      setError("");
      const { external, internal } = ledColors;
      const command = sendLedColors(
        external.r,
        external.g,
        external.b,
        internal.r,
        internal.g,
        internal.b
      );
      await onSendCommand(command);
    } catch (error) {
      setError("Failed to set LED colors");
      console.error(error);
    }
  };

  const handleColorInput = (
    position: "external" | "internal",
    channel: "r" | "g" | "b",
    value: number
  ) => {
    const validValue = Math.max(0, Math.min(255, value));
    setLedColors((prev) => ({
      ...prev,
      [position]: {
        ...prev[position],
        [channel]: validValue,
      },
    }));
  };

  return (
    <div className="control-panel peripheral-control">
      <h2>Peripheral Devices</h2>

      <div className="control-grid">
        <div className="device-control">
          <span>Lamp:</span>
          <button
            onClick={handleLampToggle}
            disabled={!isConnected}
            className={`toggle-button ${lampOn ? "on" : "off"}`}
          >
            {lampOn ? "ON" : "OFF"}
          </button>
        </div>

        <div className="device-control">
          <span>Neon Light:</span>
          <button
            onClick={handleNeonToggle}
            disabled={!isConnected}
            className={`toggle-button ${neonOn ? "on" : "off"}`}
          >
            {neonOn ? "ON" : "OFF"}
          </button>
        </div>

        <div className="device-control">
          <span>LEDs:</span>
          <button
            onClick={handleLedsToggle}
            disabled={!isConnected}
            className={`toggle-button ${ledsOn ? "on" : "off"}`}
          >
            {ledsOn ? "ON" : "OFF"}
          </button>
        </div>

        <div className="device-control">
          <span>Aromatizer:</span>
          <button
            onClick={handleActivateAromatizer}
            disabled={!isConnected}
            className="pulse-button"
          >
            Activate (300ms)
          </button>
        </div>
      </div>

      <div className="led-color-control">
        <h3>LED Colors</h3>

        <div className="color-section">
          <h4>External LEDs</h4>
          <div
            className="color-preview"
            style={{
              backgroundColor: `rgb(${ledColors.external.r}, ${ledColors.external.g}, ${ledColors.external.b})`,
            }}
          ></div>

          <div className="color-sliders">
            <div className="color-slider">
              <label>R:</label>
              <input
                type="range"
                min="0"
                max="255"
                value={ledColors.external.r}
                onChange={(e) =>
                  handleColorInput(
                    "external",
                    "r",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
                className="red-slider"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={ledColors.external.r}
                onChange={(e) =>
                  handleColorInput(
                    "external",
                    "r",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
              />
            </div>

            <div className="color-slider">
              <label>G:</label>
              <input
                type="range"
                min="0"
                max="255"
                value={ledColors.external.g}
                onChange={(e) =>
                  handleColorInput(
                    "external",
                    "g",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
                className="green-slider"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={ledColors.external.g}
                onChange={(e) =>
                  handleColorInput(
                    "external",
                    "g",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
              />
            </div>

            <div className="color-slider">
              <label>B:</label>
              <input
                type="range"
                min="0"
                max="255"
                value={ledColors.external.b}
                onChange={(e) =>
                  handleColorInput(
                    "external",
                    "b",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
                className="blue-slider"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={ledColors.external.b}
                onChange={(e) =>
                  handleColorInput(
                    "external",
                    "b",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>

        <div className="color-section">
          <h4>Internal LEDs</h4>
          <div
            className="color-preview"
            style={{
              backgroundColor: `rgb(${ledColors.internal.r}, ${ledColors.internal.g}, ${ledColors.internal.b})`,
            }}
          ></div>

          <div className="color-sliders">
            <div className="color-slider">
              <label>R:</label>
              <input
                type="range"
                min="0"
                max="255"
                value={ledColors.internal.r}
                onChange={(e) =>
                  handleColorInput(
                    "internal",
                    "r",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
                className="red-slider"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={ledColors.internal.r}
                onChange={(e) =>
                  handleColorInput(
                    "internal",
                    "r",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
              />
            </div>

            <div className="color-slider">
              <label>G:</label>
              <input
                type="range"
                min="0"
                max="255"
                value={ledColors.internal.g}
                onChange={(e) =>
                  handleColorInput(
                    "internal",
                    "g",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
                className="green-slider"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={ledColors.internal.g}
                onChange={(e) =>
                  handleColorInput(
                    "internal",
                    "g",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
              />
            </div>

            <div className="color-slider">
              <label>B:</label>
              <input
                type="range"
                min="0"
                max="255"
                value={ledColors.internal.b}
                onChange={(e) =>
                  handleColorInput(
                    "internal",
                    "b",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
                className="blue-slider"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={ledColors.internal.b}
                onChange={(e) =>
                  handleColorInput(
                    "internal",
                    "b",
                    parseInt(e.target.value, 10)
                  )
                }
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleLedColorChange}
          disabled={!isConnected}
          className="apply-button"
        >
          Apply Colors
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PeripheralControl;
