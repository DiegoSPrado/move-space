import FogoCal from "../../assets/images/fire-png.webp";
import DistanciaImg from "../../assets/images/Distancia3-1.png";
import { useRef, useState, useEffect } from "react";

interface CalDistanceComponentProps {
    isConnected: boolean;
    onSendCommand: (data: Uint8Array) => Promise<void>;
    speed: number;
    isRunning: boolean;
    onDistanceUpdate?: (distance: number) => void; // avisa o Dashboard do valor final, sem calcular nada lá
}

const CalDistanceComponent: React.FC<CalDistanceComponentProps> = ({
    isConnected,
    onSendCommand,
    speed,
    isRunning,
    onDistanceUpdate,
}) => {
    const [distance, setDistance] = useState(0);
    const [caloriesBurned, setCaloriesBurned] = useState(0);

    const CALORIES_PER_METER = 0.64;
    const START_DELAY_MS = 2000;

    const animationFrameIdRef = useRef<number>(0);
    const lastDistanceTickRef = useRef<number>(0);
    const runStartTimeRef = useRef<number | null>(null);
    const distanceRef = useRef(distance);
    const onDistanceUpdateRef = useRef(onDistanceUpdate);
    const speedRef = useRef(speed);

    

    useEffect(() => {
        onDistanceUpdateRef.current = onDistanceUpdate;
    }, [onDistanceUpdate]);

    useEffect(() => {
        distanceRef.current = distance;
    }, [distance]);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    // Marca o instante em que a esteira começou a rodar
    useEffect(() => {
        if (isRunning) {
            if (runStartTimeRef.current === null) {
                runStartTimeRef.current = performance.now();
            }
        } else {
            runStartTimeRef.current = null;
        }
    }, [isRunning]);

    // Reseta distância quando desconecta
    useEffect(() => {
        if (!isConnected) {
            setDistance(0);
            setCaloriesBurned(0);
            lastDistanceTickRef.current = 0;
        }
    }, [isConnected]);

    

    // Loop único de cálculo de distância, com delay de 2s ao iniciar
    useEffect(() => {
        const animate = (now: number) => {
            if (!lastDistanceTickRef.current) {
                lastDistanceTickRef.current = now;
            }

            const deltaTime = now - lastDistanceTickRef.current;

            if (deltaTime >= 1000) {
                lastDistanceTickRef.current = now;

                const elapsedSinceStart = runStartTimeRef.current
                    ? now - runStartTimeRef.current
                    : 0;
                const pastStartDelay = elapsedSinceStart >= START_DELAY_MS;

                if (isRunning && isConnected && speedRef.current > 0 && pastStartDelay) {
                    const increment = (speedRef.current / 3.6) * (deltaTime / 1000);

                    setDistance((prev) => {
                        const next = prev + increment;
                        onDistanceUpdateRef.current?.(next);
                        return next;
                    });
                }
            }

            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        animationFrameIdRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameIdRef.current);
    }, [isRunning, isConnected]);

    // Calorias recalculadas a cada 10s a partir da distância acumulada
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

    return (
        <div style={{ justifySelf: 'center' }}>
          <div className="dash-results-div" style={{ width: '400px', margin: '10px 0px' }}>
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

          <div className="dash-results-div" style={{ width: '400px' }}>
            <div className="vacDis-background">
              <img src={DistanciaImg} alt="Distância" className="vacuo-img" />
            </div>
            <div className="vacuo-info">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="quantifier-results" style={{ color: "#00C9FF" }}>
                  <span className="value-results">
                    {distance > 999 ? (distance / 1000).toFixed(1) : Math.round(distance)}
                  </span>
                  <span className="value-results">{distance > 999 ? "km" : "m"}</span>
                </div>
              </div>
              <p className="dash-subtitles">DISTÂNCIA PERCORRIDA</p>
            </div>
          </div>
        </div>
    );
};

export default CalDistanceComponent;