import React, { useState } from "react";
import { styles } from "../../constants/modalStyle";

interface ModalCheckupProps {
  onClose: () => void;
}

const ModalCheckup: React.FC<ModalCheckupProps> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);

  const openBiotriagem = () => {
    if (window.api && window.api.openInternalWindow) {
      window.api
        .openInternalWindow(
          "https://www.biotriagemplataforma.com.br/",
          "Biotriagem"
        )
        .then((result) => {
          console.log("Biotriagem aberta:", result);
          onClose(); // Fecha o modal após abrir a plataforma
        })
        .catch((err) => console.error("Erro ao abrir Biotriagem:", err));
    } else {
      window.open("https://www.biotriagemplataforma.com.br/", "_blank");
      onClose();
    }
  };

  return (
    <div style={styles.overlay as React.CSSProperties} onClick={onClose}>
      <div
        style={styles.modal as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <h2 style={{ color: "#1DB954", marginBottom: "20px" }}>
            Checkup Fisiológico
          </h2>

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: step === 1 ? "#1DB954" : "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                marginRight: "15px",
              }}
            >
              1
            </div>
            <div
              style={{
                width: "100px",
                height: "2px",
                backgroundColor: step === 2 ? "#1DB954" : "#ccc",
                alignSelf: "center",
              }}
            ></div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: step === 2 ? "#1DB954" : "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                marginLeft: "15px",
              }}
            >
              2
            </div>
          </div>

          {step === 1 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
              }}
            >
              <h3>Passo 1: Realize o exame Screening Fisiológico</h3>
              <p style={{ marginBottom: "20px" }}>
                Para iniciar seu checkup fisiológico, realize primeiro o exame
                Screening Fisiológico utilizando o aparelho conectado. Siga as
                instruções no dispositivo.
              </p>
              <div style={{ marginBottom: "20px" }}>
                <button
                  onClick={() => {}}
                  style={{
                    backgroundColor: "#1E90FF",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    margin: "0 auto",
                  }}
                >
                  <img
                    src="/logo192.png"
                    alt="Screening Fisiológico"
                    style={{ width: "24px", marginRight: "8px" }}
                  />
                  Iniciar Screening Fisiológico
                </button>
              </div>
              <button
                onClick={() => setStep(2)}
                style={{
                  backgroundColor: "#1DB954",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                Próximo
              </button>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
              }}
            >
              <h3>Passo 2: Acesse a Plataforma Biotriagem</h3>
              <p style={{ marginBottom: "20px" }}>
                Agora que você realizou o exame Screening Fisiológico, acesse a
                plataforma Biotriagem para completar seu checkup fisiológico e
                visualizar seus resultados.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    backgroundColor: "#ccc",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  Voltar
                </button>
                <button
                  onClick={openBiotriagem}
                  style={{
                    backgroundColor: "#1DB954",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  Abrir Plataforma Biotriagem
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ModalCheckup;
