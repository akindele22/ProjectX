/**
 * Migration template with full TypeScript support and error handling
 * @param {import("knex").Knex} knex - Knex instance
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.transaction(async (trx) => {
      try {
        // Creating table with proper constraints
        if (!(await trx.schema.hasTable('example_table'))) {
          await trx.schema.createTable('example_table', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.text('description');
            table.integer('reference_id').unsigned()
              .references('id').inTable('other_table').onDelete('CASCADE');
            table.timestamps(true, true);
            table.comment('Example table with proper constraints');
          });
          console.log('Created example_table');
        }
  
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        console.error('Migration failed:', error);
        throw error;
      }
    });
  }
  
  /**
   * Rollback function with proper cleanup
   * @param {import("knex").Knex} knex - Knex instance
   * @returns {Promise<void>}
   */
  export async function down(knex) {
    await knex.transaction(async (trx) => {
      try {
        // Drop table in reverse order
        await trx.schema.dropTableIfExists('example_table');

  
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        console.error('Rollback failed:', error);
        throw error;
      }
    });
  }