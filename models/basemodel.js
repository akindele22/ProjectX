import db from '../config/db.js';
import logger from '../utils/logger.js';

export default class BaseModel {
  static tableName = '';

  static query() {
    return db(this.tableName);
  }

  static async findById(id, trx = null) {
    try {
      const query = this.query().where('id', id);
      if (trx) query.transacting(trx);
      return query.first();
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by id:`, error);
      throw error;
    }
  }

  static async findAll(trx = null) {
    try {
      const query = this.query().select('*');
      if (trx) query.transacting(trx);
      return query;
    } catch (error) {
      logger.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  static async deleteById(id, trx = null) {
    try {
      const query = this.query().where('id', id).delete().returning('*');
      if (trx) query.transacting(trx);
      const [result] = await query;
      return result;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName} by id:`, error);
      throw error;
    }
  }
}