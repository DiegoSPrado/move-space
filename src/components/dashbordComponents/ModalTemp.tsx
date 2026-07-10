import React, { useEffect, useState } from "react";
import {
    setTemperature as sendTemperature,
    setPressure as sendPressure,
    requestTemperature,
    requestPressure,
    setOperationMode,
    setHeaterPower as sendHeaterPower,
    setPumpPower as sendPumpPower,
  } from "../../utils/CommandHelpers";

 interface EnvironmentControlProps {
    isConnected: boolean;
    onSendCommand: (data: Uint8Array) => Promise<void>;
    currentTemperature?: number;
    currentPressure?: number;
    onClose: () => void;
  }

const ModalTemp:React.FC<EnvironmentControlProps> = ({
    isConnected,
    onSendCommand,
    currentTemperature,
    currentPressure,
    onClose
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
         
           const handleSetTemperature = async (change: number) => {
            if (!isConnected) {
              setError("Not connected to a device");
              return;
            }
          
            // Aplica os limites e calcula o novo valor
            const newTemperature = Math.max(25, Math.min(100, temperatureSetpoint + change));
          
            try {
              setTemperatureSetpoint(newTemperature); 
              setError("");
              const command = sendTemperature(newTemperature); 
              await onSendCommand(command);
            } catch (error) {
              setError("Failed to set temperature");
              console.error(error);
            }
          };
         
           const handleSetPressure = async (change: number) => {
            if (!isConnected) {
              setError("Not connected to a device");
              return;
            }
            
            const newPressure = Math.max(1013.2, Math.min(2000, pressureSetpoint + change))
            
            try {
              setPressureSetpoint(newPressure)
              setError("");
              const command = sendPressure(newPressure);
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
        
    

    return(
        <div onClick={onClose}>
            <div>
                <div>
                    <p>Controle de Temperatura</p>
                </div>
                <div style={{display: 'flex',  gap: '5px', paddingLeft: '20px'}} className="btns-vac-div">
                        <button className="arrow-button" onClick={() =>handleSetPressure(0.1)} disabled={!isConnected }>▲</button>
                        <button className="arrow-button" onClick={() => handleSetPressure(-0.1)} disabled={!isConnected }>▼</button>
                </div>  
            </div>
            
        </div>
    )
}

export default ModalTemp;