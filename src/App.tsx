import React, { useState, useEffect } from 'react';
import { db, connectionMode } from './lib/api';
import {
    LayoutDashboard,
    ShoppingBag,
    Calculator,
    Package,
    User,
    Settings,
    Search,
    Bell,
    CheckCircle2,
    Clock,
    ArrowRight,
    Users,
    Plus,
    X,
    TrendingUp,
    FileText,
    ExternalLink,
    Trash2,
    List,
    LayoutGrid,
    Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export default function App() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showImportProductsModal, setShowImportProductsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [inventoryView, setInventoryView] = useState<'grid' | 'list' | 'large'>('grid');
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [showAddOrderModal, setShowAddOrderModal] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const [products, setProducts] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [drops, setDrops] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dbPath, setDbPath] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        db.getDatabasePath().then((p) => setDbPath(p || null));
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const [p, c, o, d] = await Promise.all([
                db.getProducts(),
                db.getClients(),
                db.getOrders(),
                db.getDrops()
            ]);
            setProducts(Array.isArray(p) ? p : []);
            setClients(Array.isArray(c) ? c : []);
            setOrders(Array.isArray(o) ? o : []);
            setDrops(Array.isArray(d) ? d : []);
        } catch (error) {
            console.error("Error fetching data:", error);
            const message = error instanceof Error ? error.message : String(error);
            setFetchError(message);
            setProducts([]);
            setClients([]);
            setOrders([]);
            setDrops([]);
        } finally {
            setIsLoading(false);
        }
    };
    const [notifications, setNotifications] = useState([
        { id: 1, text: "Nuevo pedido de Rare Beauty recibido", time: "Hace 5m" },
        { id: 2, text: "Stock bajo en Peptide Lip Treatment", time: "Hace 1h" }
    ]);

    const addNotification = (text: string) => {
        setNotifications([{ id: Date.now(), text, time: "Ahora" }, ...notifications].slice(0, 5));
    };

    const handleGenerateReport = () => {
        setIsGeneratingReport(true);
        setTimeout(() => {
            setIsGeneratingReport(false);
            addNotification("Reporte mensual generado con éxito (PDF listo)");
            // Simulate PDF download
            const blob = new Blob(["Simulated PDF Content - GlowyGt Report"], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reporte_GlowyGt_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
        }, 2000);
    };

    return (
        <div className="flex h-screen bg-brand-cream overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-64 border-r border-stone-100 flex flex-col bg-white">
                <div className="p-8">
                    <h1 className="text-2xl font-serif font-semibold tracking-tight text-brand-dark">
                        GlowyGt<span className="text-brand-pink">.</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem
                        icon={<Package size={20} />}
                        label="Inventario"
                        active={activeTab === 'inventory'}
                        onClick={() => setActiveTab('inventory')}
                    />
                    <NavItem
                        icon={<Calculator size={20} />}
                        label="Calculadora"
                        active={activeTab === 'calculator'}
                        onClick={() => setActiveTab('calculator')}
                    />
                    <NavItem
                        icon={<ShoppingBag size={20} />}
                        label="Pedidos"
                        active={activeTab === 'orders'}
                        onClick={() => setActiveTab('orders')}
                    />
                    <NavItem
                        icon={<TrendingUp size={20} />}
                        label="Drops"
                        active={activeTab === 'drops'}
                        onClick={() => setActiveTab('drops')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Clientes"
                        active={activeTab === 'clients'}
                        onClick={() => setActiveTab('clients')}
                    />
                    <div className="pt-4 pb-2 px-4">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cuenta</span>
                    </div>
                    <NavItem
                        icon={<User size={20} />}
                        label="Perfil"
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label="Ajustes"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>
                <div className="p-4 border-t border-stone-100 bg-stone-50/50">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Base de datos</p>
                    <p className="text-xs font-mono text-stone-600 break-all leading-tight" title={dbPath || 'Cargando...'}>
                        {dbPath || '…'}
                    </p>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* HEADER */}
                <header className="h-16 bg-white border-bottom border-stone-100 px-8 flex items-center justify-between sticky top-0 z-10">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar productos, marcas..."
                            className="w-full bg-stone-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand-pink outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-brand-pink/10 text-brand-pink' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border border-white"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <NotificationPanel
                                        notifications={notifications}
                                        onClose={() => setShowNotifications(false)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-brand-pink flex items-center justify-center text-white text-xs font-bold font-sans">
                            GT
                        </div>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar">
                    {!isLoading && products.length === 0 && clients.length === 0 && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                            <p className="font-medium mb-1">No se cargaron productos ni clientes.</p>
                            <p className="text-xs mb-2">
                                Modo: {connectionMode === 'electron' ? 'Electron (base local)' : 'Navegador (API en puerto 3000)'}.
                                {connectionMode === 'api' && <> Asegúrate de ejecutar <code className="bg-amber-100 px-1 rounded">npm run dev:chrome</code> o que el servidor esté en marcha.</>}
                            </p>
                            {fetchError && (
                                <p className="text-xs font-medium text-amber-900 mb-2">Error: {fetchError}</p>
                            )}
                            {dbPath && <p className="text-xs font-mono text-amber-700 break-all mb-2">Base de datos: {dbPath}</p>}
                            <p className="text-xs">Abre la terminal en la carpeta del proyecto y ejecuta: <code className="bg-amber-100 px-1 rounded">npx prisma db push</code>. Luego reinicia la app.</p>
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-3xl font-serif text-brand-dark mb-1">Tu Resumen</h2>
                                        <p className="text-stone-500">Hola, GlowyGt. Aquí tienes el estado actual de tu negocio.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setActiveTab('calculator')}
                                            className="bg-white border border-stone-200 text-stone-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-50 transition-all flex items-center gap-2"
                                        >
                                            <Calculator size={16} /> Ver Margen Real
                                        </button>
                                        <button
                                            onClick={handleGenerateReport}
                                            disabled={isGeneratingReport}
                                            className="bg-brand-dark text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            {isGeneratingReport ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : <FileText size={16} />}
                                            {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
                                        </button>
                                    </div>
                                </div>

                                {/* STATS GRID - datos reales y clicables */}
                                {(() => {
                                    const now = new Date();
                                    const thisMonth = now.getMonth();
                                    const thisYear = now.getFullYear();
                                    const salesThisMonth = orders
                                        .filter((o: any) => {
                                            const d = new Date(o.date);
                                            const s = o.status;
                                            return (d.getMonth() === thisMonth && d.getFullYear() === thisYear) && (s === 'Completado' || s === 'Pagado' || s === 'Entregado');
                                        })
                                        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
                                    const totalUnits = products.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
                                    const brandsCount = new Set(products.map((p: any) => p.brand)).size;
                                    const pendingCount = orders.filter((o: any) => o.status === 'Pendiente').length;
                                    const recentOrders = orders.slice(0, 5);
                                    return (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <StatCard
                                                    label="Ventas este Mes"
                                                    value={`Q. ${salesThisMonth.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                                                    trend={orders.filter((o: any) => ['Completado', 'Pagado', 'Entregado'].includes(o.status)).length ? `${orders.filter((o: any) => ['Completado', 'Pagado', 'Entregado'].includes(o.status)).length} pedidos` : 'Sin ventas'}
                                                    icon={<ShoppingBag className="text-brand-pink" size={24} />}
                                                    onClick={() => setActiveTab('orders')}
                                                />
                                                <StatCard
                                                    label="Productos en Stock"
                                                    value={`${totalUnits} Unidades`}
                                                    trend={brandsCount ? `${brandsCount} marcas` : 'Sin productos'}
                                                    icon={<Package className="text-brand-pink" size={24} />}
                                                    onClick={() => setActiveTab('inventory')}
                                                />
                                                <StatCard
                                                    label="Pedidos Pendientes"
                                                    value={`${pendingCount} Pedidos`}
                                                    trend={pendingCount ? 'Por entregar' : 'Al día'}
                                                    icon={<Clock className="text-brand-pink" size={24} />}
                                                    onClick={() => setActiveTab('orders')}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                                                    <h3 className="text-xl font-serif text-brand-dark mb-6">Pedidos Recientes</h3>
                                                    <div className="space-y-6">
                                                        {recentOrders.length ? recentOrders.map((order: any) => (
                                                            <button
                                                                key={order.id}
                                                                type="button"
                                                                onClick={() => setActiveTab('orders')}
                                                                className="w-full flex items-center justify-between py-3 border-b border-stone-50 last:border-0 hover:bg-stone-50/50 rounded-xl -mx-2 px-2 text-left transition-colors"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-full bg-brand-cream border border-stone-100 flex items-center justify-center text-brand-pink text-xs font-bold">
                                                                        {order.client?.name?.[0] || '?'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-stone-900">{order.client?.name || 'Cliente'}</p>
                                                                        <p className="text-xs text-stone-500">{order.items?.length || 0} productos · {new Date(order.date).toLocaleDateString('es-GT')}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-bold text-stone-900">Q. {order.total?.toLocaleString('es-GT') ?? 0}</p>
                                                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${['Completado', 'Pagado', 'Entregado'].includes(order.status) ? 'text-green-600' : 'text-amber-600'}`}>{order.status === 'Pagado' || order.status === 'Entregado' ? 'Completado' : order.status}</p>
                                                                </div>
                                                            </button>
                                                        )) : (
                                                            <p className="text-sm text-stone-400 italic py-4">No hay pedidos recientes.</p>
                                                        )}
                                                    </div>
                                                </div>

                                    {/* QUICK ACTIONS */}
                                    <div className="bg-brand-pink/5 p-8 rounded-3xl border border-brand-pink/10 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-serif text-brand-dark mb-3">Acciones Rápidas</h3>
                                            <p className="text-stone-500 text-sm mb-6">Herramientas optimizadas para tu flujo diario.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <QuickAction theme="dark" label="Nuevo Drop de la Semana" onClick={() => setActiveTab('drops')} />
                                            <QuickAction theme="pink" label="Actualizar Tasa de Cambio" onClick={() => setActiveTab('calculator')} />
                                        </div>
                                    </div>
                                </div>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        )}

                        {activeTab === 'inventory' && (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-end">
                                    <div className="min-w-0">
                                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-1 truncate">Inventario Real</h2>
                                        <p className="text-stone-500 text-sm truncate">Gestiona tus productos en stock y bajo pedido.</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest w-full sm:w-auto">Vista:</span>
                                        <div className="flex rounded-xl border border-stone-200 p-0.5 bg-stone-50 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setInventoryView('list')}
                                                title="Lista"
                                                className={`p-2.5 rounded-lg transition-all ${inventoryView === 'list' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}
                                            >
                                                <List size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setInventoryView('grid')}
                                                title="Cuadrícula"
                                                className={`p-2.5 rounded-lg transition-all ${inventoryView === 'grid' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}
                                            >
                                                <LayoutGrid size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setInventoryView('large')}
                                                title="Iconos grandes"
                                                className={`p-2.5 rounded-lg transition-all ${inventoryView === 'large' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}
                                            >
                                                <Square size={18} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setShowImportProductsModal(true)}
                                            className="bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-stone-50 transition-transform active:scale-95 flex items-center gap-2 flex-shrink-0"
                                        >
                                            <FileText size={18} /> Importar CSV
                                        </button>
                                        <button
                                            onClick={() => setShowAddProductModal(true)}
                                            className="bg-brand-dark text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-transform active:scale-95 flex items-center gap-2 flex-shrink-0"
                                        >
                                            <Plus size={18} /> Agregar Producto
                                        </button>
                                {products.length === 0 && !isLoading && (
                                    <div className="py-20 text-center text-stone-400 italic">No hay productos en el inventario.</div>
                                )}
                                    </div>
                                </div>

                                {products.length > 0 && inventoryView === 'grid' && (
                                    <div className="grid grid-cols-1 min-w-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                        {products.map((product: any) => (
                                            <div key={product.id} className="min-w-0">
                                                <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {products.length > 0 && inventoryView === 'list' && (
                                    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                                        <div className="divide-y divide-stone-50">
                                            {products.map((product: any) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-stone-50/80 transition-colors text-left"
                                                >
                                                    <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0">
                                                        <img src={product.image || 'https://via.placeholder.com/100?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-serif font-bold text-brand-dark truncate">{product.name}</p>
                                                        <p className="text-xs text-brand-pink uppercase tracking-widest font-bold">{product.brand}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-sm font-bold text-stone-900">Q. {product.sellingPrice}</p>
                                                        <p className="text-[10px] text-stone-500">{product.stock} en stock</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {product.stock > 0 ? 'Stock' : 'Bajo pedido'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {products.length > 0 && inventoryView === 'large' && (
                                    <div className="grid grid-cols-1 min-w-0 lg:grid-cols-2 gap-6 sm:gap-8">
                                        {products.map((product: any) => (
                                            <div key={product.id} className="min-w-0">
                                                <ProductCard product={product} onClick={() => setSelectedProduct(product)} size="large" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'orders' && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-3xl font-serif text-brand-dark mb-1">Gestión de Pedidos</h2>
                                        <p className="text-stone-500">Administra las compras y entregas de tus clientes.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddOrderModal(true)}
                                        className="bg-brand-dark text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-transform active:scale-95 flex items-center gap-2"
                                    >
                                        <Plus size={18} /> Nuevo Pedido
                                    </button>
                                </div>
                                <OrdersModule orders={orders} onOrderUpdated={fetchData} />
                            </motion.div>
                        )}

                        {activeTab === 'calculator' && (
                            <motion.div
                                key="calculator"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-2xl"
                            >
                                <div className="mb-10">
                                    <h2 className="text-3xl font-serif text-brand-dark mb-1">Calculadora de Importación</h2>
                                    <p className="text-stone-500">Calcula el precio final en Quetzales incluyendo impuestos y courier.</p>
                                </div>
                                <CalculatorModule />
                            </motion.div>
                        )}

                        {activeTab === 'clients' && (
                            <motion.div
                                key="clients"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h2 className="text-3xl font-serif text-brand-dark mb-1">Mis Clientes</h2>
                                        <p className="text-stone-500">Gestiona tu base de datos de compradores y sus preferencias.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddClientModal(true)}
                                        className="bg-brand-dark text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-transform active:scale-95 flex items-center gap-2"
                                    >
                                        <Plus size={18} /> Nuevo Cliente
                                    </button>
                                </div>
                                <ClientsModule clients={clients} />
                            </motion.div>
                        )}

                        {activeTab === 'drops' && (
                            <motion.div
                                key="drops"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="mb-8">
                                    <h2 className="text-3xl font-serif text-brand-dark mb-1">Drops & Logística</h2>
                                    <p className="text-stone-500">Seguimiento de pedidos desde Miami hasta tus manos.</p>
                                </div>
                                <DropsModule drops={drops} onDropsUpdated={fetchData} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {activeTab === 'inventory' && products.length === 0 && !isLoading && (
                        <div className="py-20 text-center text-stone-400 italic">No hay productos en el inventario.</div>
                    )}
                </div>

                {/* MODALS */}
                <AnimatePresence>
                    {showAddProductModal && (
                        <AddProductModal onClose={() => { setShowAddProductModal(false); fetchData(); }} />
                    )}
                    {showImportProductsModal && (
                        <ImportProductsModal onClose={() => { setShowImportProductsModal(false); fetchData(); }} />
                    )}
                    {selectedProduct && (
                        <ProductDetailModal
                            product={selectedProduct}
                            onClose={() => { setSelectedProduct(null); fetchData(); }}
                        />
                    )}
                    {showAddClientModal && (
                        <AddClientModal
                            onClose={() => setShowAddClientModal(false)}
                            onSaved={async () => {
                                await fetchData();
                                setShowAddClientModal(false);
                            }}
                        />
                    )}
                    {showAddOrderModal && (
                        <AddOrderModal onClose={() => { setShowAddOrderModal(false); fetchData(); }} products={products} clients={clients} />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function StatCard({ label, value, trend, icon, onClick }: { label: string, value: string, trend: string, icon: any, onClick?: () => void }) {
    const Wrapper = onClick ? 'button' : 'div';
    return (
        <Wrapper
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow text-left w-full font-card ${onClick ? 'cursor-pointer hover:border-brand-pink/20 active:scale-[0.99]' : ''}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-cream rounded-2xl">
                    {icon}
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{trend}</span>
            </div>
            <p className="text-stone-500 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-brand-dark">{value}</p>
        </Wrapper>
    );
}

function QuickAction({ label, theme, onClick }: { label: string, theme: 'dark' | 'pink' | 'light', onClick?: () => void }) {
    const styles = {
        dark: "bg-brand-dark text-white border-brand-dark hover:bg-stone-800",
        pink: "bg-brand-pink text-white border-brand-pink hover:bg-[#c4929d]",
        light: "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
    };

    return (
        <button
            onClick={onClick}
            className={`w-full py-4 px-6 rounded-2xl border font-medium text-sm flex items-center justify-between transition-all active:scale-[0.98] ${styles[theme]}`}
        >
            {label}
            <ArrowRight size={18} />
        </button>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                ? 'bg-brand-pink text-white shadow-md shadow-brand-pink/20'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

function ProductCard({ product, onClick, size = 'default' }: { product: any; onClick?: () => void; size?: 'default' | 'large' }) {
    const isLarge = size === 'large';
    return (
        <div
            role={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`bg-white group border border-stone-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-stone-200/40 transition-all duration-300 w-full min-w-0 ${onClick ? 'cursor-pointer' : ''} ${isLarge ? 'flex flex-col md:flex-row' : ''}`}
        >
            <div className={`relative overflow-hidden bg-stone-50 ${isLarge ? 'aspect-[4/3] md:aspect-auto md:w-80 md:min-h-[280px] flex-shrink-0' : 'aspect-[4/5]'}`}>
                <img
                    src={product.image || 'https://via.placeholder.com/400x500?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border ${product.stock > 0
                        ? 'bg-white/80 border-white text-brand-dark'
                        : 'bg-brand-dark/80 border-stone-800 text-white'
                        }`}>
                        {product.stock > 0 ? 'Stock Local' : 'Bajo Pedido'}
                    </span>
                </div>
            </div>
            <div className={`p-5 ${isLarge ? 'flex-1 flex flex-col justify-center md:p-8' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">{product.brand}</span>
                    <span className={`font-semibold text-stone-900 ${isLarge ? 'text-lg' : 'text-xs'}`}>Q{product.sellingPrice}</span>
                </div>
                <h3 className={`font-serif text-brand-dark truncate pr-2 ${isLarge ? 'text-xl md:text-2xl' : ''}`}>{product.name}</h3>
                <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">{product.stock} unidades en stock</p>
            </div>
        </div>
    );
}

function CalculatorModule() {
    const [usdPrice, setUsdPrice] = useState('20');
    const [weight, setWeight] = useState('0.5');
    const [tax, setTax] = useState('15');
    const [exchange, setExchange] = useState('7.85');
    const [margin, setMargin] = useState('35');
    const [courierPerLb, setCourierPerLb] = useState('30');

    // Helper to safely parse numbers
    const p = (v: string) => parseFloat(v) || 0;

    // Intermediate calculations
    const taxAmount = p(usdPrice) * (p(tax) / 100);
    const subtotalUSD = p(usdPrice) + taxAmount;
    const subtotalGTQ = subtotalUSD * p(exchange);
    const courierCostGTQ = p(weight) * p(courierPerLb);
    const totalCostGTQ = subtotalGTQ + courierCostGTQ;
    const sellingGTQ = Math.round(totalCostGTQ / (1 - p(margin) / 100));
    const profitGTQ = sellingGTQ - totalCostGTQ;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* INPUTS SECTION */}
            <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <InputGroup
                        label="Precio Sephora (USD)"
                        placeholder="20.00"
                        icon="$"
                        value={usdPrice}
                        onChange={setUsdPrice}
                        type="number"
                    />
                    <InputGroup
                        label="Peso (lb)"
                        placeholder="0.5"
                        icon="lb"
                        value={weight}
                        onChange={setWeight}
                        type="number"
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <InputGroup
                        label="Arancel (%)"
                        placeholder="15"
                        icon="%"
                        value={tax}
                        onChange={setTax}
                        type="number"
                    />
                    <InputGroup
                        label="Tasa de Cambio"
                        placeholder="7.85"
                        icon="Q"
                        value={exchange}
                        onChange={setExchange}
                        type="number"
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <InputGroup
                        label="Margen (%)"
                        placeholder="35"
                        icon="M"
                        value={margin}
                        onChange={setMargin}
                        type="number"
                    />
                    <InputGroup
                        label="Courier (Q/lb)"
                        placeholder="30.00"
                        icon="Q"
                        value={courierPerLb}
                        onChange={setCourierPerLb}
                        type="number"
                    />
                </div>
            </div>

            {/* BREAKDOWN SECTION (Amazon style) */}
            <div className="lg:col-span-2 bg-brand-dark text-white p-8 rounded-3xl shadow-xl shadow-brand-dark/10 space-y-6 sticky top-24">
                <h3 className="text-xl font-serif font-bold border-b border-white/10 pb-4">Resumen de Importación</h3>

                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center text-stone-400">
                        <span>Precio Producto</span>
                        <div className="text-right">
                            <span className="text-white block">${p(usdPrice).toFixed(2)}</span>
                            <span className="text-[10px] text-brand-pink/60">Q. {(p(usdPrice) * p(exchange)).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-stone-400">
                        <span>Impuestos ({p(tax)}%)</span>
                        <div className="text-right">
                            <span className="text-white block">+ ${taxAmount.toFixed(2)}</span>
                            <span className="text-[10px] text-brand-pink/60">Q. {(taxAmount * p(exchange)).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center font-bold pt-2 border-t border-white/5">
                        <span className="text-brand-pink underline underline-offset-4 decoration-brand-pink/30 text-[10px] uppercase tracking-widest font-bold">Subtotal Miami</span>
                        <div className="text-right">
                            <span className="text-lg block">${subtotalUSD.toFixed(2)}</span>
                            <span className="text-[10px] text-brand-pink font-normal">Q. {subtotalGTQ.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="py-2" />

                    <div className="flex justify-between items-center text-stone-400 italic">
                        <span>Conversión (Q{p(exchange)})</span>
                        <span className="text-white">Q. {subtotalGTQ.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-400">
                        <span>Courier ({p(weight)} lb)</span>
                        <span className="text-white">+ Q. {courierCostGTQ.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center font-bold pt-2 border-t border-white/5">
                        <span className="text-stone-300">Costo Final Local</span>
                        <span className="text-xl">Q. {totalCostGTQ.toFixed(2)}</span>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-brand-pink font-bold text-[10px] uppercase tracking-widest">Ganancia (Neto)</span>
                            <span className="text-green-400 font-bold">Q. {profitGTQ.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-end bg-white/5 p-4 rounded-2xl border border-white/10 mt-4">
                            <span className="text-stone-300 text-xs">PRECIO VENTA</span>
                            <span className="text-4xl font-serif font-bold text-white">Q.{sellingGTQ}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => alert(`¡Listo! Precio de venta sugerido: Q.${sellingGTQ}`)}
                    className="w-full bg-brand-pink text-white py-4 rounded-2xl font-bold hover:bg-[#c4929d] transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-brand-pink/20 mt-4"
                >
                    <CheckCircle2 size={18} /> Publicar Precio
                </button>
            </div>
        </div>
    );
}

function InputGroup({ label, placeholder, icon, value, onChange, type = 'text', onFocus, onBlur }: { label: string, placeholder: string, icon: string, value: string, onChange: (v: string) => void, type?: 'text' | 'number'; onFocus?: () => void; onBlur?: () => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 font-bold text-xs group-focus-within:text-brand-pink transition-colors">{icon}</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (type === 'number') {
                            // Allow digits, one dot, and one comma (for international support, though we convert to dot)
                            if (val === '' || /^[0-9.,]*$/.test(val)) {
                                onChange(val.replace(',', '.'));
                            }
                        } else {
                            onChange(val);
                        }
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-pink/10 focus:bg-white focus:border-brand-pink/20 transition-all font-medium text-stone-800"
                />
            </div>
        </div>
    );
}

function NotificationPanel({ notifications, onClose }: { notifications: any[], onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-stone-100 z-50 overflow-hidden"
        >
            <div className="p-6 border-b border-stone-50 flex justify-between items-center">
                <h4 className="font-serif font-bold text-brand-dark text-lg">Notificaciones</h4>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-900"><X size={18} /></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
                            <p className="text-sm text-stone-800 mb-1">{notif.text}</p>
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{notif.time}</span>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-stone-400 italic text-sm">No hay nuevas notificaciones</div>
                )}
            </div>
        </motion.div>
    );
}

function ClientsModule({ clients }: { clients: any[] }) {
    return (
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-50">
                <div className="flex justify-between items-center mb-6 text-left">
                    <div>
                        <h3 className="text-xl font-serif text-brand-dark">Directorio de Clientes</h3>
                        <p className="text-stone-500 text-sm">Gestiona tus clientes y su historial.</p>
                    </div>
                    <div className="text-sm text-stone-400">{clients.length} clientes</div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIT o teléfono..."
                        className="w-full bg-stone-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand-pink outline-none transition-all"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-100">
                            <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cliente</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Teléfono</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Estado</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">NIT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-stone-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center text-brand-pink text-xs font-bold">{client.name[0]}</div>
                                        <span className="text-sm font-medium text-stone-900">{client.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-stone-500">{client.phone || 'Sin teléfono'}</td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${client.type === 'VIP' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>{client.type}</span>
                                </td>
                                <td className="px-8 py-5 text-sm font-bold text-brand-dark">{client.nit || 'C/F'}</td>
                            </tr>
                        ))}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-stone-400 italic text-sm">No hay clientes registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AddProductModal({ onClose }: { onClose: () => void }) {
    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setError(null);
        if (!name || !brand || !sellingPrice) {
            setError('Por favor completa los campos obligatorios (Nombre, Marca, Precio)');
            return;
        }
        setIsSaving(true);
        try {
            await db.createProduct({
                name,
                brand,
                cost: cost || 0,
                sellingPrice,
                stock: stock || 0,
                image
            });
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            setError('Error al guardar el producto. Revisa la consola.');
        } finally {
            setIsSaving(false);
        }
    };

    const costVal = parseFloat(cost) || 0;
    const sellVal = parseFloat(sellingPrice) || 0;
    const profit = sellVal - costVal;
    const margin = sellVal > 0 ? (profit / sellVal) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative overflow-hidden"
            >
                <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">Nuevo Producto</h3>
                        <p className="text-stone-500 text-sm">Añade stock a tu inventario local.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-brand-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>
                {error && (
                    <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                        <X size={18} className="shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Marca" placeholder="Rare Beauty" icon="B" value={brand} onChange={setBrand} />
                        <InputGroup label="Nombre del Producto" placeholder="Soft Pinch Blush" icon="N" value={name} onChange={setName} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Precio de Costo (Q)" placeholder="150" icon="Q" value={cost} onChange={setCost} type="number" />
                        <InputGroup label="Precio de Venta (Q)" placeholder="245" icon="Q" value={sellingPrice} onChange={setSellingPrice} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Stock Inicial" placeholder="10" icon="#" value={stock} onChange={setStock} type="number" />
                        <InputGroup label="Imagen URL (Opcional)" placeholder="https://..." icon="IMG" value={image} onChange={setImage} />
                    </div>
                    <div className="p-6 bg-brand-cream/50 rounded-3xl border border-brand-pink/10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-brand-pink" />
                            <span className="text-xs font-bold text-brand-pink uppercase tracking-widest">Ganancia Estimada</span>
                        </div>
                        <p className="text-2xl font-serif font-bold text-brand-dark">Q. {profit.toFixed(2)} <span className="text-sm font-sans font-normal text-stone-500 ml-2">({margin.toFixed(0)}%)</span></p>
                    </div>
                </div>
                <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border border-stone-200 font-medium text-stone-600 hover:bg-white transition-all">Cancelar</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-brand-dark text-white font-bold shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function ProductDetailModal({ product, onClose }: { product: any; onClose: () => void }) {
    const [name, setName] = useState(product.name);
    const [brand, setBrand] = useState(product.brand);
    const [cost, setCost] = useState(String(product.cost ?? ''));
    const [sellingPrice, setSellingPrice] = useState(String(product.sellingPrice ?? ''));
    const [stock, setStock] = useState(String(product.stock ?? ''));
    const [image, setImage] = useState(product.image || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = async () => {
        setError(null);
        if (!name.trim() || !brand.trim()) {
            setError('Nombre y marca son obligatorios.');
            return;
        }
        const sellVal = parseFloat(sellingPrice);
        if (Number.isNaN(sellVal) || sellVal < 0) {
            setError('Precio de venta debe ser un número válido.');
            return;
        }
        setIsSaving(true);
        try {
            await db.updateProduct(String(product.id), {
                name: name.trim(),
                brand: brand.trim(),
                cost: parseFloat(cost) || 0,
                sellingPrice: sellVal,
                stock: parseInt(stock, 10) || 0,
                image: image.trim() || null,
            });
            onClose();
        } catch (e) {
            console.error('Error updating product:', e);
            setError('No se pudo guardar. Intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await db.deleteProduct(product.id);
            onClose();
        } catch (e) {
            console.error('Error deleting product:', e);
            setError('No se pudo eliminar el producto.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const costVal = parseFloat(cost) || 0;
    const sellVal = parseFloat(sellingPrice) || 0;
    const profit = sellVal - costVal;
    const margin = sellVal > 0 ? (profit / sellVal) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-white/50 backdrop-blur-sm shrink-0">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">Editar producto</h3>
                        <p className="text-stone-500 text-sm">#{product.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-brand-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>
                {error && (
                    <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm shrink-0">{error}</div>
                )}
                <div className="p-8 space-y-6 overflow-y-auto flex-1 min-h-0">
                    <div className="rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5] max-h-48 w-full">
                        <img
                            src={image || 'https://via.placeholder.com/400x500?text=Sin+imagen'}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <InputGroup label="Imagen URL" placeholder="https://..." icon="IMG" value={image} onChange={setImage} />
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Marca" placeholder="Rare Beauty" icon="B" value={brand} onChange={setBrand} />
                        <InputGroup label="Nombre del Producto" placeholder="Soft Pinch Blush" icon="N" value={name} onChange={setName} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Precio de Costo (Q)" placeholder="150" icon="Q" value={cost} onChange={setCost} type="number" />
                        <InputGroup label="Precio de Venta (Q)" placeholder="245" icon="Q" value={sellingPrice} onChange={setSellingPrice} type="number" />
                    </div>
                    <InputGroup label="Stock" placeholder="10" icon="#" value={stock} onChange={setStock} type="number" />
                    <div className="p-6 bg-brand-cream/50 rounded-3xl border border-brand-pink/10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-brand-pink" />
                            <span className="text-xs font-bold text-brand-pink uppercase tracking-widest">Ganancia estimada</span>
                        </div>
                        <p className="text-2xl font-serif font-bold text-brand-dark">Q. {profit.toFixed(2)} <span className="text-sm font-sans font-normal text-stone-500 ml-2">({margin.toFixed(0)}%)</span></p>
                    </div>
                </div>
                <div className="p-8 bg-stone-50 border-t border-stone-100 flex flex-col gap-4 shrink-0">
                    {showDeleteConfirm ? (
                        <div className="flex items-center justify-between gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                            <span className="text-sm text-red-700">¿Eliminar este producto? No se puede deshacer.</span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium">Cancelar</button>
                                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50">Eliminar</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 px-4 rounded-2xl border border-red-200 text-red-600 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={18} /> Eliminar producto
                        </button>
                    )}
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border border-stone-200 font-medium text-stone-600 hover:bg-white transition-all">Cerrar</button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-[2] py-4 px-6 rounded-2xl bg-brand-dark text-white font-bold shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

const CSV_IMPORT_FORMAT = `nombre,marca,precio_venta,costo,stock,imagen
Soft Pinch Blush,Rare Beauty,245,150,10,https://...
Lip Oil,Dior,380,200,5,`;

function parseImportCSV(text: string): Array<{ name: string; brand: string; sellingPrice: number; cost?: number; stock?: number; image?: string }> {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) return [];
    const rows = lines.map((line) => line.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
    const isHeader = (cells: string[]) => {
        const first = (cells[0] || '').toLowerCase();
        return first === 'nombre' || first === 'name' || first === 'producto';
    };
    const start = rows.length > 0 && isHeader(rows[0]) ? 1 : 0;
    const items: Array<{ name: string; brand: string; sellingPrice: number; cost?: number; stock?: number; image?: string }> = [];
    for (let i = start; i < rows.length; i++) {
        const c = rows[i];
        const name = (c[0] || '').trim();
        const brand = (c[1] || '').trim();
        const sellingPrice = parseFloat((c[2] || '0').replace(/[^0-9.]/g, '')) || 0;
        if (!name || !brand) continue;
        items.push({
            name,
            brand,
            sellingPrice,
            cost: parseFloat((c[3] || '0').replace(/[^0-9.]/g, '')) || undefined,
            stock: parseInt((c[4] || '0').replace(/\D/g, ''), 10) || undefined,
            image: (c[5] || '').trim() || undefined,
        });
    }
    return items;
}

function ImportProductsModal({ onClose }: { onClose: () => void }) {
    const [csvText, setCsvText] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<{ created: number; errors: Array<{ index: number; message: string }> } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
        setError(null);
        setResult(null);
        const items = parseImportCSV(csvText);
        if (items.length === 0) {
            setError('No hay filas válidas. Usa el formato: nombre, marca, precio_venta, costo, stock, imagen');
            return;
        }
        setIsImporting(true);
        try {
            const res = await db.createProductsBulk(items);
            setResult({
                created: res.created,
                errors: (res.errors || []).map((e: { index: number; message: string }) => ({ index: e.index, message: e.message })),
            });
            if (res.created > 0) setCsvText('');
        } catch (e) {
            setError('Error al importar. Revisa la consola.');
            console.error(e);
        } finally {
            setIsImporting(false);
        }
    };

    const previewCount = parseImportCSV(csvText).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden"
            >
                <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">Importar productos desde CSV</h3>
                        <p className="text-stone-500 text-sm">Pega un archivo CSV con nombre, marca, precios y stock.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-brand-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-4">
                    <p className="text-xs text-stone-500">
                        Columnas: <strong>nombre</strong>, <strong>marca</strong>, <strong>precio_venta</strong>, costo (opcional), stock (opcional), imagen URL (opcional). La primera fila puede ser el encabezado.
                    </p>
                    <textarea
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        placeholder={CSV_IMPORT_FORMAT}
                        className="w-full h-40 px-4 py-3 rounded-2xl border border-stone-200 text-sm font-mono resize-y focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink outline-none"
                        spellCheck={false}
                    />
                    {previewCount > 0 && (
                        <p className="text-xs text-stone-500">Se importarán <strong>{previewCount}</strong> productos.</p>
                    )}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">{error}</div>
                    )}
                    {result && (
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm">
                            <p className="font-bold text-brand-dark">✓ {result.created} productos importados.</p>
                            {result.errors.length > 0 && (
                                <p className="text-amber-600 mt-1">Errores en {result.errors.length} fila(s): {result.errors.slice(0, 3).map((e) => `#${e.index}`).join(', ')}{result.errors.length > 3 ? '...' : ''}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border border-stone-200 font-medium text-stone-600 hover:bg-white transition-all">Cerrar</button>
                    <button
                        onClick={handleImport}
                        disabled={isImporting || previewCount === 0}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-brand-dark text-white font-bold shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isImporting ? 'Importando...' : `Importar ${previewCount > 0 ? previewCount : ''} productos`}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

const DROP_STAGES = [
    { id: 'por_pedir', title: 'Por pedir', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { id: 'en_transito', title: 'En tránsito a Guatemala', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    { id: 'enviado_cliente', title: 'Ya enviado al cliente', icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
] as const;

function DropsModule({ drops, onDropsUpdated }: { drops: any[]; onDropsUpdated: () => void }) {
    const [addToStage, setAddToStage] = useState<string | null>(null);
    const [editingDrop, setEditingDrop] = useState<any | null>(null);

    const getItemsByStage = (stageId: string) => drops.filter((d) => d.stage === stageId);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DROP_STAGES.map((stage) => {
                    const items = getItemsByStage(stage.id);
                    const Icon = stage.icon;
                    return (
                        <div key={stage.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col min-w-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-xl ${stage.color}`}><Icon size={18} /></div>
                                <h4 className="font-serif font-bold text-brand-dark">{stage.title}</h4>
                            </div>
                            <div className="space-y-3 flex-1">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setEditingDrop(item)}
                                        className="p-4 bg-stone-50 rounded-2xl border border-stone-100/50 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <span className="text-sm font-medium text-stone-700 truncate min-w-0">{item.title}</span>
                                        <ArrowRight size={14} className="text-stone-300 group-hover:text-brand-pink transition-colors shrink-0 ml-2" />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setAddToStage(stage.id)}
                                    className="w-full p-4 rounded-2xl border border-dashed border-stone-200 text-stone-500 hover:border-brand-pink hover:text-brand-pink hover:bg-brand-pink/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Plus size={16} /> Agregar pedido
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <AnimatePresence>
                {(addToStage !== null || editingDrop !== null) && (
                    <DropModal
                        drop={editingDrop}
                        initialStage={addToStage ?? undefined}
                        onClose={() => { setAddToStage(null); setEditingDrop(null); }}
                        onSaved={() => { setAddToStage(null); setEditingDrop(null); onDropsUpdated(); }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

function DropModal({
    drop,
    initialStage,
    onClose,
    onSaved,
}: {
    drop: any | null;
    initialStage?: string;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!drop;
    const [title, setTitle] = useState(drop?.title ?? '');
    const [notes, setNotes] = useState(drop?.notes ?? '');
    const [stage, setStage] = useState(drop?.stage ?? initialStage ?? 'por_pedir');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setError(null);
        const t = title.trim();
        if (!t) return setError('Escribe qué pedido o ítem es.');
        setIsSaving(true);
        try {
            if (isEdit) {
                await db.updateDrop(drop.id, { title: t, notes: notes.trim() || null, stage });
            } else {
                await db.createDrop({ title: t, notes: notes.trim() || null, stage });
            }
            onSaved();
        } catch (e) {
            setError('No se pudo guardar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!isEdit || !drop?.id) return;
        if (!confirm('¿Eliminar este ítem de Drops?')) return;
        setError(null);
        setIsDeleting(true);
        try {
            await db.deleteDrop(drop.id);
            onSaved();
        } catch (e) {
            setError('No se pudo eliminar.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden"
            >
                <div className="p-8 border-b border-stone-50 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">
                            {isEdit ? 'Editar pedido' : 'Nuevo pedido'}
                        </h3>
                        <p className="text-stone-500 text-sm">
                            {isEdit ? 'Cambia el texto o la etapa.' : 'Qué vas a pedir o qué está en camino.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-brand-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>
                {error && (
                    <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                        <X size={18} className="shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
                <div className="p-8 space-y-6">
                    <InputGroup
                        label="Pedido / ítem"
                        placeholder="Ej: Rare Beauty Blush, Pedido para María..."
                        icon="P"
                        value={title}
                        onChange={setTitle}
                    />
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Notas (opcional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tracking, fechas, observaciones..."
                            className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink resize-none"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Etapa</label>
                        <select
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                        >
                            {DROP_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="p-8 bg-stone-50 border-t border-stone-100 flex flex-wrap gap-4">
                    {isEdit && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="py-4 px-6 rounded-2xl border border-red-200 font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Eliminar
                        </button>
                    )}
                    <div className="flex-1 flex gap-4 justify-end">
                        <button onClick={onClose} className="py-4 px-6 rounded-2xl border border-stone-200 font-medium text-stone-600 hover:bg-white transition-all">Cancelar</button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="py-4 px-6 rounded-2xl bg-brand-dark text-white font-bold shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function AddClientModal({ onClose, onSaved }: { onClose: () => void; onSaved?: () => void | Promise<void> }) {
    const [name, setName] = useState('');
    const [nit, setNit] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-lg rounded-[40px] shadow-2xl relative overflow-hidden"
            >
                <div className="p-8 border-b border-stone-50 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">Nuevo Cliente</h3>
                        <p className="text-stone-500 text-sm">Registra un nuevo comprador en tu base de datos.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-brand-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>
                {error && (
                    <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                        <X size={18} className="shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
                <div className="p-8 space-y-6">
                    <InputGroup label="Nombre Completo" placeholder="Ej: Maria Lopez" icon="N" value={name} onChange={setName} />
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="NIT / CF" placeholder="9876543-2" icon="T" value={nit} onChange={setNit} />
                        <InputGroup label="Teléfono" placeholder="5544-3322" icon="P" value={phone} onChange={setPhone} />
                    </div>
                </div>
                <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border border-stone-200 font-medium text-stone-600 hover:bg-white transition-all">Cancelar</button>
                    <button
                        onClick={async () => {
                            setError(null);
                            if (!name.trim()) return setError('El nombre es obligatorio');
                            setIsSaving(true);
                            try {
                                await db.createClient({ name: name.trim(), nit: nit.trim() || '', phone: phone.trim() || '' });
                                if (onSaved) {
                                    await onSaved();
                                } else {
                                    onClose();
                                }
                            } catch (e) {
                                setError('Error al guardar cliente');
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        disabled={isSaving}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-brand-dark text-white font-bold shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

const ORDER_STATUSES = [
    { value: 'Completado', label: 'Completado' },
    { value: 'Cancelado', label: 'Cancelado' },
    { value: 'Pendiente', label: 'Pendiente' },
] as const;

/** Normaliza estados antiguos (Pagado/Entregado) a Completado para la UI */
function normalizeOrderStatus(status: string) {
    if (status === 'Pagado' || status === 'Entregado') return 'Completado';
    return status;
}

/** Fondo y borde de toda la fila según estado */
function rowStatusClass(status: string) {
    const s = normalizeOrderStatus(status);
    switch (s) {
        case 'Completado': return 'bg-emerald-50/90 border-l-4 border-emerald-500';
        case 'Cancelado': return 'bg-red-50/80 border-l-4 border-red-300';
        case 'Pendiente':
        default: return 'bg-amber-50/90 border-l-4 border-amber-400';
    }
}

/** Estilos del selector de estado */
function selectStatusClass(status: string) {
    const s = normalizeOrderStatus(status);
    switch (s) {
        case 'Completado': return 'bg-white/90 text-emerald-700 border-emerald-300 hover:border-emerald-400';
        case 'Cancelado': return 'bg-white/90 text-red-600 border-red-200 hover:border-red-300';
        case 'Pendiente':
        default: return 'bg-white/90 text-amber-700 border-amber-300 hover:border-amber-400';
    }
}

function OrderDetailsModal({ order, onClose, onSaved }: { order: any; onClose: () => void; onSaved: () => void }) {
    const normalized = normalizeOrderStatus(order?.status || '');
    const [note, setNote] = useState(order?.statusNote || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const label = normalized === 'Pendiente'
        ? '¿Por qué está pendiente?'
        : normalized === 'Cancelado'
            ? 'Motivo de cancelación'
            : 'Método de pago aprobado';

    const handleSave = async () => {
        setError(null);
        setSaving(true);
        try {
            await db.updateOrder(order.id, { statusNote: note.trim() || null });
            onSaved();
            onClose();
        } catch (e) {
            setError('No se pudo guardar.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 relative"
            >
                <h3 className="text-xl font-serif font-bold text-brand-dark mb-1">Detalles del estado</h3>
                <p className="text-stone-500 text-sm mb-4">Pedido #{order?.id?.slice(-6).toUpperCase()}</p>
                <label className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={normalized === 'Completado' ? 'Ej: Transferencia BI, VisaCuotas, efectivo...' : 'Escribe aquí...'}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm resize-y min-h-[100px] focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink outline-none"
                    rows={3}
                />
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-medium">Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-2xl bg-brand-dark text-white font-bold disabled:opacity-50">
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function OrdersModule({ orders, onOrderUpdated }: { orders: any[]; onOrderUpdated: () => void }) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [orderForDetails, setOrderForDetails] = useState<any | null>(null);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await db.updateOrder(orderId, { status: newStatus });
            onOrderUpdated();
        } catch (e) {
            console.error('Error al actualizar pedido:', e);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-100">
                                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pedido ID</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Productos</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className={`transition-colors group ${rowStatusClass(order.status)} hover:opacity-95`}
                                >
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-bold text-brand-dark">#{order.id.slice(-6).toUpperCase()}</span>
                                        <p className="text-[10px] text-stone-500 mt-1">{new Date(order.date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-brand-pink text-xs font-bold">{order.client?.name?.[0] || 'U'}</div>
                                            <span className="text-sm font-medium text-stone-800">{order.client?.name || 'Cliente Desconocido'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-stone-600">
                                        {order.items?.length || 0} productos
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-brand-dark">Q. {order.total}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={normalizeOrderStatus(order.status)}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                disabled={updatingId === order.id}
                                                className={`min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-offset-1 shadow-sm ${selectStatusClass(order.status)}`}
                                            >
                                                {ORDER_STATUSES.map((s) => (
                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setOrderForDetails(order)}
                                                title="Detalles (motivo / método de pago)"
                                                className="p-2.5 rounded-xl border-2 border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-brand-dark hover:border-stone-300 transition-colors"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-10 text-center text-stone-400 italic text-sm">No hay pedidos registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {orderForDetails && (
                <AnimatePresence>
                    <OrderDetailsModal
                        order={orderForDetails}
                        onClose={() => setOrderForDetails(null)}
                        onSaved={onOrderUpdated}
                    />
                </AnimatePresence>
            )}
        </>
    );
}

function AddOrderModal({ onClose, products, clients }: { onClose: () => void, products: any[], clients: any[] }) {
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; sellingPrice: number } | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [isPaid, setIsPaid] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showClientResults, setShowClientResults] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().startsWith(clientSearch.trim().toLowerCase())
    ).slice(0, 8);

    const inStockProducts = products.filter(p => (p.stock ?? 0) > 0);
    const filteredProducts = inStockProducts.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 5);

    const handleSaveOrder = async () => {
        setError(null);
        if (!selectedClient) {
            setError('Selecciona un cliente de la lista.');
            return;
        }
        if (!selectedProduct) {
            setError('Selecciona un producto de la lista.');
            return;
        }
        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        const itemPrice = selectedProduct.sellingPrice;
        const total = itemPrice * qty;
        setIsSaving(true);
        try {
            await db.createOrder({
                clientId: selectedClient.id,
                items: [{ productId: selectedProduct.id, quantity: qty, price: itemPrice }],
                total,
                status: isPaid ? 'Completado' : 'Pendiente',
            });
            onClose();
        } catch (e) {
            console.error('Error al guardar pedido:', e);
            setError('No se pudo guardar el pedido. Intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative overflow-hidden"
            >
                <div className="p-8 border-b border-stone-50 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">Registrar Pedido</h3>
                        <p className="text-stone-500 text-sm">Crea un nuevo pedido para tus clientes.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-brand-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="relative">
                        <InputGroup
                            label="Cliente"
                            placeholder="Buscar cliente..."
                            icon="U"
                            value={selectedClient ? selectedClient.name : clientSearch}
                            onChange={(v) => {
                                setSelectedClient(null);
                                setClientSearch(v);
                                setShowClientResults(v.length > 0);
                            }}
                        />
                        {showClientResults && clientSearch.length > 0 && (
                            <div className="absolute z-[110] left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden max-h-48 overflow-y-auto">
                                {filteredClients.length > 0 ? (
                                    filteredClients.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedClient({ id: c.id, name: c.name });
                                                setClientSearch('');
                                                setShowClientResults(false);
                                            }}
                                            className="w-full text-left p-3 hover:bg-brand-cream/30 transition-colors flex items-center gap-3 border-b border-stone-50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center text-brand-pink text-xs font-bold flex-shrink-0">
                                                {c.name[0]}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-brand-dark">{c.name}</p>
                                                {c.phone && <p className="text-[10px] text-stone-400">{c.phone}</p>}
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-stone-400 italic">Ningún cliente inicia con &quot;{clientSearch}&quot;</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-6 relative">
                        <div className="relative">
                            <InputGroup
                                label="Producto (solo inventario con stock)"
                                placeholder="Buscar producto en inventario..."
                                icon="P"
                                value={selectedProduct ? selectedProduct.name : productSearch}
                                onChange={(v) => {
                                    setSelectedProduct(null);
                                    setProductSearch(v);
                                    setShowResults(v.length > 0);
                                }}
                            />
                            {showResults && productSearch.length > 0 && (
                                <div className="absolute z-[110] left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden max-h-48 overflow-y-auto">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProduct({ id: p.id, name: p.name, sellingPrice: p.sellingPrice });
                                                    setProductSearch('');
                                                    setShowResults(false);
                                                }}
                                                className="w-full text-left p-3 hover:bg-brand-cream/30 transition-colors flex items-center gap-3 border-b border-stone-50 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden">
                                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-stone-200" />}
                                                </div>
                                                <div className="text-left min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-brand-dark truncate">{p.name}</p>
                                                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">{p.brand} · Stock: {p.stock}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-stone-400 italic">
                                            {inStockProducts.length === 0 ? 'No hay productos con stock en inventario.' : `Ningún producto en stock coincide con "${productSearch}".`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <InputGroup label="Cantidad" placeholder="1" icon="#" value={quantity} onChange={setQuantity} type="number" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isPaid ? 'bg-green-100 text-green-600' : 'bg-stone-200 text-stone-500'}`}>
                                <CheckCircle2 size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-brand-dark">Pedido Pagado</p>
                                <p className="text-xs text-stone-500">¿El cliente ya pagó?</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPaid(!isPaid)}
                            className={`w-12 h-6 rounded-full transition-all relative ${isPaid ? 'bg-brand-pink' : 'bg-stone-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPaid ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="px-8 pb-2">
                        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
                    </div>
                )}
                <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border border-stone-200 font-medium text-stone-600 hover:bg-white transition-all" disabled={isSaving}>Cancelar</button>
                    <button
                        onClick={handleSaveOrder}
                        disabled={isSaving}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-brand-dark text-white font-bold shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Pedido'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
