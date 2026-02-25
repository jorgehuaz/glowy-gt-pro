import { ipcMain, app } from 'electron';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

let prisma;

/** Carpeta del proyecto (donde está main.js / database.js). Así la base siempre está en el mismo sitio. */
function getAppRoot() {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    return dir;
}

/**
 * Ruta de la base de datos:
 * - En desarrollo (npm run dev): prisma/dev.db junto al código del proyecto.
 * - En app instalada (.exe): AppData/Roaming/glowy-gt-pro/database.db
 */
function getDatabasePath() {
    const isDev = !app.isPackaged;
    if (isDev) {
        // En desarrollo: siempre la carpeta del proyecto (donde está database.js), sin depender de process.cwd()
        const dbPath = path.join(getAppRoot(), 'prisma', 'dev.db');
        const prismaDir = path.dirname(dbPath);
        if (!fs.existsSync(prismaDir)) {
            fs.mkdirSync(prismaDir, { recursive: true });
        }
        return dbPath;
    }
    const userDataPath = path.join(app.getPath('userData'), 'database.db');
    const dir = path.dirname(userDataPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return userDataPath;
}

/**
 * En desarrollo, si prisma/dev.db no existe pero sí existe la base en userData, la copiamos a prisma para recuperar datos.
 */
function ensureDevDbFromUserDataIfNeeded() {
    const isDev = !app.isPackaged;
    if (!isDev) return;
    const root = getAppRoot();
    const devPath = path.join(root, 'prisma', 'dev.db');
    const userDbPath = path.join(app.getPath('userData'), 'database.db');
    try {
        if (!fs.existsSync(devPath) && fs.existsSync(userDbPath)) {
            const prismaDir = path.dirname(devPath);
            if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir, { recursive: true });
            fs.copyFileSync(userDbPath, devPath);
            console.log('📂 Datos recuperados: se copió la base de userData a prisma/dev.db');
        }
    } catch (e) {
        console.warn('⚠️ No se pudo copiar base de userData:', e.message);
    }
}

/**
 * Aplica el esquema Prisma a la base de datos que usa la app (crea/actualiza tablas).
 * Así la base en la ruta mostrada en el panel siempre tiene las tablas correctas.
 */
export function ensureSchema() {
    ensureDevDbFromUserDataIfNeeded();
    const dbPath = getDatabasePath();
    const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;
    const root = getAppRoot();
    try {
        execSync('npx prisma db push', {
            cwd: root,
            stdio: 'pipe',
            env: { ...process.env, DATABASE_URL: dbUrl },
        });
        console.log('📐 Esquema aplicado a la base de datos.');
    } catch (e) {
        console.warn('⚠️ No se pudo aplicar el esquema (prisma db push):', e.message);
    }
}

/**
 * Inicializa y retorna la instancia de PrismaClient.
 * Prisma 7 requiere un driver adapter; usamos @prisma/adapter-better-sqlite3.
 */
async function getPrisma() {
    if (!prisma) {
        ensureDevDbFromUserDataIfNeeded();
        const dbPath = getDatabasePath();
        const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;
        console.log(`🗄️ Conectando a la base de datos: ${dbPath}`);

        const adapter = new PrismaBetterSqlite3({ url: dbUrl });
        prisma = new PrismaClient({ adapter });

        try {
            await prisma.$connect();
            console.log('✅ Prisma conectado a SQLite.');
        } catch (e) {
            console.error('❌ Error al conectar Prisma:', e);
            throw e;
        }
    }
    return prisma;
}

/**
 * Configura todos los manejadores IPC para la comunicación entre el 
 * Proceso de Renderizado y el Proceso Principal.
 */
export function setupDatabaseHandlers() {
    console.log('📡 Registrando IPC handlers para la base de datos...');

    ipcMain.handle('get-database-path', () => getDatabasePath());

    // --- PRODUCTOS ---
    ipcMain.handle('get-products', async () => {
        const p = await getPrisma();
        return await p.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
    });

    ipcMain.handle('create-product', async (_event, data) => {
        const p = await getPrisma();
        return await p.product.create({
            data: {
                name: data.name,
                brand: data.brand,
                cost: parseFloat(data.cost) || 0,
                sellingPrice: parseFloat(data.sellingPrice) || 0,
                stock: parseInt(data.stock) || 0,
                image: data.image
            }
        });
    });

    ipcMain.handle('update-product', async (_event, productId, data) => {
        if (!productId || typeof productId !== 'string') {
            throw new Error('update-product: productId inválido');
        }
        const p = await getPrisma();
        const name = data?.name != null ? String(data.name).trim() : undefined;
        const brand = data?.brand != null ? String(data.brand).trim() : undefined;
        const cost = data?.cost != null ? parseFloat(data.cost) : undefined;
        const sellingPrice = data?.sellingPrice != null ? parseFloat(data.sellingPrice) : undefined;
        const stock = data?.stock != null ? parseInt(String(data.stock), 10) : undefined;
        const image = data?.image !== undefined ? (data.image ? String(data.image).trim() : null) : undefined;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (brand !== undefined) updateData.brand = brand;
        if (cost !== undefined && !Number.isNaN(cost)) updateData.cost = cost;
        if (sellingPrice !== undefined && !Number.isNaN(sellingPrice)) updateData.sellingPrice = sellingPrice;
        if (stock !== undefined && !Number.isNaN(stock)) updateData.stock = stock;
        if (image !== undefined) updateData.image = image;
        if (Object.keys(updateData).length === 0) {
            throw new Error('update-product: no hay campos para actualizar');
        }
        return await p.product.update({
            where: { id: productId },
            data: updateData,
        });
    });

    ipcMain.handle('delete-product', async (_event, productId) => {
        const p = await getPrisma();
        await p.orderItem.deleteMany({ where: { productId } });
        return await p.product.delete({ where: { id: productId } });
    });

    ipcMain.handle('create-products-bulk', async (_event, items) => {
        const p = await getPrisma();
        const created = [];
        const errors = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const row = items[i];
                const product = await p.product.create({
                    data: {
                        name: String(row.name || '').trim(),
                        brand: String(row.brand || '').trim(),
                        cost: parseFloat(row.cost) || 0,
                        sellingPrice: parseFloat(row.sellingPrice) || 0,
                        stock: parseInt(row.stock, 10) || 0,
                        image: row.image ? String(row.image).trim() : null
                    }
                });
                created.push(product);
            } catch (e) {
                errors.push({ index: i + 1, row: items[i], message: e.message });
            }
        }
        return { created: created.length, errors };
    });

    // --- CLIENTES ---
    ipcMain.handle('get-clients', async () => {
        const p = await getPrisma();
        return await p.client.findMany({
            orderBy: { name: 'asc' }
        });
    });

    ipcMain.handle('create-client', async (_event, data) => {
        const p = await getPrisma();
        return await p.client.create({
            data: {
                name: data.name,
                nit: data.nit,
                phone: data.phone,
                type: data.type || "Nuevo"
            }
        });
    });

    // --- ÓRDENES ---
    ipcMain.handle('get-orders', async () => {
        const p = await getPrisma();
        return await p.order.findMany({
            include: {
                client: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
    });

    ipcMain.handle('create-order', async (_event, data) => {
        const p = await getPrisma();
        const { clientId, items, total, status } = data;
        return await p.order.create({
            data: {
                clientId,
                total: parseFloat(total) || 0,
                status: status || "Pendiente",
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: parseInt(item.quantity) || 0,
                        price: parseFloat(item.price) || 0
                    }))
                }
            }
        });
    });

    ipcMain.handle('update-order', async (_event, orderId, data) => {
        const p = await getPrisma();
        const { status, statusNote } = data;
        const updateData = {};
        if (status != null) updateData.status = status;
        if (statusNote !== undefined) updateData.statusNote = statusNote || null;
        if (Object.keys(updateData).length === 0) return await p.order.findUnique({ where: { id: orderId } });
        return await p.order.update({
            where: { id: orderId },
            data: updateData,
        });
    });

    // --- DROPS (Drops & Logística) ---
    ipcMain.handle('get-drops', async () => {
        const p = await getPrisma();
        if (!p.drop) {
            console.warn('Prisma client missing Drop model. Run: npx prisma generate');
            return [];
        }
        return await p.drop.findMany({
            orderBy: { createdAt: 'desc' }
        });
    });

    ipcMain.handle('create-drop', async (_event, data) => {
        const p = await getPrisma();
        if (!p.drop) throw new Error('Modelo Drop no disponible. Ejecuta: npx prisma generate');
        return await p.drop.create({
            data: {
                title: String(data.title || '').trim(),
                stage: data.stage || 'por_pedir',
                notes: data.notes ? String(data.notes).trim() : null
            }
        });
    });

    ipcMain.handle('update-drop', async (_event, dropId, data) => {
        if (!dropId || typeof dropId !== 'string') throw new Error('update-drop: dropId inválido');
        const p = await getPrisma();
        if (!p.drop) throw new Error('Modelo Drop no disponible. Ejecuta: npx prisma generate');
        const updateData = {};
        if (data?.title !== undefined) updateData.title = String(data.title).trim();
        if (data?.stage !== undefined) updateData.stage = data.stage;
        if (data?.notes !== undefined) updateData.notes = data.notes ? String(data.notes).trim() : null;
        if (Object.keys(updateData).length === 0) return await p.drop.findUnique({ where: { id: dropId } });
        return await p.drop.update({
            where: { id: dropId },
            data: updateData,
        });
    });

    ipcMain.handle('delete-drop', async (_event, dropId) => {
        const p = await getPrisma();
        if (!p.drop) throw new Error('Modelo Drop no disponible. Ejecuta: npx prisma generate');
        return await p.drop.delete({ where: { id: dropId } });
    });
}

/**
 * Llena la base de datos con datos iniciales si está vacía.
 */
export async function seedDatabase() {
    const p = await getPrisma();

    try {
        const productCount = await p.product.count();
        if (productCount > 0) {
            console.log('🌱 La base de datos ya tiene datos. Saltando seeding...');
            return;
        }

        console.log('🌱 Iniciando seeding de la base de datos...');

        const products = [
            { name: 'Soft Pinch Blush', brand: 'Rare Beauty', cost: 18, sellingPrice: 245, stock: 15, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400' },
            { name: 'Lip Oil Gloss', brand: 'Dior', cost: 35, sellingPrice: 380, stock: 8, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Peptide Lip Treatment', brand: 'Rhode', cost: 16, sellingPrice: 210, stock: 24, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' },
            { name: 'Luminous Silk Foundation', brand: 'Armani', cost: 55, sellingPrice: 580, stock: 5, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' },
            { name: 'Cloud Paint', brand: 'Glossier', cost: 20, sellingPrice: 260, stock: 12, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' },
            { name: 'Hollywood Flawless Filter', brand: 'Charlotte Tilbury', cost: 45, sellingPrice: 495, stock: 7, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' },
            { name: 'Shape Tape Concealer', brand: 'Tarte', cost: 28, sellingPrice: 310, stock: 20, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' },
            { name: 'Supergoop Unseen Sunscreen', brand: 'Supergoop!', cost: 38, sellingPrice: 420, stock: 10, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' },
            { name: 'Fenty Skin Fat Water', brand: 'Fenty Beauty', cost: 32, sellingPrice: 345, stock: 14, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Skin Fetish Highlighter', brand: 'Pat McGrath', cost: 50, sellingPrice: 540, stock: 4, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400' },
            { name: 'Dewy Blush Liquid', brand: 'Rare Beauty', cost: 22, sellingPrice: 268, stock: 11, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400' },
            { name: 'Lip Balm Tinted', brand: 'Summer Fridays', cost: 14, sellingPrice: 185, stock: 18, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Bronzer Stick', brand: 'Milk Makeup', cost: 26, sellingPrice: 298, stock: 9, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' },
            { name: 'Setting Spray', brand: 'Urban Decay', cost: 34, sellingPrice: 365, stock: 13, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' },
            { name: 'Brow Pencil', brand: 'Anastasia', cost: 24, sellingPrice: 275, stock: 22, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400' },
            { name: 'Mascara Volume', brand: 'Too Faced', cost: 28, sellingPrice: 312, stock: 16, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Lip Liner Set', brand: 'MAC', cost: 20, sellingPrice: 248, stock: 14, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' },
            { name: 'Vitamin C Serum', brand: 'Drunk Elephant', cost: 72, sellingPrice: 620, stock: 6, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' },
            { name: 'Hydrating Mist', brand: 'Caudalie', cost: 18, sellingPrice: 228, stock: 20, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400' },
            { name: 'Eyeshadow Palette', brand: 'Huda Beauty', cost: 58, sellingPrice: 545, stock: 8, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' }
        ];

        for (const pr of products) {
            await p.product.create({ data: pr });
        }

        const clients = [
            { name: 'Adriana Morales', nit: '1234567-8', phone: '5544-3322', type: 'VIP' },
            { name: 'Carlos Figueroa', nit: '8765432-1', phone: '4433-2211', type: 'Frecuente' },
            { name: 'Lucía Méndez', nit: '5647382-9', phone: '3322-1100', type: 'Nuevo' },
            { name: 'Mariana Reyes', nit: '2233445-6', phone: '5566-7788', type: 'Frecuente' },
            { name: 'Sofía López', nit: '9988776-5', phone: '4455-6677', type: 'VIP' },
            { name: 'Isabella García', nit: '1122334-4', phone: '3344-5566', type: 'Nuevo' },
            { name: 'Valeria Ortiz', nit: '6677889-0', phone: '2233-4455', type: 'Frecuente' },
            { name: 'Gabriela Ruíz', nit: '4455667-8', phone: '1122-3344', type: 'VIP' },
            { name: 'Camila Sosa', nit: '7766554-3', phone: '6677-8899', type: 'Nuevo' },
            { name: 'Daniela Meza', nit: '3322114-5', phone: '7788-9900', type: 'Frecuente' }
        ];

        for (const c of clients) {
            await p.client.create({ data: c });
        }
        console.log('✅ Seeding completado con éxito!');
    } catch (e) {
        console.error('❌ Error durante el proceso de seeding:', e);
    }
}