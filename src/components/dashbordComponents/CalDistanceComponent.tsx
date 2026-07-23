import FogoCal from "../../assets/images/fire-png.webp";
import DistanciaImg from "../../assets/images/Distancia3-1.png";
import { useRef, useState, useEffect } from "react";

interface CalDistanceComponentProps {
    isConnected: boolean;
    onSendCommand: (data: Uint8Array) => Promise<void>;
    onDistanceUpdate?: (distance: number) => void;
    distance: number;
}

const CalDistanceComponent: React.FC<CalDistanceComponentProps> = ({
    isConnected,
    onSendCommand,
    onDistanceUpdate,   
    distance: traveledDistance
}) => {
    const [caloriesBurned, setCaloriesBurned] = useState(0);
    const onDistanceUpdateRef = useRef(onDistanceUpdate);
    const distanceRef = useRef(traveledDistance);
    const CALORIES_PER_METER = 0.64;

      useEffect(() => {
          onDistanceUpdateRef.current = onDistanceUpdate;
        }, [onDistanceUpdate]);
    
      useEffect(() => {
        distanceRef.current = traveledDistance;
      }, [traveledDistance]);
    
      useEffect(() => {
        if (!isConnected) {
          setCaloriesBurned(0);
          return;
        }
    
        const updateCalories = () => {
          setCaloriesBurned(distanceRef.current * CALORIES_PER_METER);
        };
    
        updateCalories();
    
        const intervalId = window.setInterval(updateCalories, 10000);
    
        return () => {
          window.clearInterval(intervalId);
        };
      }, [isConnected]);

    return(
        <div style={{justifySelf: 'center'}}>
          <div className="dash-results-div" style={{width: '400px', margin: '10px 0px'}}>
            <div className="temperature-button">
            <img src={FogoCal} alt="Distância" className="vacuo-img" width="70" height="80" />
          </div>
            <div className="vacuo-info">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="quantifier-results" style={{ color: "#00C9FF" }}>
                  <span className="value-results">{caloriesBurned.toFixed(1)}</span>
                  <span className="value-results">kcal</span>
                </div>
              </div>
              <p className="dash-subtitles">CALORIAS QUEIMADAS</p>
            </div>
          </div>

          <div className="dash-results-div" style={{width: '400px'}}>
          <div className="vacDis-background">
            <img src={DistanciaImg} alt="Distância" className="vacuo-img" />
          </div>
          <div className="vacuo-info">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="quantifier-results" style={{ color: "#00C9FF" }}>
                <span className="value-results">
                  {traveledDistance > 999 ? (traveledDistance / 1000).toFixed(1) : Math.round(traveledDistance)}
                </span>
                <span className="value-results">{traveledDistance > 999 ? "km" : "m"}</span>
              </div>
            </div>
            <p className="dash-subtitles">DISTÂNCIA PERCORRIDA</p>
          </div>
        </div>
        </div>
    )
}

export default CalDistanceComponent;