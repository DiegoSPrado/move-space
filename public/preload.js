const { contextBridge, ipcRenderer, shell } = require("electron");

// Diagnóstico simplificado
console.log(
  "==================== INÍCIO DIAGNÓSTICO PRELOAD ===================="
);
console.log("Preload script iniciando");

// Adicionar mensagem global ao objeto window para verificação
// Esta variável estará disponível na página, mesmo que o contextBridge falhe
window._preloadExecuted = "Preload executado com sucesso";

// Versão simplificada sem dependências de caminhos
try {
  console.log("Versão do Electron:", process.versions.electron);
  console.log("Versão do Node:", process.versions.node);
  console.log("Versão do Chrome:", process.versions.chrome);
  console.log("Plataforma:", process.platform);
  console.log("Arquitetura:", process.arch);
} catch (err) {
  console.error("Erro ao obter informações do sistema:", err);
}

// Verificar quando o documento HTML é carregado
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM totalmente carregado");
  console.log("Elementos root:", document.getElementById("root"));
  console.log("Document URL:", document.URL);
  console.log("Base URL:", document.baseURI);

  // Verificar elementos existentes
  console.log("Body children:", document.body.children.length);

  // Verificar scripts carregados
  const scripts = document.getElementsByTagName("script");
  console.log(`Scripts carregados: ${scripts.length}`);
  for (let i = 0; i < scripts.length; i++) {
    console.log(`Script ${i + 1}:`, scripts[i].src);
  }

  // Verificar estilos carregados
  const styles = document.getElementsByTagName("link");
  console.log(`Estilos carregados: ${styles.length}`);
  for (let i = 0; i < styles.length; i++) {
    console.log(`Estilo ${i + 1}:`, styles[i].href);
  }
});

// Monitorar erros na página
window.addEventListener("error", (event) => {
  console.error("Erro ao carregar recurso:", event.target);
});

// Monitorar erros de script
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Erro de script:", message, "em", source, "linha", lineno);
  return false;
};

// Tentar expor APIs para a janela, com tratamento de erro
try {
  console.log("Tentando registrar API via contextBridge...");

  contextBridge.exposeInMainWorld("api", {
    // API de diagnóstico
    getSystemInfo: () => ipcRenderer.invoke("getSystemInfo"),
    checkBuild: () => ipcRenderer.invoke("checkBuild"),
    checkAsar: () => ipcRenderer.invoke("checkAsar"),
    loadIndex: () => ipcRenderer.invoke("loadIndex"),
    loadReact: () => ipcRenderer.invoke("loadReact"),
    extractBuild: () => ipcRenderer.invoke("extractBuild"),

    // API de porta serial
    listSerialPorts: () => ipcRenderer.invoke("list-serial-ports"),
    openSerialPort: (options) =>
      ipcRenderer.invoke("open-serial-port", options),
    closeSerialPort: () => ipcRenderer.invoke("close-serial-port"),
    sendSerialCommand: (command) =>
      ipcRenderer.invoke("send-serial-command", command),
    onSerialData: (callback) => {
      console.log("Registrando listener para serial-data");
      ipcRenderer.on("serial-data", (_, data) => {
        console.log("Preload: Dados recebidos do main process:", data);
        if (typeof data === "string") {
          console.log(
            "Preload: Dados recebidos como string, comprimento:",
            data.length
          );
          if (data.length > 0) {
            const bytes = [];
            for (let i = 0; i < Math.min(data.length, 20); i++) {
              bytes.push(data.charCodeAt(i).toString(16).padStart(2, "0"));
            }
            console.log("Preload: Primeiros bytes:", bytes.join(" "));
          }
        }
        callback(data);
      });
    },
    onSerialError: (callback) => {
      ipcRenderer.on("serial-error", (_, error) => callback(error));
    },
    removeSerialListeners: () => {
      ipcRenderer.removeAllListeners("serial-data");
      ipcRenderer.removeAllListeners("serial-error");
    },
    executarExe: () => ipcRenderer.invoke("executar-exe"),

    // API para abrir URLs externas
    openExternal: (url) => ipcRenderer.invoke("open-external-url", url),

    // API para abrir URLs em uma janela interna
    openInternalWindow: (url, title) =>
      ipcRenderer.invoke("open-internal-window", { url, title }),
  });

  console.log("API registrada com sucesso via contextBridge");
} catch (err) {
  console.error("Erro ao registrar API via contextBridge:", err);
}

console.log(
  "==================== FIM DIAGNÓSTICO PRELOAD ===================="
);
