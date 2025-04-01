import db from '../config/db.js';

export default class Inventory {
  static tableName = 'inventory';

  static async findAll() {
    return db(this.tableName).select('*');
  }

  static async findById(id) {
    return db(this.tableName).where('id', id).first();
  }

  static async create(itemData) {
    const [item] = await db(this.tableName)
      .insert(itemData)
      .returning('*');
    return item;
  }

  static async update(id, updates) {
    const [item] = await db(this.tableName)
      .where('id', id)
      .update(updates)
      .returning('*');
    return item;
  }

  static async deleteById(id) {
    return db(this.tableName).where('id', id).delete();
  }
}