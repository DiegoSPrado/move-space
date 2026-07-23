import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { LedColors } from "../../types";
import { setLedColors } from "../../utils/CommandHelpers";

interface LedsComponentProps {
  isConnected?: boolean;
  onSendCommand?: (data: Uint8Array) => Promise<void>;
}

function LedsComponent({
  isConnected = false,
  onSendCommand,
}: LedsComponentProps) {
  // Estado para cores dos LEDs externo/interno
  const [ledColors, setLedColorsState] = useState<LedColors>({
    external: { r: 0, g: 0, b: 255 },
    internal: { r: 0, g: 0, b: 255 },
  });

  // Estado para as cores em formato hex
  const [externalHex, setExternalHex] = useState<string>("#0000ff");
  const [internalHex, setInternalHex] = useState<string>("#0000ff");

  // Função para converter hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Função para converter RGB para hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")}`;
  };

  // Atualiza o hex quando o RGB muda
  useEffect(() => {
    setExternalHex(
      rgbToHex(ledColors.external.r, ledColors.external.g, ledColors.external.b)
    );
    setInternalHex(
      rgbToHex(ledColors.internal.r, ledColors.internal.g, ledColors.internal.b)
    );
  }, [ledColors]);


  // Função para enviar comandos de cor para o hardware (valores passados explicitamente)
  const sendLedColorsToHardware = async (
    external: any,
    internal: any
  ) => {
    if (!isConnected || !onSendCommand) return;
    try {
      const command = setLedColors(
        external.r,
        external.g,
        external.b,
        internal.r,
        internal.g,
        internal.b
      );
      await onSendCommand(command);
    } catch (error) {
      console.error("Error sending LED colors:", error);
    }
  };

  // Função para atualizar cor externa
  const handleExternalColorChange = (color: string) => {
    const rgb = hexToRgb(color);
    setExternalHex(color);
    setLedColorsState((prev) => {
      const updated = { ...prev, external: rgb };
      // Envia imediatamente ao hardware
      sendLedColorsToHardware(updated.external, updated.internal);
      return updated;
    });
  };

  // Função para atualizar cor interna
  const handleInternalColorChange = (color: string) => {
    const rgb = hexToRgb(color);
    setInternalHex(color);
    setLedColorsState((prev) => {
      const updated = { ...prev, internal: rgb };
      // Envia imediatamente ao hardware
      sendLedColorsToHardware(updated.external, updated.internal);
      return updated;
    });
  };


  // Removido o debounce global, envio agora é imediato em cada handler

  return (
    <div
      className="div-leds"
      style={{
          display: "flex",
        gap: "10px",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {/* Controles dos pickeres */}
      <div style={{ display: "flex", gap: "25px" }}>
        {/* LED Externo */}
        <div>
          <div
            style={{
              fontSize: "14px",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "2px",
            }}
          >
            <p className='dash-subtitles'>LED EXTERNO</p>
          </div>
          <div style={{ width: "160px", height: "160px" }}>
            <HexColorPicker
              color={externalHex}
              onChange={handleExternalColorChange}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        {/* LED Interno */}
        <div>
          <div
            style={{
              fontSize: "14px",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "2px",
            }}
          >
           <p className='dash-subtitles'>LED INTERNO</p>
          </div>
          <div style={{ width: "160px", height: "160px" }}>
            <HexColorPicker
              color={internalHex}
              onChange={handleInternalColorChange}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LedsComponent;
