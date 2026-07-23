import DashboardHeader from "../components/dashbordComponents/AppHeader";
import { useState, useEffect } from "react";
import "../constants/Result.css";
import OptionsDashComponent from "../components/dashbordComponents/OptionsDashComponent";
import ResultsRigthDivComponent from "../components/resultsComponents/ResultsRightDivComponent";
import ResultsLeftDivComponent from "../components/resultsComponents/ResultsLeftDiv";
import { Link, useNavigate } from "react-router-dom";

interface ExerciseData {
  duration: number;
  distance: number;
  temperature?: number;
  pressure?: number;
  maxSpeed: number;
  avgTemperature?: number;
  avgPressure?: number;
  avgSpeed?: number;
}

function Result() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [calories, setCalories] = useState<number>(0);
  const [maxTemperature, setMaxTemperature] = useState<number | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("exerciseData");
    const storedMaxTemp = sessionStorage.getItem("maxTemperature");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as ExerciseData;
        console.log("[RESULT] Dados do exercício carregados:", parsedData);

        // Verificar e definir valores padrão para dados ausentes
        if (parsedData.avgTemperature === undefined) {
          console.log(
            "[RESULT] Temperatura média não definida, usando temperatura atual"
          );
          parsedData.avgTemperature = parsedData.temperature || 0;
        }

        if (parsedData.avgPressure === undefined) {
          console.log(
            "[RESULT] Pressão média não definida, usando pressão atual"
          );
          parsedData.avgPressure = parsedData.pressure || 0;
        }

        if (parsedData.avgSpeed === undefined) {
          console.log(
            "[RESULT] Velocidade média não definida, usando velocidade máxima"
          );
          parsedData.avgSpeed = parsedData.maxSpeed || 0;
        }

        setExerciseData(parsedData);

        const CALORIES_PER_METER = 0.64;
        
        const caloriesBurned = Math.ceil(parsedData.distance * CALORIES_PER_METER);
        
        setCalories(caloriesBurned);
        console.log(
          "[RESULT] Calorias calculadas:",
          caloriesBurned,
          "baseado em",
          parsedData.duration,
          "segundos"
        );

        if (storedMaxTemp) {
          const parsedMaxTemp = parseFloat(storedMaxTemp);
          setMaxTemperature(parsedMaxTemp);
          // Atualiza a temperatura no objeto de dados do exercício
          parsedData.temperature = parsedMaxTemp;
        }
      } catch (error) {
        console.error("Failed to parse exercise data:", error);
      }
    } else {
      console.warn("No exercise data available, redirecting to dashboard");
      navigate("/");
    }
  }, [navigate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return "N/A";
    return value.toFixed(1);
  };

  return (
    <div className="container-result">
      <DashboardHeader onClose={() => setOpenModal(!openModal)} />

      <Link to={"/"} className="btn-back">
        ←
      </Link>
      <main className="clip-rounded">
        <div className="div-title-result">
          <h1 className="result-title">Parabéns pelo exercício</h1>
        </div>
        <div style={{ display: "flex ", justifyContent: "center" }}>
          <ResultsLeftDivComponent
            temperature={
              exerciseData?.avgTemperature !== undefined
                ? formatValue(exerciseData.avgTemperature)
                : "N/A"
            }
            duration={
              exerciseData ? formatTime(exerciseData.duration) : "00:00"
            }
          />
          <div className="container-velocimeter">
            <div className="velocimeter-div-result">
              <div className="results-cal-div">
                <span className="calories-result">{calories}</span>
                <span className="calories-span">CALORIAS QUEIMADAS</span>
              </div>
            </div>
          </div>
          <ResultsRigthDivComponent
            speed={exerciseData?.avgSpeed || 0}
            pressure={exerciseData?.avgPressure || 0}
            distance={exerciseData?.distance || 0}
          />
        </div>
      </main>
      <div style={{ margin: "20px" }}>
        <OptionsDashComponent 
          isConnected={false}
          onSendCommand={() => Promise.resolve()}
        />
      </div>
    </div>
  );
}

export default Result;
