import db from '../config/db.js';
import logger from '../utils/logger.js';

export default class User {
  static tableName = 'users';

  static async findByEmail(email, trx = null) {
    const query = db(this.tableName).where('email', email);
    if (trx) query.transacting(trx);
    return query.first();
  }

  static async findById(id, trx = null) {
    const query = db(this.tableName).where('id', id);
    if (trx) query.transacting(trx);
    return query.first();
  }

  static async create(userData, trx = null) {
    const query = db(this.tableName).insert(userData).returning('*');
    if (trx) query.transacting(trx);
    const [user] = await query;
    return user;
  }

  static async update(id, updates, trx = null) {
    const query = db(this.tableName)
      .where('id', id)
      .update(updates)
      .returning('*');
    
    if (trx) query.transacting(trx);
    const [user] = await query;
    return user;
  }

  static async updatePassword(id, newPassword, trx = null) {
    return this.update(id, { 
      password: newPassword,
      temp_password: false 
    }, trx);
  }
}