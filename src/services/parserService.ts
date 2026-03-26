import { type Product, type Customer } from './db';

export interface ParsedCommand {
  action: 'sale' | 'purchase' | 'bulk-break' | 'unknown';
  quantity: number;
  productName: string;
  product?: Product;
  customerName?: string;
  customer?: Customer;
  paymentMethod: 'cash' | 'mpesa' | 'airtel' | 'credit' | 'bank';
  unit?: string;
  raw: string;
}

export const parserService = {
  parse(input: string, products: Product[], customers: Customer[]): ParsedCommand {
    const text = input.toLowerCase().trim();
    const result: ParsedCommand = {
      action: 'unknown',
      quantity: 1,
      productName: '',
      paymentMethod: 'cash',
      raw: input
    };

    // 1. Detect Action
    const saleKeywords = ['sold', 'uza', 'sell', 'sale', 'peana'];
    const purchaseKeywords = ['ongeza', 'add', 'buy', 'purchase', 'stock', 'nunua'];
    const creditKeywords = ['kopesha', 'credit', 'debt', 'deni'];
    const bulkKeywords = ['fungua', 'break', 'open', 'pasua'];

    if (saleKeywords.some(k => text.includes(k))) result.action = 'sale';
    else if (purchaseKeywords.some(k => text.includes(k))) result.action = 'purchase';
    else if (creditKeywords.some(k => text.includes(k))) {
      result.action = 'sale';
      result.paymentMethod = 'credit';
    }
    else if (bulkKeywords.some(k => text.includes(k))) result.action = 'bulk-break';

    // 2. Extract Quantity & Units
    const qtyMatch = text.match(/(\d+(\.\d+)?)/);
    if (qtyMatch) {
      result.quantity = parseFloat(qtyMatch[1]);
    }

    // Special case: "half" or "nusu"
    if (text.includes('half') || text.includes('nusu')) {
      if (!qtyMatch) result.quantity = 0.5;
      else if (text.includes('half-bag') || text.includes('nusu-bag')) {
        // If they said "1 half-bag", it's still 0.5 of a full bag conceptually
        // but let's treat "half" as a modifier
        result.quantity = result.quantity * 0.5;
      }
    }

    // 3. Unit Detection
    const units = ['bag', 'kg', 'vial', 'packet', 'mkebe', 'litres', 'l'];
    for (const u of units) {
      if (text.includes(u)) {
        result.unit = u;
        break;
      }
    }
    if (text.includes('half-bag') || text.includes('nusu-bag')) result.unit = 'bag';

    // 4. Detect Payment Method
    if (text.includes('mpesa') || text.includes('m-pesa')) result.paymentMethod = 'mpesa';
    else if (text.includes('airtel')) result.paymentMethod = 'airtel';
    else if (text.includes('bank') || text.includes('transfer') || text.includes('wire') || text.includes('kcb') || text.includes('equity')) result.paymentMethod = 'bank';
    else if (text.includes('cash') || text.includes('pesa mkononi')) result.paymentMethod = 'cash';
    else if (result.paymentMethod !== 'credit' && (text.includes('deni') || text.includes('kopesha'))) {
      result.paymentMethod = 'credit';
    }

    // 5. Match Product (via name or aliases)
    // Sort products by name length descending to match longest names first (prevent partial matches)
    const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length);
    for (const p of sortedProducts) {
      const namesToMatch = [
        p.name.toLowerCase(), 
        ...p.aliases.map(a => a.toLowerCase())
      ];
      
      // Use word boundary check for better matching
      const found = namesToMatch.some(n => {
        const regex = new RegExp(`\\b${n}\\b`, 'i');
        return regex.test(text);
      });

      if (found) {
        result.product = p;
        result.productName = p.name;
        break;
      }
    }

    // 6. Match Customer
    // Look for names after prepositions or just in the text
    const sortedCustomers = [...customers].sort((a, b) => b.name.length - a.name.length);
    for (const c of sortedCustomers) {
      const name = c.name.toLowerCase();
      const regex = new RegExp(`\\b${name}\\b`, 'i');
      if (regex.test(text)) {
        result.customer = c;
        result.customerName = c.name;
        
        // If a customer is mentioned and it's a sale, and no payment method was specified,
        // it's often a credit transaction in this context.
        if (result.action === 'sale' && !text.includes('mpesa') && !text.includes('airtel') && !text.includes('cash')) {
          // If "kopesha" or "deni" is present, it's definitely credit.
          // If not, we might still want to flag it or let the user confirm.
          if (text.includes('kopesha') || text.includes('deni') || text.includes('credit')) {
            result.paymentMethod = 'credit';
          }
        }
        break;
      }
    }

    // Fallback action detection if still unknown but product found
    if (result.action === 'unknown' && result.product) {
      if (text.includes('to') || text.includes('for') || text.includes('kwa')) {
        result.action = 'sale';
      } else {
        result.action = 'sale'; // Default to sale for simplicity in Smart Log
      }
    }

    return result;
  }
};
