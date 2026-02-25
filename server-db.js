/**
 * Conexión a la base de datos para el servidor HTTP (Chrome / modo web).
 * Usa la misma SQLite (prisma/dev.db) que la app Electron: ruta relativa al archivo del proyecto.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let prisma;

export async function getPrisma() {
    if (!prisma) {
        const dbPath = path.join(__dirname, 'prisma', 'dev.db');
        const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;
        console.log('🗄️ [API] Conectando a:', dbPath);
        const adapter = new PrismaBetterSqlite3({ url: dbUrl });
        prisma = new PrismaClient({ adapter });
        await prisma.$connect();
        console.log('✅ [API] SQLite conectado.');
    }
    return prisma;
}
