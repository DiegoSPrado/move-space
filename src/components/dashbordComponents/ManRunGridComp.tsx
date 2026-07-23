import React from "react";
import ManRun from "../../assets/images/man-3d-running.png";
import RunningVideo from "../../assets/videos/MaleRunning.mp4";


type Props = {
  speed: number;
};

function ManRunningComponent({ speed }: Props) {
  return (
    <div
      className="man-runinng-div"
      style={{
        background:
          "linear-gradient(180deg, rgba(55, 12, 148, 0.8) 0%, rgba(11, 1, 33, 0) 165.57%)",
        borderWidth: "0.5px",
        borderRadius: "13px",
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        
      }}
    >
      <p style={{ padding: "5px", margin: "0" }}>DESEMPENHO</p>

      <div
        style={{
          flex: "1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "5px",
        }}
      >
        {speed > 0 ? (
          <div
            className="video-container-vertical"
            style={{
              aspectRatio: "4/5",
            }}
          >
            <video
              src={RunningVideo}
              autoPlay
              loop
              muted
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "102%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        ) : (
          <img
            src={ManRun}
            alt="Imagem de um homem correndo"
            style={{
              maxWidth: "80%",
              maxHeight: "80%",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ManRunningComponent;
