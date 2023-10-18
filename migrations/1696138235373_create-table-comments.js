/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      references: 'users(id)',
      referencesConstraintName: 'fk_comments.owner_users.id',
      onDelete: 'CASCADE',
    },
    thread_id: {
      type: 'VARCHAR(50)',
      references: 'threads(id)',
      referencesConstraintName: 'fk_comments.thread_id_threads.id',
      onDelete: 'CASCADE',
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
