# GlowyGt Desktop

App de escritorio para gestión de inventario, pedidos y clientes (Electron + Vite + React).

## Desarrollo

- **Electron (ventana desktop):** `npm run dev`
- **Navegador (API local):** `npm run dev:chrome` y abre http://localhost:5180

### Módulo nativo better-sqlite3

La app usa `better-sqlite3`, que debe compilarse para la versión de Node que usa Electron. Si ves un error del tipo *"The module was compiled against a different Node.js version"* o no se cargan productos/clientes:

1. Cierra la app GlowyGt y cualquier terminal con `npm run dev`.
2. En la carpeta del proyecto ejecuta: `npm run rebuild`
3. Vuelve a iniciar con `npm run dev`.

Tras hacer `npm install` (o al cambiar de versión de Node o Electron), conviene ejecutar `npm run rebuild` una vez.
