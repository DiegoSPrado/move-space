import { CommandID, LedColors } from "../types";

const STX = 0x02;
const ETX = 0x03;
const MASTER_ID = 0x08;

/**
 * Creates a command message based on the protocol
 * [STX][MASTER_ID][COMANDO_ID][VALOR][ETX]
 */
export const createCommandMessage = (
  command: CommandID,
  values: number[]
): Uint8Array => {
  console.log("[CREATE_COMMAND] Creating command:", { command, values });
  const message = [STX, MASTER_ID, command, ...values, ETX];
  console.log("[CREATE_COMMAND] Message bytes:", message);
  const result = new Uint8Array(message);
  console.log("[CREATE_COMMAND] Returning Uint8Array:", result);
  return result;
};

/**
 * Set conveyor belt speed (0-169)
 */
export const setConveyorSpeed = (speed: number): Uint8Array => {
  
  // Mapeamos a faixa da UI [0, 10] para a faixa do hardware corrigida [0, 113].
  const hardwareSpeed = (speed / 10) * 113; // 169 * (2/3)

  // Clamp the value to ensure it's within the valid hardware range and is an integer.
  const validSpeed = Math.max(0, Math.min(113, Math.floor(hardwareSpeed)));
  return createCommandMessage(CommandID.VELOCIDADE_ESTEIRA, [validSpeed]);
};

/**
 * Set conveyor belt inclination (0-30)
 */
export const setConveyorInclination = (inclination: number): Uint8Array => {
  const validInclination = Math.max(0, Math.min(30, Math.floor(inclination)));
  return createCommandMessage(CommandID.INCLINACAO_ESTEIRA, [validInclination]);
};

/**
 * Set temperature setpoint (value is temperature * 10)
 * Example: 52.5°C => 525
 */
export const setTemperature = (temperature: number): Uint8Array => {
  const tempValue = Math.floor(temperature * 10);

  const byte1 = (tempValue >> 8) & 0xff;
  const byte2 = tempValue & 0xff;

  return createCommandMessage(CommandID.SETPOINT_TEMPERATURA, [byte1, byte2]);
};

/**
 * Set pressure setpoint (value is pressure * 10)
 * Example: 1013.2 hPa => 10132
 */
export const setPressure = (pressure: number): Uint8Array => {
  const pressureValue = Math.floor(pressure * 10);

  const byte1 = (pressureValue >> 8) & 0xff;
  const byte2 = pressureValue & 0xff;

  return createCommandMessage(CommandID.SETPOINT_PRESSAO, [byte1, byte2]);
};

/**
 * Set operation mode (0 = Manual, 1 = Automatic)
 */
export const setOperationMode = (automatic: boolean): Uint8Array => {
  return createCommandMessage(CommandID.MODO_OPERACAO, [automatic ? 1 : 0]);
};

/**
 * Set heater power (0-100%)
 */
export const setHeaterPower = (power: number): Uint8Array => {
  const validPower = Math.max(0, Math.min(100, Math.floor(power)));
  return createCommandMessage(CommandID.POTENCIA_AQUECEDOR, [validPower]);
};

/**
 * Set vacuum pump power (0-100%)
 */
export const setPumpPower = (power: number): Uint8Array => {
  const validPower = Math.max(0, Math.min(100, Math.floor(power)));
  return createCommandMessage(CommandID.POTENCIA_BOMBA_VACUO, [validPower]);
};

/**
 * Set lamp state (on/off)
 */
export const setLampState = (on: boolean): Uint8Array => {
  return createCommandMessage(CommandID.LAMPADA, [on ? 1 : 0]);
};

/**
 * Set LED RGB colors
 */
export const setLedColors = (
  externalR: number,
  externalG: number,
  externalB: number,
  internalR: number,
  internalG: number,
  internalB: number
): Uint8Array => {
  const validExternalR = Math.max(0, Math.min(255, Math.floor(externalR)));
  const validExternalG = Math.max(0, Math.min(255, Math.floor(externalG)));
  const validExternalB = Math.max(0, Math.min(255, Math.floor(externalB)));
  const validInternalR = Math.max(0, Math.min(255, Math.floor(internalR)));
  const validInternalG = Math.max(0, Math.min(255, Math.floor(internalG)));
  const validInternalB = Math.max(0, Math.min(255, Math.floor(internalB)));

  return createCommandMessage(CommandID.COR_LEDS_RGB, [
    validExternalR,
    validExternalG,
    validExternalB,
    validInternalR,
    validInternalG,
    validInternalB,
  ]);
};

/**
 * Set LED state (on/off)
 */
export const setLedState = (on: boolean): Uint8Array => {
  return createCommandMessage(CommandID.LIGAR_DESLIGAR_LEDS, [on ? 1 : 0]);
};

/**
 * Set neon state (on/off)
 */
export const setNeonState = (on: boolean): Uint8Array => {
  return createCommandMessage(CommandID.NEON, [on ? 1 : 0]);
};

/**
 * Activate aromatizer (300ms pulse)
 */
export const activateAromatizer = (): Uint8Array => {
  return createCommandMessage(CommandID.AROMATIZADOR, [1]);
};

/**
 * Request current temperature
 */
export const requestTemperature = (): Uint8Array => {
  const cmd = createCommandMessage(CommandID.SOLICITAR_TEMPERATURA, []);
  console.log("[REQUEST_TEMP] Called requestTemperature(), returning:", cmd);
  return cmd;
};

/**
 * Request current pressure
 */
export const requestPressure = (): Uint8Array => {
  const cmd = createCommandMessage(CommandID.SOLICITAR_PRESSAO, []);
  console.log("[REQUEST_PRESSURE] Called requestPressure(), returning:", cmd);
  return cmd;
};

/**
 * Parse response data
 */
export const normalizeSerialData = (
  data: string | number[] | Uint8Array
): Uint8Array => {
  if (data instanceof Uint8Array) {
    return data;
  }

  if (Array.isArray(data) && data.every((byte) => typeof byte === "number")) {
    return new Uint8Array(data);
  }

  if (typeof data === "string") {
    const trimmed = data.trim();

    // JSON encoded array of bytes
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.every((byte) => typeof byte === "number")) {
          return new Uint8Array(parsed);
        }
      } catch {
        // Fallthrough to raw string parsing
      }
    }

    // Hex string e.g. "02 08 0b 00 64 03"
    const hexParts = trimmed.split(/\s+/);
    if (
      hexParts.length > 1 &&
      hexParts.every((part) => /^[0-9a-fA-F]{2}$/.test(part))
    ) {
      return new Uint8Array(hexParts.map((part) => parseInt(part, 16)));
    }

    // Try to interpret as raw binary string bytes
    const rawBytes = new Uint8Array(trimmed.length);
    for (let i = 0; i < trimmed.length; i += 1) {
      rawBytes[i] = trimmed.charCodeAt(i);
    }
    return rawBytes;
  }

  // Fallback: try to coerce to Uint8Array
  return new Uint8Array(Array.from((data as unknown) as Uint8Array));
};

export const parseResponse = (data: Uint8Array) => {
  // Debug: Log raw data for troubleshooting
  console.log("[PARSE] Dados recebidos:", Array.from(data));
  console.log("[PARSE_RESPONSE] Attempting to parse:", {
    length: data.length,
    hex: Array.from(data).map((b) => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
    stxValid: data[0] === STX,
    etxValid: data[data.length - 1] === ETX,
  });

  if (data.length < 5 || data[0] !== STX || data[data.length - 1] !== ETX) {
    console.log("[PARSE_RESPONSE] ❌ Data does not meet basic protocol requirements");
    console.log(`[PARSE_RESPONSE]   - Length: ${data.length} (minimum 5)`);
    console.log(`[PARSE_RESPONSE]   - STX: ${data[0]} (expected ${STX})`);
    console.log(`[PARSE_RESPONSE]   - ETX: ${data[data.length - 1]} (expected ${ETX})`);
    return null;
  }

  const commandId = data[2];
  console.log("[PARSE_RESPONSE] ✅ Protocol format valid. Command ID:", `0x${commandId.toString(16)}`);

  switch (commandId) {
    case 0x0b:
      if (data.length >= 6) {
        const temperatureValue = (data[3] << 8) | data[4];
        console.log("[PARSE_RESPONSE] 🌡️  Temperature response parsed:", temperatureValue / 10);
        return { type: "temperature", value: temperatureValue / 10 };
      }
      break;
    case 0x0c:
      if (data.length >= 6) {
        const pressureValue = (data[3] << 8) | data[4];
        console.log("[PARSE_RESPONSE] 🔘 Pressure response parsed:", pressureValue / 10);
        return { type: "pressure", value: pressureValue / 10 };
      }
      break;
    case 0x0d:
      if (data.length >= 6) {
        const speedValue = (data[3] << 8) | data[4];
        console.log("[PARSE_RESPONSE] 🏃 Speed response parsed:", speedValue);
        return { type: "speed", value: speedValue };
      }
      break;
    case 0x0e:
      if (data.length >= 6) {
        const inclinationValue = (data[3] << 8) | data[4];
        console.log("[PARSE_RESPONSE] ⛰️  Inclination response parsed:", inclinationValue);
        return { type: "inclination", value: inclinationValue };
      }
      break;
  }

  console.log("[PARSE_RESPONSE] ❌ Unknown or incomplete response");
  return null;
};
