import 'dotenv/config';
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURACIÓN DE BASE DE DATOS (IMPORTANTE: Antes de cualquier otro import de DB)
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
process.env.DATABASE_URL = `file:${dbPath}`;
console.log('🚀 Main Process started. DB Path:', process.env.DATABASE_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#FFFDF9',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        title: "GlowyGt Desktop"
    });

    if (!app.isPackaged) {
        win.loadURL('http://localhost:5180');
    } else {
        win.loadFile(path.join(__dirname, 'dist/index.html'));
    }
}

app.whenReady().then(async () => {
    console.log('⚙️ Initializing Database Handlers...');

    try {
        const { ensureSchema, setupDatabaseHandlers, seedDatabase } = await import('./database.js');

        ensureSchema();
        setupDatabaseHandlers();
        console.log('📡 Handlers registrados correctamente');

        await seedDatabase();
        console.log('✅ Seeding check complete.');
    } catch (e) {
        console.error('❌ Error cargando database handlers:', e.message);
    }

    createWindow();
});