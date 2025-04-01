import pool from '../config/db.js';

class Permission {
  static async create({ name, description }) {
    const query = `
      INSERT INTO permissions (name, description, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *;
    `;
    const values = [name, description];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM permissions WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM permissions';
    const { rows } = await pool.query(query);
    return rows;
  }
}

export default Permission;