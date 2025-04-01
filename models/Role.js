import db from '../config/db.js';

export default class Role {
  static tableName = 'roles';

  static async findByName(name, trx = null) {
    const query = db(this.tableName).where('name', name);
    if (trx) query.transacting(trx);
    return query.first();
  }

  static async create(roleData, trx = null) {
    const query = db(this.tableName).insert(roleData).returning('*');
    if (trx) query.transacting(trx);
    const [role] = await query;
    return role;
  }
}