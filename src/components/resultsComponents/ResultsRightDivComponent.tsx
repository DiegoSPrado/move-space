import VelecimeterImg from "../../assets/images/Velocidade-1.png";
import VacuoImg from "../../assets/images/Vacuo1.png";
import DistanciaImg from "../../assets/images/Distancia3-1.png";
import Vetor2 from "../../assets/images/results/vetorResult2.png";
import Vetor3 from "../../assets/images/results/vetor3.png";

interface ResultsRightDivProps {
  speed: number;
  pressure: number;
  distance: number;
}

function ResultsRigthDivComponent({
  speed,
  pressure,
  distance,
}: ResultsRightDivProps) {
  const formatDistance = () => {
    if (distance > 999) {
      return {
        value: (distance / 1000).toFixed(1),
        unit: "km",
      };
    } else {
      return {
        value: Math.round(distance).toString(),
        unit: "m",
      };
    }
  };

  const formatValue = (value: number): string => {
    // Arredondar para uma casa decimal
    return value.toFixed(1);
  };

  const distanceDisplay = formatDistance();

  return (
    <div className="div-results-right">
      <div
        className="results-right-div-content"
        style={{
          position: "relative",
          top: "5px",
          right: "40px",
          transform: "translateY(0)",
        }}
      >
        <img src={VelecimeterImg} alt="Velocimetro" width={94} height={94} />
        <div className="vacuo-info">
          <div className="quantifier-results" style={{ color: "#23E3FF" }}>
            <span className="value-results">{formatValue(speed)}</span>
            <span className="mesuare-results">m/s</span>
          </div>
          <p className="dash-subtitles">VELOCIDADE MÉDIA</p>
        </div>
      </div>
      <img
        src={Vetor2}
        alt=""
        style={{ transform: "translate(-35px, -35px)" }}
      />
      <div className="results-right-div-content">
        <div className="vacDis-background">
          <img src={VacuoImg} alt="Vácuo" className="vacuo-img" />
        </div>

        <div className="vacuo-info">
          <div className="quantifier-results" style={{ color: "#5D91ED" }}>
            <span className="value-results">{formatValue(pressure)}</span>
            <span className="mesuare-results">hPa</span>
          </div>
          <p className="dash-subtitles">VÁCUO MÉDIO</p>
        </div>
      </div>
      <img src={Vetor3} alt="" style={{ transform: "translateY(-40px)" }} />

      <div
        className="results-right-div-content"
        style={{
          position: "relative",
          bottom: "35px",
          left: "80px",
          transform: "translateY(0)",
        }}
      >
        <div className="vacDis-background">
          <img src={DistanciaImg} alt="Distância" className="vacuo-img" />
        </div>

        <div className="vacuo-info">
          <div className="quantifier-results" style={{ color: "#00C9FF" }}>
            <span className="value-results">{distanceDisplay.value}</span>
            <span className="mesuare-results">{distanceDisplay.unit}</span>
          </div>
          <p className="dash-subtitles">DISTÂNCIA PERCORRIDA</p>
        </div>
      </div>
    </div>
  );
}

export default ResultsRigthDivComponent;
