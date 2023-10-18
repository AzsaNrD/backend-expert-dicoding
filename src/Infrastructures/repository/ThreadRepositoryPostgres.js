const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(userId, newThread) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) returning id, title, owner',
      values: [id, title, body, userId, date],
    };

    const { rows } = await this._pool.query(query);

    return new AddedThread({ ...rows[0] });
  }

  async getThreadById(id) {
    const query = {
      text: `
        SELECT t.id, t.title, t.body, t.date, u.username
        FROM threads as t
        JOIN users as u
        ON t.owner = u.id
        WHERE t.id = $1
      `,
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async verifyThreadAvailability(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
