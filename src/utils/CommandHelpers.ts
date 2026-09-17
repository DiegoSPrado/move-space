import * as SerialProtocol from "./SerialCommunication";
import { CommandID } from "../types";

// Função wrapper para createCommandMessage
export const createCommandMessage = (
  command: CommandID,
  values: number[]
): Uint8Array => {
  const result = SerialProtocol.createCommandMessage(command, values);
  return result;
};

// Funções wrapper que garantem o tipo de retorno correto
export const setHeaterPower = (power: number): Uint8Array => {
  const result = SerialProtocol.setHeaterPower(power);
  return result;
};

export const setPumpPower = (power: number): Uint8Array => {
  const result = SerialProtocol.setPumpPower(power);
  return result;
};

export const setLedColors = (
  externalR: number,
  externalG: number,
  externalB: number,
  internalR: number,
  internalG: number,
  internalB: number
): Uint8Array => {
  const result = SerialProtocol.setLedColors(
    externalR,
    externalG,
    externalB,
    internalR,
    internalG,
    internalB
  );
  return result;
};

export const setConveyorSpeed = (speed: number): Uint8Array => {
  const result = SerialProtocol.setConveyorSpeed(speed);
  return result;
};

export const setConveyorInclination = (inclination: number): Uint8Array => {
  const result = SerialProtocol.setConveyorInclination(inclination);
  return result;
};

export const setTemperature = (temperature: number): Uint8Array => {
  const result = SerialProtocol.setTemperature(temperature);
  return result;
};

export const setPressure = (pressure: number): Uint8Array => {
  const result = SerialProtocol.setPressure(pressure);
  return result;
};

export const setOperationMode = (automatic: boolean): Uint8Array => {
  const result = SerialProtocol.setOperationMode(automatic);
  return result;
};

export const setLampState = (on: boolean): Uint8Array => {
  const result = SerialProtocol.setLampState(on);
  return result;
};

export const setLedState = (on: boolean): Uint8Array => {
  const result = SerialProtocol.setLedState(on);
  return result;
};

export const setNeonState = (on: boolean): Uint8Array => {
  const result = SerialProtocol.setNeonState(on);
  return result;
};

export const activateAromatizer = (): Uint8Array => {
  const result = SerialProtocol.activateAromatizer();
  return result;
};

export const requestTemperature = (): Uint8Array => {
  const result = SerialProtocol.requestTemperature();
  return result;
};

export const requestPressure = (): Uint8Array => {
  const result = SerialProtocol.requestPressure();
  return result;
};

// Função para analisar resposta
export const normalizeSerialData = SerialProtocol.normalizeSerialData;
export const parseResponse = SerialProtocol.parseResponse;
