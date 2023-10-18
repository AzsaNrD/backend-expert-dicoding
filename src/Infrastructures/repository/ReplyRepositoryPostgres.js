const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(userId, commentId, newReply) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) returning id, content, owner',
      values: [id, content, userId, commentId, date],
    };

    const { rows } = await this._pool.query(query);

    return new AddedReply({ ...rows[0] });
  }

  async getReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async getReplyByCommentId(commentId) {
    const query = {
      text: `
        SELECT r.id, r.content, r.date, r.is_deleted, u.username
        FROM replies as r
        JOIN users as u
        ON r.owner = u.id
        WHERE r.comment_id = $1
        ORDER BY r.date ASC
      `,
      values: [commentId],
    };
    const { rows } = await this._pool.query(query);

    return rows.map((row) => new DetailReply(row));
  }

  async verifyReplyAccess(replyId, userId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyReplyAvailability(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = TRUE WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
