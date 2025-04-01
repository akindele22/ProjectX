import db from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

export class CheckoutController {
  static async processCheckout(req, res) {
    const trx = await db.transaction();
    try {
      const { items } = req.body;
      const userId = req.user.id;
      
      // 1. Validate inventory and lock rows
      for (const item of items) {
        const inventory = await trx('inventory')
          .where('id', item.inventoryId)
          .forUpdate()
          .first();
        
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for item ${item.inventoryId}`);
        }
      }
      
      // 2. Update inventory
      for (const item of items) {
        await trx('inventory')
          .where('id', item.inventoryId)
          .decrement('quantity', item.quantity);
      }
      
      // 3. Create order
      const [order] = await trx('orders')
        .insert({
          user_id: userId,
          status: 'completed',
          total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
        .returning('*');
      
      // 4. Create order items
      const orderItems = await Promise.all(
        items.map(item => 
          trx('order_items').insert({
            order_id: order.id,
            inventory_id: item.inventoryId,
            quantity: item.quantity,
            price: item.price
          })
        )
      );
      
      await trx.commit();
      return successResponse(res, 201, { order, orderItems });
    } catch (error) {
      await trx.rollback();
      logger.error('Checkout processing error:', error);
      return errorResponse(res, 500, 'Checkout failed: ' + error.message);
    }
  }

  static async getCheckoutHistory(req, res) {
    try {
      const orders = await db('orders')
        .where('user_id', req.user.id)
        .select('*');
      
      return successResponse(res, 200, orders);
    } catch (error) {
      logger.error('Get checkout history error:', error);
      return errorResponse(res, 500, 'Failed to get checkout history');
    }
  }
}