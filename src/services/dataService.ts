import { db, type Product, type Transaction, type Customer } from './db';
import { generateId } from '../lib/utils';

/**
 * Data Service Abstraction Layer
 * This handles all data operations, ensuring offline-first behavior
 * and queueing for background sync.
 */
export const dataService = {
  // Products / Inventory
  async getInventory(): Promise<Product[]> {
    return await db.products.toArray();
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const id = generateId();
    await db.products.add({ ...product, id });
    await this.queueSync('products', 'create', { ...product, id });
    return id;
  },

  async updateStock(productId: string, delta: number): Promise<void> {
    const product = await db.products.get(productId);
    if (!product) throw new Error('Product not found');
    
    const newStock = product.stock + delta;
    await db.products.update(productId, { stock: newStock });
    await this.queueSync('products', 'update', { id: productId, stock: newStock });
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return await db.transactions.orderBy('timestamp').reverse().toArray();
  },

  async logTransaction(transaction: Omit<Transaction, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    const id = generateId();
    const timestamp = Date.now();
    
    // Calculate Commission (e.g., 2% for staff)
    const commissionEarned = transaction.type === 'sale' ? transaction.amount * 0.02 : 0;
    
    // Generate Mock eTIMS/URA QR Code URL
    const taxQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TAX-${id}`;

    // Calculate Carbon Credits (e.g., 0.1 credits per kg of organic fertilizer)
    const carbonCredits = transaction.productName.toLowerCase().includes('organic') ? transaction.quantity * 0.1 : 0;
    
    // Check for Government Subsidies (e.g., DAP is subsidized)
    const isSubsidy = transaction.productName.toLowerCase().includes('dap');

    const fullTransaction: Transaction = {
      ...transaction,
      id,
      timestamp,
      synced: false,
      commissionEarned,
      taxQrCode,
      carbonCredits,
      isSubsidy
    };
    
    await db.transactions.add(fullTransaction);
    
    // Update stock automatically with FEFO (First Expiry, First Out)
    let stockDelta = 0;
    if (transaction.type === 'sale' || transaction.type === 'bulk-break') {
      stockDelta = -transaction.quantity;
      await this.applyFEFO(transaction.productId, transaction.quantity);
    } else if (transaction.type === 'purchase') {
      stockDelta = transaction.quantity;
    }
    
    if (stockDelta !== 0) {
      await this.updateStock(transaction.productId, stockDelta);
    }
    
    // Update customer debt if credit
    if (transaction.paymentMethod === 'credit' && transaction.customerId) {
      await this.updateCustomerDebt(transaction.customerId, transaction.amount);
    }

    await this.queueSync('transactions', 'create', fullTransaction);
    return id;
  },

  async applyFEFO(productId: string, quantity: number) {
    const product = await db.products.get(productId);
    if (!product || !product.batches) return;

    // Sort batches by expiry date (FEFO)
    const sortedBatches = [...product.batches].sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

    let remainingToDeduct = quantity;
    for (const batch of sortedBatches) {
      if (remainingToDeduct <= 0) break;
      const deduct = Math.min(batch.quantity, remainingToDeduct);
      batch.quantity -= deduct;
      remainingToDeduct -= deduct;
    }

    await db.products.update(productId, { batches: sortedBatches });
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.customers.toArray();
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    await db.customers.update(id, updates);
    await this.queueSync('customers', 'update', { id, ...updates });
  },

  async updateCustomerDebt(customerId: string, amount: number): Promise<void> {
    const customer = await db.customers.get(customerId);
    if (!customer) return;
    
    const newDebt = customer.totalDebt + amount;
    await db.customers.update(customerId, { 
      totalDebt: newDebt,
      lastTransaction: Date.now()
    });
    await this.queueSync('customers', 'update', { id: customerId, totalDebt: newDebt });
  },

  // Sync Logic
  async queueSync(collection: string, action: 'create' | 'update' | 'delete', data: any) {
    await db.syncQueue.add({
      collection,
      action,
      data,
      timestamp: Date.now()
    });
    // Trigger background sync if online
    if (navigator.onLine) {
      this.triggerSync();
    }
  },

  async triggerSync() {
    const items = await db.syncQueue.toArray();
    if (items.length === 0) return;

    console.log(`Syncing ${items.length} items to remote...`);
    
    for (const item of items) {
      try {
        // Mock remote call
        await new Promise(resolve => setTimeout(resolve, 100));
        await db.syncQueue.delete(item.id!);
        
        if (item.collection === 'transactions') {
          await db.transactions.update(item.data.id, { synced: true });
        }
      } catch (error) {
        console.error('Sync failed for item', item.id, error);
      }
    }
  },

  // Demo Data Initialization
  async seedDemoData() {
    const productsCount = await db.products.count();
    if (productsCount > 0) return;

    const demoProducts: Product[] = [
      { 
        id: 'p1', 
        name: 'DAP Fertilizer', 
        aliases: ['dap', 'mbolea', 'fert'], 
        category: 'Fertilizer', 
        stock: 45, 
        unit: 'bag', 
        costPrice: 2000, 
        sellingPrice: 2500, 
        lowStockThreshold: 10,
        batches: [
          { id: 'b1', batchNumber: 'B001', expiryDate: '2026-12-01', quantity: 20, receivedDate: '2025-01-01' },
          { id: 'b2', batchNumber: 'B002', expiryDate: '2027-06-01', quantity: 25, receivedDate: '2025-02-01' }
        ]
      },
      { 
        id: 'p2', 
        name: 'CAN Fertilizer', 
        aliases: ['can', 'topdress'], 
        category: 'Fertilizer', 
        stock: 12, 
        unit: 'bag', 
        costPrice: 1800, 
        sellingPrice: 2200, 
        lowStockThreshold: 5,
        batches: [
          { id: 'b3', batchNumber: 'C001', expiryDate: '2026-05-01', quantity: 12, receivedDate: '2025-01-15' }
        ]
      },
      { 
        id: 'p3', 
        name: 'Maize Seeds H614', 
        aliases: ['seeds', 'mbegu', 'maize'], 
        category: 'Seeds', 
        stock: 120, 
        unit: 'kg', 
        costPrice: 150, 
        sellingPrice: 200, 
        lowStockThreshold: 20,
        batches: [
          { id: 'b4', batchNumber: 'M001', expiryDate: '2026-08-01', quantity: 120, receivedDate: '2025-03-01' }
        ]
      },
      { 
        id: 'p4', 
        name: 'Foot & Mouth Vaccine', 
        aliases: ['vaccine', 'chanjo'], 
        category: 'Vet', 
        stock: 8, 
        unit: 'vial', 
        costPrice: 500, 
        sellingPrice: 800, 
        lowStockThreshold: 2, 
        expiryDate: '2026-04-15',
        isVaccine: true,
        batches: [
          { 
            id: 'b5',
            batchNumber: 'V001', 
            expiryDate: '2026-04-15', 
            quantity: 8, 
            receivedDate: '2025-04-01',
            temperatureLogs: [
              { timestamp: Date.now() - 3600000, temp: 4.2, status: 'optimal' },
              { timestamp: Date.now(), temp: 3.8, status: 'optimal' }
            ]
          }
        ]
      },
    ];

    const demoCustomers: Customer[] = [
      { id: 'c1', name: 'Juma Hamisi', phone: '0712345678', totalDebt: 12500, creditLimit: 20000, lastTransaction: Date.now() - 86400000, riskLevel: 'medium', chamaId: 'ch1' },
      { id: 'c2', name: 'Mama Mboga', phone: '0722334455', totalDebt: 0, creditLimit: 5000, lastTransaction: Date.now() - 172800000, riskLevel: 'low' },
    ];

    const demoChamas = [
      { id: 'ch1', name: 'Kiambu Farmers Group', members: ['c1'], totalLiability: 12500 }
    ];

    await db.products.bulkAdd(demoProducts);
    await db.customers.bulkAdd(demoCustomers);
    await db.chamas.bulkAdd(demoChamas);
  }
};
