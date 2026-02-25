/**
 * API de datos: en Electron usa IPC; en Chrome usa fetch al servidor local.
 */
const isElectron = typeof window !== 'undefined' && (window as any).require && (window as any).require('electron');
/** Para mostrar en UI si la app está en Electron o en navegador (API). */
export const connectionMode = isElectron ? 'electron' as const : 'api' as const;
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

async function fetchApi(method: string, path: string, body?: any) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

const dbElectron = isElectron
    ? {
        getProducts: () => (window as any).require('electron').ipcRenderer.invoke('get-products'),
        createProduct: (data: any) => (window as any).require('electron').ipcRenderer.invoke('create-product', data),
        createProductsBulk: (items: any) => (window as any).require('electron').ipcRenderer.invoke('create-products-bulk', items),
        updateProduct: (id: string, data: any) => (window as any).require('electron').ipcRenderer.invoke('update-product', id, data),
        deleteProduct: (id: string) => (window as any).require('electron').ipcRenderer.invoke('delete-product', id),
        getClients: () => (window as any).require('electron').ipcRenderer.invoke('get-clients'),
        createClient: (data: any) => (window as any).require('electron').ipcRenderer.invoke('create-client', data),
        getOrders: () => (window as any).require('electron').ipcRenderer.invoke('get-orders'),
        createOrder: (data: any) => (window as any).require('electron').ipcRenderer.invoke('create-order', data),
        updateOrder: (orderId: string, data: any) => (window as any).require('electron').ipcRenderer.invoke('update-order', orderId, data),
        getDrops: () => (window as any).require('electron').ipcRenderer.invoke('get-drops'),
        createDrop: (data: any) => (window as any).require('electron').ipcRenderer.invoke('create-drop', data),
        updateDrop: (id: string, data: any) => (window as any).require('electron').ipcRenderer.invoke('update-drop', id, data),
        deleteDrop: (id: string) => (window as any).require('electron').ipcRenderer.invoke('delete-drop', id),
        getDatabasePath: () => (window as any).require('electron').ipcRenderer.invoke('get-database-path'),
    }
    : null;

export const db = isElectron
    ? {
        getProducts: () => dbElectron!.getProducts(),
        createProduct: (data: any) => dbElectron!.createProduct(data),
        createProductsBulk: (items: any) => dbElectron!.createProductsBulk(items),
        updateProduct: (id: string, data: any) => dbElectron!.updateProduct(id, data),
        deleteProduct: (id: string) => dbElectron!.deleteProduct(id),
        getClients: () => dbElectron!.getClients(),
        createClient: (data: any) => dbElectron!.createClient(data),
        getOrders: () => dbElectron!.getOrders(),
        createOrder: (data: any) => dbElectron!.createOrder(data),
        updateOrder: (orderId: string, data: { status?: string; statusNote?: string | null }) => dbElectron!.updateOrder(orderId, data),
        getDrops: () => dbElectron!.getDrops(),
        createDrop: (data: any) => dbElectron!.createDrop(data),
        updateDrop: (id: string, data: any) => dbElectron!.updateDrop(id, data),
        deleteDrop: (id: string) => dbElectron!.deleteDrop(id),
        getDatabasePath: () => dbElectron!.getDatabasePath(),
    }
    : {
        getProducts: () => fetchApi('GET', '/api/products'),
        createProduct: (data: any) => fetchApi('POST', '/api/products', data),
        createProductsBulk: (items: any) => fetchApi('POST', '/api/products/bulk', items),
        updateProduct: (id: string, data: any) => fetchApi('PUT', `/api/products/${id}`, data),
        deleteProduct: (id: string) => fetchApi('DELETE', `/api/products/${id}`),
        getClients: () => fetchApi('GET', '/api/clients'),
        createClient: (data: any) => fetchApi('POST', '/api/clients', data),
        getOrders: () => fetchApi('GET', '/api/orders'),
        createOrder: (data: any) => fetchApi('POST', '/api/orders', data),
        updateOrder: (orderId: string, data: { status?: string; statusNote?: string | null }) => fetchApi('PATCH', `/api/orders/${orderId}`, data),
        getDrops: () => fetchApi('GET', '/api/drops'),
        createDrop: (data: any) => fetchApi('POST', '/api/drops', data),
        updateDrop: (id: string, data: any) => fetchApi('PATCH', `/api/drops/${id}`, data),
        deleteDrop: (id: string) => fetchApi('DELETE', `/api/drops/${id}`),
        getDatabasePath: () => Promise.resolve(null as string | null),
    };
