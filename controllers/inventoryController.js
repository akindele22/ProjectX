import Inventory from '../models/inventory.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export class InventoryController {
  static async getAllItems(req, res) {
    try {
      const items = await Inventory.findAll();
      return successResponse(res, 200, items);
    } catch (error) {
      console.error('Error getting inventory items:', error);
      return errorResponse(res, 500, 'Failed to get inventory items');
    }
  }

  static async getItemById(req, res) {
    try {
      const item = await Inventory.findById(req.params.id);
      if (!item) {
        return errorResponse(res, 404, 'Inventory item not found');
      }
      return successResponse(res, 200, item);
    } catch (error) {
      console.error('Error getting inventory item:', error);
      return errorResponse(res, 500, 'Failed to get inventory item');
    }
  }

  static async createItem(req, res) {
    try {
      const { name, description, price, quantity, sku } = req.body;
      const createdBy = req.user.id;

      const item = await Inventory.create({
        name,
        description,
        price,
        quantity,
        sku,
        created_by: createdBy
      });

      return successResponse(res, 201, item);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      return errorResponse(res, 500, 'Failed to create inventory item');
    }
  }

  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const item = await Inventory.update(id, updates);
      return successResponse(res, 200, item);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return errorResponse(res, 500, 'Failed to update inventory item');
    }
  }

  static async deleteItem(req, res) {
    try {
      await Inventory.deleteById(req.params.id);
      return successResponse(res, 204);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      return errorResponse(res, 500, 'Failed to delete inventory item');
    }
  }
}