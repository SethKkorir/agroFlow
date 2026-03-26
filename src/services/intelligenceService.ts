import { type Product, type Transaction, type Customer } from './db';
import { subDays, startOfDay } from 'date-fns';

export interface Insight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  category: 'inventory' | 'sales' | 'debt';
}

export const intelligenceService = {
  generateInsights(products: Product[], transactions: Transaction[], customers: Customer[]): Insight[] {
    const insights: Insight[] = [];
    const now = Date.now();
    const sevenDaysAgo = subDays(new Date(), 7).getTime();
    const thirtyDaysAgo = subDays(new Date(), 30).getTime();

    // 1. Low Stock & Run-out Predictions
    products.forEach(p => {
      if (p.stock <= p.lowStockThreshold) {
        insights.push({
          id: `low-stock-${p.id}`,
          type: 'error',
          category: 'inventory',
          title: 'Low Stock Alert',
          description: `${p.name} is critically low (${p.stock} ${p.unit}s left).`,
          actionLabel: 'Restock Now'
        });
      }

      // Simple run-out prediction based on recent sales
      const recentSales = transactions
        .filter(t => t.productId === p.id && t.type === 'sale' && t.timestamp >= sevenDaysAgo)
        .reduce((sum, t) => sum + t.quantity, 0);
      
      const dailyVelocity = recentSales / 7;
      if (dailyVelocity > 0 && p.stock > 0) {
        const daysRemaining = Math.floor(p.stock / dailyVelocity);
        if (daysRemaining <= 3 && daysRemaining > 0) {
          insights.push({
            id: `runout-${p.id}`,
            type: 'warning',
            category: 'inventory',
            title: 'Stock Depletion Risk',
            description: `${p.name} will likely run out in ${daysRemaining} days at current sales rate.`,
            actionLabel: 'Order Stock'
          });
        }
      }
    });

    // 2. Hot Items (High Velocity)
    const productSales = new Map<string, number>();
    transactions
      .filter(t => t.type === 'sale' && t.timestamp >= sevenDaysAgo)
      .forEach(t => {
        productSales.set(t.productId, (productSales.get(t.productId) || 0) + t.quantity);
      });

    productSales.forEach((qty, pid) => {
      const product = products.find(p => p.id === pid);
      if (product && qty > 10) { // Threshold for "Hot"
        insights.push({
          id: `hot-${pid}`,
          type: 'success',
          category: 'sales',
          title: 'High Demand Detected',
          description: `${product.name} is selling fast (${qty} units in 7 days).`,
        });
      }
    });

    // 3. Dead Stock (No sales in 30 days) & Dynamic Pricing
    products.forEach(p => {
      const hasRecentSales = transactions.some(t => t.productId === p.id && t.type === 'sale' && t.timestamp >= thirtyDaysAgo);
      const expiringSoon = p.batches?.some(b => {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        return new Date(b.expiryDate).getTime() - now < thirtyDays;
      });

      if (expiringSoon && p.stock > 0) {
        insights.push({
          id: `clearance-${p.id}`,
          type: 'error',
          category: 'inventory',
          title: 'Clearance Suggestion',
          description: `${p.name} is expiring soon. Suggest 15% discount to clear stock.`,
          actionLabel: 'Apply Discount'
        });
      } else if (!hasRecentSales && p.stock > 0) {
        insights.push({
          id: `dead-${p.id}`,
          type: 'info',
          category: 'inventory',
          title: 'Slow Moving Stock',
          description: `No sales for ${p.name} in the last 30 days. Consider a promotion.`,
          actionLabel: 'Create Offer'
        });
      }
    });

    // 4. Auto-PO Generation
    products.forEach(p => {
      if (p.stock <= p.lowStockThreshold) {
        insights.push({
          id: `auto-po-${p.id}`,
          type: 'success',
          category: 'inventory',
          title: 'Auto-PO Generated',
          description: `Stock for ${p.name} is low. A draft Purchase Order has been created.`,
          actionLabel: 'View PO'
        });
      }
    });

    // 5. Debt Risks
    customers.forEach(c => {
      if (c.totalDebt > 5000) {
        insights.push({
          id: `debt-${c.id}`,
          type: 'warning',
          category: 'debt',
          title: 'High Debt Risk',
          description: `${c.name} has a significant balance of KES ${c.totalDebt.toLocaleString()}.`,
          actionLabel: 'Contact Customer'
        });
      }
    });

    return insights;
  }
};
