export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  productId?: string;
  vendorId?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  portPath?: string;
  baudRate?: number;
  error?: string;
}

// Define a interface global para o window.api
declare global {
  interface Window {
    api:
      | {
          listSerialPorts: () => Promise<SerialPortInfo[]>;
          openSerialPort: (options: {
            path: string;
            baudRate: number;
          }) => Promise<{ success: boolean; message: string }>;
          closeSerialPort: () => Promise<{ success: boolean; message: string }>;
          sendSerialCommand: (
            command: string | Uint8Array
          ) => Promise<{ success: boolean; message: string }>;
          onSerialData: (callback: (data: string | number[] | Uint8Array) => void) => void;
          onSerialError: (callback: (error: string) => void) => void;
          removeSerialListeners: () => void;
          openExternal: (
            url: string
          ) => Promise<{ success: boolean; message: string }>;
          openInternalWindow: (
            url: string,
            title?: string
          ) => Promise<{ success: boolean; message: string }>;
          getSystemInfo?: () => Promise<any>;
          checkBuild?: () => Promise<any>;
          checkAsar?: () => Promise<any>;
          loadIndex?: () => Promise<any>;
          loadReact?: () => Promise<any>;
          extractBuild?: () => Promise<any>;
          executarExe?: () => Promise<any>;
        }
      | undefined;
  }
}

// Command types based on documentation
export enum CommandID {
  VELOCIDADE_ESTEIRA = 0x01,
  INCLINACAO_ESTEIRA = 0x05,
  SETPOINT_PRESSAO = 0x04,
  SETPOINT_TEMPERATURA = 0x06,
  SOLICITAR_TEMPERATURA = 0x09,
  SOLICITAR_PRESSAO = 0x0a,
  MODO_OPERACAO = 0x0f,
  POTENCIA_AQUECEDOR = 0x10,
  POTENCIA_BOMBA_VACUO = 0x11,
  LAMPADA = 0x12,
  COR_LEDS_RGB = 0x13,
  LIGAR_DESLIGAR_LEDS = 0x15,
  NEON = 0x16,
  AROMATIZADOR = 0x17,
}

export enum ResponseID {
  TEMPERATURA_ATUAL = 0x0b,
  PRESSAO_ATUAL = 0x0c,
  VELOCIDADE_ATUAL = 0x0d,
  INCLINACAO_ATUAL = 0x0e,
}

export enum OperationMode {
  MANUAL = 0,
  AUTOMATICO = 1,
}

export interface LedColors {
  external: {
    r: number;
    g: number;
    b: number;
  };
  internal: {
    r: number;
    g: number;
    b: number;
  };
}

export interface DeviceState {
  temperature: number;
  pressure: number;
  conveyorSpeed: number;
  conveyorInclination: number;
  operationMode: OperationMode;
  heaterPower: number;
  pumpPower: number;
  lampOn: boolean;
  ledsOn: boolean;
  neonOn: boolean;
  ledColors: LedColors;
}
