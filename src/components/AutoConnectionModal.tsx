import React, { useEffect } from "react";

interface AutoConnectionModalProps {
  isVisible: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

const AutoConnectionModal: React.FC<AutoConnectionModalProps> = ({
  isVisible,
  isSuccess,
  message,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Modal some após 2 segundos

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`auto-connection-modal ${isSuccess ? "success" : "error"}`}
      onClick={onClose}
    >
      <h3>{isSuccess ? "Esteira Conectada" : "Erro de Conexão"}</h3>
      <p>{message}</p>
    </div>
  );
};

export default AutoConnectionModal;
