import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database at:', dbPath);

    // 10 PRODUCTS
    const products = [
        { name: 'Soft Pinch Blush', brand: 'Rare Beauty', cost: 18, sellingPrice: 245, stock: 15, image: 'https://www.rarebeauty.com/cdn/shop/files/Soft-Pinch-Liquid-Blush-Joy-1_800x.jpg' },
        { name: 'Lip Oil Gloss', brand: 'Dior', cost: 35, sellingPrice: 380, stock: 8, image: 'https://images.clothesandfashion.net/makeup-skincare/dior-lip-glow-oil-001-pink.jpg' },
        { name: 'Peptide Lip Treatment', brand: 'Rhode', cost: 16, sellingPrice: 210, stock: 24, image: 'https://www.rhodeskin.com/cdn/shop/files/PLT_Unscented_1_1024x1024.jpg' },
        { name: 'Luminous Silk Foundation', brand: 'Armani', cost: 55, sellingPrice: 580, stock: 5, image: 'https://alessandrab.com/wp-content/uploads/2021/05/Giorgio-Armani-Luminous-Silk-Foundation-Review-Alessandra-B.jpg' },
        { name: 'Cloud Paint', brand: 'Glossier', cost: 20, sellingPrice: 260, stock: 12, image: 'https://images.clothesandfashion.net/makeup-skincare/glossier-cloud-paint-puff.jpg' },
        { name: 'Hollywood Flawless Filter', brand: 'Charlotte Tilbury', cost: 45, sellingPrice: 495, stock: 7, image: 'https://www.charlottetilbury.com/on/demandware.static/-/Sites-Master-Catalog/default/dw1b4e2a6d/images/product-images/fair-flawless-filter-packshot.jpg' },
        { name: 'Shape Tape Concealer', brand: 'Tarte', cost: 28, sellingPrice: 310, stock: 20, image: 'https://tartecosmetics.com/dw/image/v2/BBPW_PRD/on/demandware.static/-/Sites-master-catalog-tarte/default/dw0b4e2a6d/836/836-35N-medium-neutral.jpg' },
        { name: 'Supergoop Unseen Sunscreen', brand: 'Supergoop!', cost: 38, sellingPrice: 420, stock: 10, image: 'https://supergoop.com/cdn/shop/products/unseen-sunscreen-spf-40-1-7-oz_800x.jpg' },
        { name: 'Fenty Skin Fat Water', brand: 'Fenty Beauty', cost: 32, sellingPrice: 345, stock: 14, image: 'https://fentybeauty.com/cdn/shop/products/FENTY-SKIN-FAT-WATER-NIACINAMIDE-PORE-REFINING-TONER-SERUM_800x.jpg' },
        { name: 'Skin Fetish Highlighter', brand: 'Pat McGrath', cost: 50, sellingPrice: 540, stock: 4, image: 'https://www.patmcgrath.com/cdn/shop/products/Skin-Fetish-Highlighter-Trio_800x.jpg' }
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    // 10 CLIENTS
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
        await prisma.client.create({ data: c });
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
