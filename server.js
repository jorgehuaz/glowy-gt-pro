/**
 * Servidor API para usar la app en Chrome (misma base de datos que Electron).
 * Ejecutar: npm run dev:chrome
 * Luego abrir en Chrome: http://localhost:5180
 */
import express from 'express';
import cors from 'cors';
import { getPrisma } from './server-db.js';

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors({ origin: ['http://localhost:5180', 'http://127.0.0.1:5180'] }));
app.use(express.json());

// --- PRODUCTOS ---
app.get('/api/products', async (req, res) => {
    try {
        const p = await getPrisma();
        const list = await p.product.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const p = await getPrisma();
        const data = req.body;
        const product = await p.product.create({
            data: {
                name: data.name,
                brand: data.brand,
                cost: parseFloat(data.cost) || 0,
                sellingPrice: parseFloat(data.sellingPrice) || 0,
                stock: parseInt(data.stock, 10) || 0,
                image: data.image || null,
            },
        });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const p = await getPrisma();
        const data = req.body;
        const id = req.params.id;
        if (!id) return res.status(400).json({ error: 'ID de producto requerido' });
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
        if (Object.keys(updateData).length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' });
        const product = await p.product.update({
            where: { id },
            data: updateData,
        });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const p = await getPrisma();
        await p.orderItem.deleteMany({ where: { productId: req.params.id } });
        await p.product.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/products/bulk', async (req, res) => {
    try {
        const p = await getPrisma();
        const items = req.body;
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
                        image: row.image ? String(row.image).trim() : null,
                    },
                });
                created.push(product);
            } catch (e) {
                errors.push({ index: i + 1, message: e.message });
            }
        }
        res.json({ created: created.length, errors });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- CLIENTES ---
app.get('/api/clients', async (req, res) => {
    try {
        const p = await getPrisma();
        const list = await p.client.findMany({ orderBy: { name: 'asc' } });
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const p = await getPrisma();
        const data = req.body;
        const client = await p.client.create({
            data: {
                name: data.name,
                nit: data.nit || null,
                phone: data.phone || null,
                type: data.type || 'Nuevo',
            },
        });
        res.json(client);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- PEDIDOS ---
app.get('/api/orders', async (req, res) => {
    try {
        const p = await getPrisma();
        const list = await p.order.findMany({
            include: {
                client: true,
                items: { include: { product: true } },
            },
            orderBy: { date: 'desc' },
        });
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const p = await getPrisma();
        const { clientId, items, total, status } = req.body;
        const order = await p.order.create({
            data: {
                clientId,
                total: parseFloat(total) || 0,
                status: status || 'Pendiente',
                items: {
                    create: (items || []).map((item) => ({
                        productId: item.productId,
                        quantity: parseInt(item.quantity, 10) || 0,
                        price: parseFloat(item.price) || 0,
                    })),
                },
            },
        });
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/api/orders/:id', async (req, res) => {
    try {
        const p = await getPrisma();
        const { status, statusNote } = req.body;
        const updateData = {};
        if (status != null) updateData.status = status;
        if (statusNote !== undefined) updateData.statusNote = statusNote || null;
        if (Object.keys(updateData).length === 0) {
            const order = await p.order.findUnique({ where: { id: req.params.id } });
            return res.json(order);
        }
        const order = await p.order.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- DROPS (Drops & Logística) ---
app.get('/api/drops', async (req, res) => {
    try {
        const p = await getPrisma();
        const list = await p.drop.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/drops', async (req, res) => {
    try {
        const p = await getPrisma();
        const data = req.body;
        const drop = await p.drop.create({
            data: {
                title: String(data.title || '').trim(),
                stage: data.stage || 'por_pedir',
                notes: data.notes ? String(data.notes).trim() : null,
            },
        });
        res.json(drop);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/api/drops/:id', async (req, res) => {
    try {
        const p = await getPrisma();
        const data = req.body;
        const updateData = {};
        if (data?.title !== undefined) updateData.title = String(data.title).trim();
        if (data?.stage !== undefined) updateData.stage = data.stage;
        if (data?.notes !== undefined) updateData.notes = data.notes ? String(data.notes).trim() : null;
        if (Object.keys(updateData).length === 0) {
            const drop = await p.drop.findUnique({ where: { id: req.params.id } });
            return res.json(drop);
        }
        const drop = await p.drop.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json(drop);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/drops/:id', async (req, res) => {
    try {
        const p = await getPrisma();
        await p.drop.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API GlowyGt en http://localhost:${PORT}`);
    console.log(`   Abre Chrome en http://localhost:5180 (después de ejecutar Vite).`);
});
