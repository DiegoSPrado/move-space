const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const url = require("url");
const express = require("express");


// Configuração de log
console.log("==================== INICIANDO ELECTRON ====================");
console.log("Versão Electron:", process.versions.electron);
console.log("Versão Node:", process.versions.node);
console.log("Versão Chrome:", process.versions.chrome);
console.log("Plataforma:", process.platform);
console.log("Diretório app:", app.getAppPath());
console.log("Diretório atual:", process.cwd());

// HTML completo embutido que será servido diretamente
const EMBEDDED_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DrMove - Recuperação</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 15px;
      margin: 5px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background-color: #45a049;
    }
    button.secondary {
      background-color: #3498db;
    }
    button.secondary:hover {
      background-color: #2980b9;
    }
    button.danger {
      background-color: #e74c3c;
    }
    button.danger:hover {
      background-color: #c0392b;
    }
    pre {
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      overflow: auto;
      max-height: 300px;
      font-family: monospace;
      font-size: 13px;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .card h3 {
      margin-top: 0;
      color: #2c3e50;
    }
    .success { color: #27ae60; }
    .error { color: #e74c3c; }
    .warning { color: #f39c12; }
  </style>
</head>
<body>
  <div class="container">
    <h1>DrMove - Diagnóstico e Recuperação</h1>
    
    <div class="card">
      <h3>Verificação de Preload</h3>
      <button id="btn-check-preload">Verificar Preload</button>
      <pre id="preload-status">Clique para verificar o status do preload.js...</pre>
    </div>
    
    <div class="card">
      <h3>Informações do Sistema</h3>
      <pre id="system-info">Carregando informações do sistema...</pre>
    </div>
    
    <div class="card">
      <h3>Verificação de Arquivos</h3>
      <button id="btn-check-build">Verificar Build</button>
      <button id="btn-check-asar" class="secondary">Verificar ASAR</button>
      <pre id="files-output">Clique em um botão para iniciar a verificação...</pre>
    </div>
    
    <div class="card">
      <h3>Ações de Recuperação</h3>
      <button id="btn-load-index">Carregar Index.html</button>
      <button id="btn-load-react">Carregar React App</button>
      <button id="btn-extract-build" class="secondary">Extrair Build</button>
      <pre id="action-output">Selecione uma ação...</pre>
    </div>
    
    <div class="card">
      <h3>Log de Eventos</h3>
      <pre id="event-log"></pre>
    </div>
  </div>
  
  <script>
    // Funções auxiliares
    function log(message, type = 'info') {
      const log = document.getElementById('event-log');
      const now = new Date().toISOString().slice(11, 19);
      const classes = type === 'error' ? 'error' : (type === 'success' ? 'success' : (type === 'warning' ? 'warning' : ''));
      log.innerHTML += \`[\${now}] <span class="\${classes}">\${message}</span>\\n\`;
      console.log(\`[\${type}] \${message}\`);
      
      // Auto-scroll
      log.scrollTop = log.scrollHeight;
    }
    
    // Verificar se o preload foi executado
    document.getElementById('btn-check-preload').addEventListener('click', () => {
      const preloadStatus = document.getElementById('preload-status');
      
      if (window._preloadExecuted) {
        preloadStatus.innerHTML = \`<span class="success">Preload executado com sucesso!</span><br>Mensagem: \${window._preloadExecuted}\`;
        log('Preload detectado', 'success');
      } else {
        preloadStatus.innerHTML = \`<span class="error">Preload não foi executado!</span><br>A variável window._preloadExecuted não está definida.\`;
        log('Preload não detectado', 'error');
      }
      
      // Verificar API
      if (window.api) {
        preloadStatus.innerHTML += \`<br><br><span class="success">API Electron disponível!</span>\`;
        log('API Electron detectada', 'success');
      } else {
        preloadStatus.innerHTML += \`<br><br><span class="error">API Electron não disponível!</span>\`;
        log('API Electron não detectada', 'error');
      }
    });
    
    // Verificar se a API está disponível
    if (!window.api) {
      log('API Electron não encontrada!', 'error');
      document.getElementById('system-info').textContent = 'Erro: API Electron não disponível. O preload.js pode não estar funcionando corretamente.';
    } else {
      log('API Electron detectada', 'success');
      
      // Carregar informações do sistema
      window.api.getSystemInfo().then(info => {
        document.getElementById('system-info').textContent = JSON.stringify(info, null, 2);
        log('Informações do sistema carregadas', 'success');
      }).catch(err => {
        log('Erro ao carregar informações do sistema: ' + err, 'error');
      });
      
      // Botão para verificar build
      document.getElementById('btn-check-build').addEventListener('click', async () => {
        try {
          log('Verificando arquivos build...');
          const output = document.getElementById('files-output');
          output.textContent = 'Verificando...';
          
          const result = await window.api.checkBuild();
          output.textContent = JSON.stringify(result, null, 2);
          
          if (result.buildExists) {
            log('Diretório build encontrado', 'success');
            if (result.indexExists) {
              log('Arquivo index.html encontrado', 'success');
            } else {
              log('Arquivo index.html não encontrado', 'error');
            }
          } else {
            log('Diretório build não encontrado', 'error');
          }
        } catch (err) {
          log('Erro ao verificar build: ' + err, 'error');
          document.getElementById('files-output').textContent = 'Erro: ' + err;
        }
      });
      
      // Botão para verificar asar
      document.getElementById('btn-check-asar').addEventListener('click', async () => {
        try {
          log('Verificando arquivos no asar...');
          const output = document.getElementById('files-output');
          output.textContent = 'Verificando...';
          
          const result = await window.api.checkAsar();
          output.textContent = JSON.stringify(result, null, 2);
          log('Verificação asar concluída', 'success');
        } catch (err) {
          log('Erro ao verificar asar: ' + err, 'error');
          document.getElementById('files-output').textContent = 'Erro: ' + err;
        }
      });
      
      // Botão para carregar index.html
      document.getElementById('btn-load-index').addEventListener('click', async () => {
        try {
          log('Tentando carregar index.html...');
          const output = document.getElementById('action-output');
          output.textContent = 'Carregando...';
          
          const result = await window.api.loadIndex();
          output.textContent = result;
          log('Comando de carregamento enviado: ' + result, 'success');
        } catch (err) {
          log('Erro ao carregar index.html: ' + err, 'error');
          document.getElementById('action-output').textContent = 'Erro: ' + err;
        }
      });
      
      // Botão para carregar React
      document.getElementById('btn-load-react').addEventListener('click', async () => {
        try {
          log('Tentando carregar aplicação React...');
          const output = document.getElementById('action-output');
          output.textContent = 'Carregando...';
          
          const result = await window.api.loadReact();
          output.textContent = result;
          log('Comando de carregamento React enviado: ' + result, 'success');
        } catch (err) {
          log('Erro ao carregar React: ' + err, 'error');
          document.getElementById('action-output').textContent = 'Erro: ' + err;
        }
      });
      
      // Botão para extrair build
      document.getElementById('btn-extract-build').addEventListener('click', async () => {
        try {
          log('Tentando extrair build do asar...');
          const output = document.getElementById('action-output');
          output.textContent = 'Extraindo...';
          
          const result = await window.api.extractBuild();
          output.textContent = result;
          log('Extração concluída: ' + result, 'success');
        } catch (err) {
          log('Erro ao extrair build: ' + err, 'error');
          document.getElementById('action-output').textContent = 'Erro: ' + err;
        }
      });
    }
    
    // Log inicial
    log('Página de diagnóstico carregada');
  </script>
</body>
</html>
`;

let reactServerStarted = false;

let server;
let serverPort;

function startReactServer() {
  return new Promise((resolve) => {
    if (server) return resolve(serverPort);

    const appExpress = express();
    const buildPath = path.join(app.getAppPath(), "build");

    appExpress.use(express.static(buildPath));
    appExpress.get("*", (_, res) =>
      res.sendFile(path.join(buildPath, "index.html"))
    );

    server = appExpress.listen(0, () => {
      serverPort = server.address().port;
      console.log("Servidor React na porta:", serverPort);
      resolve(serverPort);
    });
  });
}

// Criar a janela principal
function createWindow() {
  // Criar janela
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Permitir carregamento de arquivos locais
      preload: path.join(__dirname, "preload.js"),
      sandbox: false, // Necessário para alguns recursos
      allowRunningInsecureContent: true, // Permitir carregamento de recursos inseguros
    },
  });

  // Definir Content Security Policy para permitir recursos locais
  mainWindow.webContents.session.webRequest.onHeadersReceived(
  (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          `
          default-src 'self' 'unsafe-inline' file: data:;
          img-src 'self' file: data: https://img.youtube.com https://*.googlevideo.com https://*.gstatic.com;
          script-src 'self' 'unsafe-inline' 'unsafe-eval'
            https://www.youtube.com
            https://www.google.com
            https://www.gstatic.com
            https://static.doubleclick.net;
          frame-src https://www.youtube.com https://youtube.com;
          connect-src 'self'
            https://*.googlevideo.com
            https://www.youtube.com
            https://youtube.com
            https://www.google.com
            https://www.gstatic.com
            https://googleads.g.doubleclick.net
            https://jnn-pa.googleapis.com;
          media-src 'self' blob: https://*.googlevideo.com;
          font-src 'self' data: https://fonts.gstatic.com https://www.gstatic.com;
          `
        ],
      },
    });
  }
  );

  // Carregar React diretamente ao iniciar o aplicativo
  loadReactApp(mainWindow);

  // Abrir DevTools para diagnóstico em ambiente de desenvolvimento
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  console.log("Janela principal criada");

  // Registrar handlers para o diagnóstico

  // Obter informações do sistema
  ipcMain.handle("getSystemInfo", () => {
    return {
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome,
      platform: process.platform,
      appPath: app.getAppPath(),
      userDataPath: app.getPath("userData"),
      tempPath: app.getPath("temp"),
      cwd: process.cwd(),
    };
  });

  // Verificar arquivos do build
  ipcMain.handle("checkBuild", () => {
    try {
      const appPath = app.getAppPath();
      const buildPath = path.join(appPath, "build");
      const buildExists = fs.existsSync(buildPath);

      const result = {
        appPath,
        buildPath,
        buildExists,
        indexPath: path.join(buildPath, "index.html"),
        indexExists: false,
        files: {},
      };

      if (buildExists) {
        // Verificar index.html
        result.indexExists = fs.existsSync(result.indexPath);

        // Listar arquivos
        const files = fs.readdirSync(buildPath);
        result.files.root = files;

        // Verificar static
        const staticPath = path.join(buildPath, "static");
        if (fs.existsSync(staticPath)) {
          result.files.static = fs.readdirSync(staticPath);

          // Verificar js e css
          const jsPath = path.join(staticPath, "js");
          if (fs.existsSync(jsPath)) {
            result.files.js = fs.readdirSync(jsPath);
          }

          const cssPath = path.join(staticPath, "css");
          if (fs.existsSync(cssPath)) {
            result.files.css = fs.readdirSync(cssPath);
          }
        }
      }

      return result;
    } catch (err) {
      console.error("Erro ao verificar build:", err);
      return { error: err.message };
    }
  });

  // Verificar arquivos no asar
  ipcMain.handle("checkAsar", () => {
    try {
      const appPath = app.getAppPath();

      return {
        appPath,
        isAsar: appPath.includes(".asar"),
        asarPath: appPath.includes(".asar") ? appPath : null,
        files: {
          publicExists: fs.existsSync(path.join(appPath, "public")),
          buildExists: fs.existsSync(path.join(appPath, "build")),
          publicFiles: fs.existsSync(path.join(appPath, "public"))
            ? fs.readdirSync(path.join(appPath, "public"))
            : [],
        },
      };
    } catch (err) {
      console.error("Erro ao verificar asar:", err);
      return { error: err.message };
    }
  });

  // Carregar index.html
  ipcMain.handle("loadIndex", () => {
    try {
      const buildPath = path.join(app.getAppPath(), "build");
      const indexPath = path.join(buildPath, "index.html");

      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
        return "Carregando index.html: " + indexPath;
      } else {
        return "Arquivo index.html não encontrado: " + indexPath;
      }
    } catch (err) {
      console.error("Erro ao carregar index.html:", err);
      return "Erro: " + err.message;
    }
  });

  // Carregar aplicação React (tentativa alternativa)
  ipcMain.handle("loadReact", () => {
    try {
      // Obter o caminho do build
      const appPath = app.getAppPath();
      let buildPath;

      // Verificar se estamos em desenvolvimento ou produção
      if (process.env.NODE_ENV === "development") {
        // Em desenvolvimento, o build está no diretório raiz
        buildPath = path.join(appPath, "build");
      } else {
        // Em produção, o build pode estar em diferentes locais dependendo da configuração
        // Tente diferentes locais possíveis
        const possiblePaths = [
          path.join(appPath, "build"),
          path.join(appPath, "app", "build"),
          path.join(appPath, "resources", "app", "build"),
          path.join(process.resourcesPath, "app", "build"),
        ];

        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            buildPath = p;
            break;
          }
        }

        if (!buildPath) {
          return "Não foi possível encontrar o diretório build";
        }
      }

      const indexPath = path.join(buildPath, "index.html");
      console.log("Tentando carregar:", indexPath);

      if (fs.existsSync(indexPath)) {
        // Carregar diretamente do build
       
       if (!serverPort) {
        console.error("Servidor React ainda não inicializado");
        return;
      } 
       mainWindow.loadURL(`http://localhost:${serverPort}`);

        // Adicionar script de diagnóstico e correção de imagens após o carregamento
        mainWindow.webContents.on("did-finish-load", () => {
          mainWindow.webContents.executeJavaScript(`
            console.log("Aplicação React carregada com sucesso");
            console.log("Diretório de build:", "${buildPath.replace(
              /\\/g,
              "/"
            )}");
            console.log("Diretório de recursos:", "${process.resourcesPath.replace(
              /\\/g,
              "/"
            )}");
            
            // Função para corrigir caminhos de imagens
            function fixImagePaths() {
              const buildPath = "${buildPath.replace(/\\/g, "/")}";
              const resourcesPath = "${process.resourcesPath.replace(
                /\\/g,
                "/"
              )}";
              
              // Corrigir todas as imagens
              const images = document.querySelectorAll('img');
              let fixed = 0;
              
              images.forEach(img => {
                const src = img.getAttribute('src');
                if (src && (src.startsWith('static/') || src.includes('/static/'))) {
                  // Se o caminho já começa com file://, não mexer
                  if (src.startsWith('file://')) return;
                  
                  // Extrair o caminho relativo após 'static/'
                  const staticIndex = src.indexOf('static/');
                  if (staticIndex >= 0) {
                    const relativePath = src.substring(staticIndex);
                    
                    // Tentar primeiro com o caminho do build
                    let newSrc = 'file://' + buildPath + '/' + relativePath;
                    
                    // Se for um arquivo de mídia, tentar também com o caminho descompactado
                    if (relativePath.includes('/media/')) {
                      const altSrc = 'file://' + resourcesPath + '/' + relativePath;
                      console.log('Tentando caminho alternativo para mídia:', altSrc);
                      // Vamos testar o caminho alternativo em uma imagem temporária
                      const tempImg = new Image();
                      tempImg.onload = function() {
                        console.log('Caminho alternativo funcionou:', altSrc);
                        img.src = altSrc;
                      };
                      tempImg.onerror = function() {
                        console.log('Mantendo caminho original:', newSrc);
                      };
                      tempImg.src = altSrc;
                    }
                    
                    img.src = newSrc;
                    fixed++;
                    console.log('Corrigido caminho de imagem:', src, '->', newSrc);
                  }
                }
              });
              
              console.log(\`Corrigidos \${fixed} caminhos de imagens\`);
              
              // Configurar um MutationObserver para corrigir novas imagens
              const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                  if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                      if (node.nodeType === 1) { // Elemento
                        // Procurar imagens no elemento adicionado e seus filhos
                        const newImages = node.nodeName === 'IMG' ? [node] : 
                                         Array.from(node.querySelectorAll('img'));
                        
                        newImages.forEach(img => {
                          const src = img.getAttribute('src');
                          if (src && (src.startsWith('static/') || src.includes('/static/'))) {
                            // Se o caminho já começa com file://, não mexer
                            if (src.startsWith('file://')) return;
                            
                            // Extrair o caminho relativo após 'static/'
                            const staticIndex = src.indexOf('static/');
                            if (staticIndex >= 0) {
                              const relativePath = src.substring(staticIndex);
                              
                              // Tentar primeiro com o caminho do build
                              let newSrc = 'file://' + buildPath + '/' + relativePath;
                              
                              // Se for um arquivo de mídia, tentar também com o caminho descompactado
                              if (relativePath.includes('/media/')) {
                                const altSrc = 'file://' + resourcesPath + '/' + relativePath;
                                console.log('Tentando caminho alternativo para mídia dinâmica:', altSrc);
                                const tempImg = new Image();
                                tempImg.onload = function() {
                                  console.log('Caminho alternativo dinâmico funcionou:', altSrc);
                                  img.src = altSrc;
                                };
                                tempImg.onerror = function() {
                                  console.log('Mantendo caminho dinâmico original:', newSrc);
                                };
                                tempImg.src = altSrc;
                              }
                              
                              img.src = newSrc;
                              console.log('Corrigido caminho de imagem (dinâmica):', src, '->', newSrc);
                            }
                          }
                        });
                      }
                    });
                  }
                });
              });
              
              observer.observe(document.body, { 
                childList: true, 
                subtree: true 
              });
              
              return "Correção de imagens inicializada";
            }
            
            // Executar após carregar completamente
            if (document.readyState === 'complete') {
              fixImagePaths();
            } else {
              window.addEventListener('load', fixImagePaths);
            }
          `);
        });

        return "Carregando aplicação React diretamente do build: " + indexPath;
      } else {
        return "Arquivo index.html não encontrado: " + indexPath;
      }
    } catch (err) {
      console.error("Erro ao carregar React:", err);
      return "Erro: " + err.message;
    }
  });

  // Extrair build do asar (tentativa mais extrema)
  ipcMain.handle("extractBuild", () => {
    try {
      const appPath = app.getAppPath();
      const tempDir = path.join(app.getPath("temp"), "esteira-extracted");

      // Criar diretório temporário se não existir
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Verificar se há um diretório build no asar
      const buildPath = path.join(appPath, "build");
      if (fs.existsSync(buildPath)) {
        // Copiar o diretório build para o temporário
        const tempBuildPath = path.join(tempDir, "build");

        // Criar diretório de build temporário
        if (!fs.existsSync(tempBuildPath)) {
          fs.mkdirSync(tempBuildPath, { recursive: true });
        }

        // Copiar todos os arquivos
        const copyDir = (src, dest) => {
          // Verificar se o diretório de destino existe
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }

          // Obter todos os arquivos
          const files = fs.readdirSync(src);

          // Copiar cada arquivo
          for (const file of files) {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);

            const stats = fs.statSync(srcPath);

            if (stats.isDirectory()) {
              // Recursivamente copiar diretório
              copyDir(srcPath, destPath);
            } else {
              // Copiar arquivo
              fs.copyFileSync(srcPath, destPath);
            }
          }
        };

        // Executar cópia recursiva
        copyDir(buildPath, tempBuildPath);

        // Carregar o index.html do diretório temporário
        const tempIndexPath = path.join(tempBuildPath, "index.html");
        if (fs.existsSync(tempIndexPath)) {
          mainWindow.loadFile(tempIndexPath);
          return "Arquivos extraídos e carregando de: " + tempIndexPath;
        } else {
          return "Extração completa, mas index.html não encontrado";
        }
      } else {
        return "Diretório build não encontrado no asar";
      }
    } catch (err) {
      console.error("Erro ao extrair build:", err);
      return "Erro: " + err.message;
    }
  });

  return mainWindow;
}

// Função para carregar a aplicação React
function loadReactApp(mainWindow) {
  try {
    // Obter o caminho do build
    const appPath = app.getAppPath();
    let buildPath;

    // Verificar se estamos em desenvolvimento ou produção
    if (process.env.NODE_ENV === "development") {
      // Em desenvolvimento, o build está no diretório raiz
      buildPath = path.join(appPath, "build");
    } else {
      // Em produção, o build pode estar em diferentes locais dependendo da configuração
      // Tente diferentes locais possíveis
      const possiblePaths = [
        path.join(appPath, "build"),
        path.join(appPath, "app", "build"),
        path.join(appPath, "resources", "app", "build"),
        path.join(process.resourcesPath, "app", "build"),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          buildPath = p;
          break;
        }
      }

      if (!buildPath) {
        console.error("Não foi possível encontrar o diretório build");
        // Carregar HTML de emergência como fallback
        mainWindow.loadURL(
          "data:text/html;charset=utf-8," + encodeURIComponent(EMBEDDED_HTML)
        );
        return;
      }
    }

    const indexPath = path.join(buildPath, "index.html");
    console.log("Carregando aplicação do caminho:", indexPath);

    if (fs.existsSync(indexPath)) {
      // Carregar diretamente do build
      if (!serverPort) {
          console.error("Servidor React ainda não inicializado");
          return;
        }
    mainWindow.loadURL(`http://localhost:${serverPort}`);

      // Adicionar script de diagnóstico e correção de imagens após o carregamento
      mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.executeJavaScript(`
          console.log("Aplicação React carregada com sucesso");
          console.log("Diretório de build:", "${buildPath.replace(
            /\\/g,
            "/"
          )}");
          console.log("Diretório de recursos:", "${process.resourcesPath.replace(
            /\\/g,
            "/"
          )}");
          
          // Função para corrigir caminhos de imagens
          function fixImagePaths() {
            const buildPath = "${buildPath.replace(/\\/g, "/")}";
            const resourcesPath = "${process.resourcesPath.replace(
              /\\/g,
              "/"
            )}";
            
            // Corrigir todas as imagens
            const images = document.querySelectorAll('img');
            let fixed = 0;
            
            images.forEach(img => {
              const src = img.getAttribute('src');
              if (src && (src.startsWith('static/') || src.includes('/static/'))) {
                // Se o caminho já começa com file://, não mexer
                if (src.startsWith('file://')) return;
                
                // Extrair o caminho relativo após 'static/'
                const staticIndex = src.indexOf('static/');
                if (staticIndex >= 0) {
                  const relativePath = src.substring(staticIndex);
                  
                  // Tentar primeiro com o caminho do build
                  let newSrc = 'file://' + buildPath + '/' + relativePath;
                  
                  // Se for um arquivo de mídia, tentar também com o caminho descompactado
                  if (relativePath.includes('/media/')) {
                    const altSrc = 'file://' + resourcesPath + '/' + relativePath;
                    console.log('Tentando caminho alternativo para mídia:', altSrc);
                    // Vamos testar o caminho alternativo em uma imagem temporária
                    const tempImg = new Image();
                    tempImg.onload = function() {
                      console.log('Caminho alternativo funcionou:', altSrc);
                      img.src = altSrc;
                    };
                    tempImg.onerror = function() {
                      console.log('Mantendo caminho original:', newSrc);
                    };
                    tempImg.src = altSrc;
                  }
                  
                  img.src = newSrc;
                  fixed++;
                  console.log('Corrigido caminho de imagem:', src, '->', newSrc);
                }
              }
            });
            
            console.log(\`Corrigidos \${fixed} caminhos de imagens\`);
            
            // Configurar um MutationObserver para corrigir novas imagens
            const observer = new MutationObserver(mutations => {
              mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Elemento
                      // Procurar imagens no elemento adicionado e seus filhos
                      const newImages = node.nodeName === 'IMG' ? [node] : 
                                       Array.from(node.querySelectorAll('img'));
                      
                      newImages.forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && (src.startsWith('static/') || src.includes('/static/'))) {
                          // Se o caminho já começa com file://, não mexer
                          if (src.startsWith('file://')) return;
                          
                          // Extrair o caminho relativo após 'static/'
                          const staticIndex = src.indexOf('static/');
                          if (staticIndex >= 0) {
                            const relativePath = src.substring(staticIndex);
                            
                            // Tentar primeiro com o caminho do build
                            let newSrc = 'file://' + buildPath + '/' + relativePath;
                            
                            // Se for um arquivo de mídia, tentar também com o caminho descompactado
                            if (relativePath.includes('/media/')) {
                              const altSrc = 'file://' + resourcesPath + '/' + relativePath;
                              console.log('Tentando caminho alternativo para mídia dinâmica:', altSrc);
                              const tempImg = new Image();
                              tempImg.onload = function() {
                                console.log('Caminho alternativo dinâmico funcionou:', altSrc);
                                img.src = altSrc;
                              };
                              tempImg.onerror = function() {
                                console.log('Mantendo caminho dinâmico original:', newSrc);
                              };
                              tempImg.src = altSrc;
                            }
                            
                            img.src = newSrc;
                            console.log('Corrigido caminho de imagem (dinâmica):', src, '->', newSrc);
                          }
                        }
                      });
                    }
                  });
                }
              });
            });
            
            observer.observe(document.body, { 
              childList: true, 
              subtree: true 
            });
            
            return "Correção de imagens inicializada";
          }
          
          // Executar após carregar completamente
          if (document.readyState === 'complete') {
            fixImagePaths();
          } else {
            window.addEventListener('load', fixImagePaths);
          }
        `);
      });

      console.log("Aplicação React carregada com sucesso");
    } else {
      console.error("Arquivo index.html não encontrado:", indexPath);
      // Carregar HTML de emergência como fallback
      mainWindow.loadURL(
        "data:text/html;charset=utf-8," + encodeURIComponent(EMBEDDED_HTML)
      );
    }
  } catch (err) {
    console.error("Erro ao carregar React:", err);
    // Carregar HTML de emergência como fallback
    mainWindow.loadURL(
      "data:text/html;charset=utf-8," + encodeURIComponent(EMBEDDED_HTML)
    );
  }
}

// Inicializar a aplicação
app.whenReady().then(async () => {
  console.log("App pronto, iniciando servidor React...");
  
  await startReactServer(); 
  
  console.log("Criando janela...");
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Encerrar a aplicação quando todas as janelas estiverem fechadas (exceto no macOS)
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Listar portas seriais
ipcMain.handle("list-serial-ports", async () => {
  console.log("Listando portas seriais");
  try {
    const { SerialPort } = require("serialport");
    const ports = await SerialPort.list();
    console.log("Portas encontradas:", ports.length);
    return ports;
  } catch (error) {
    console.error("Erro ao listar portas seriais:", error);
    return [];
  }
});

// Abrir porta serial
ipcMain.handle("open-serial-port", async (event, options) => {
  console.log("Tentando abrir porta serial:", options.path);
  try {
    const { SerialPort } = require("serialport");

    // Verificar se já existe uma conexão ativa e fechá-la
    if (global.serialConnection) {
      console.log("Fechando conexão anterior");
      await global.serialConnection.close();
      global.serialConnection = null;
    }

    // Configurar a nova conexão
    const port = new SerialPort({
      path: options.path,
      baudRate: options.baudRate || 9600,
      dataBits: options.dataBits || 8,
      stopBits: options.stopBits || 1,
      parity: options.parity || "none",
      autoOpen: false,
    });

    // Criar uma promessa para controlar a abertura da porta
    return new Promise((resolve, reject) => {
      port.open((err) => {
        if (err) {
          console.error("Erro ao abrir porta serial:", err.message);
          reject(err.message);
          return;
        }

        console.log("Porta serial aberta com sucesso:", options.path);

        // Configurar manipuladores de eventos
        port.on("error", (err) => {
          console.error("Erro na porta serial:", err.message);
          // Notificar o renderer sobre o erro
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("serial-error", err.message);
          }
        });

        port.on("data", (data) => {
          console.log("Dados recebidos:", data.toString());
          console.log(
            "Dados recebidos (hex):",
            Array.from(data)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join(" ")
          );

          // Enviar dados recebidos para o renderer
          if (mainWindow && !mainWindow.isDestroyed()) {
            console.log("Enviando dados para renderer, bytes:", data.length);

            // Mandar como string normal
            mainWindow.webContents.send("serial-data", data.toString());

            // Se não funcionar, teste estas alternativas comentadas:
            /*
            // Alternativa 1: Enviar como array de bytes
            // mainWindow.webContents.send("serial-data", JSON.stringify(Array.from(data)));
            
            // Alternativa 2: Enviar como buffer binário
            // mainWindow.webContents.send("serial-data", data);
            */
          }
        });

        // Armazenar a conexão global
        global.serialConnection = port;
        resolve({ success: true, message: "Porta aberta com sucesso" });
      });
    });
  } catch (error) {
    console.error("Erro ao criar conexão serial:", error);
    return { success: false, message: error.message };
  }
});

// Fechar porta serial
ipcMain.handle("close-serial-port", async () => {
  console.log("Tentando fechar porta serial");
  try {
    if (global.serialConnection) {
      await global.serialConnection.close();
      global.serialConnection = null;
      console.log("Porta serial fechada com sucesso");
      return { success: true, message: "Porta fechada com sucesso" };
    } else {
      console.log("Nenhuma porta serial aberta para fechar");
      return { success: true, message: "Nenhuma porta estava aberta" };
    }
  } catch (error) {
    console.error("Erro ao fechar porta serial:", error);
    return { success: false, message: error.message };
  }
});

// Enviar comando pela porta serial
ipcMain.handle("send-serial-command", async (event, command) => {
  console.log("Tentando enviar comando serial:", command);
  try {
    if (!global.serialConnection) {
      return { success: false, message: "Porta serial não está aberta" };
    }

    // Converter string para buffer se necessário
    const data = typeof command === "string" ? Buffer.from(command) : command;

    // Criar uma promessa para controlar o envio
    return new Promise((resolve) => {
      global.serialConnection.write(data, (err) => {
        if (err) {
          console.error("Erro ao enviar comando:", err.message);
          resolve({ success: false, message: err.message });
          return;
        }

        console.log("Comando enviado com sucesso");
        resolve({ success: true, message: "Comando enviado" });
      });
    });
  } catch (error) {
    console.error("Erro ao enviar comando serial:", error);
    return { success: false, message: error.message };
  }
});

// Abrir URL em navegador externo
ipcMain.handle("open-external-url", async (event, url) => {
  console.log("Abrindo URL externa:", url);
  try {
    const { shell } = require("electron");
    await shell.openExternal(url);
    return { success: true, message: "URL aberta com sucesso" };
  } catch (error) {
    console.error("Erro ao abrir URL externa:", error);
    return { success: false, message: error.message };
  }
});

// Abrir URL em janela interna do Electron
ipcMain.handle("open-internal-window", async (event, { url, title }) => {
  console.log("Abrindo URL em janela interna:", url);
  try {
    const { BrowserWindow } = require("electron");

    // Criar uma nova janela
    const win = new BrowserWindow({
      width: 1024,
      height: 768,
      title: title || "Web Content",
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        sandbox: true,
      },
    });

    // Definir um user-agent moderno para sites como WhatsApp
    if (url.includes("whatsapp.com")) {
      // User agent de uma versão recente do Chrome
      win.webContents.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Habilitar recursos para o WhatsApp Web
      win.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              "Content-Security-Policy": ["*"],
            },
          });
        }
      );
    }
    // User agent moderno para Spotify e Netflix
    else if (url.includes("spotify.com") || url.includes("netflix.com")) {
      win.webContents.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
    }

    // Permitir que links dentro da página sejam abertos na mesma janela
    win.webContents.on("new-window", (e, url) => {
      e.preventDefault();
      win.loadURL("http://localhost:3000");
    });

    // Carregar a URL
    await win.loadURL(url);

    // Abrir DevTools em modo de desenvolvimento
    if (process.env.NODE_ENV === "development") {
      win.webContents.openDevTools();
    }

    return { success: true, message: "Janela aberta com sucesso" };
  } catch (error) {
    console.error("Erro ao abrir janela interna:", error);
    return { success: false, message: error.message };
  }
});

console.log("==================== ELECTRON INICIALIZADO ====================");
