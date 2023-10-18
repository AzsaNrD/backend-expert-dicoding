const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(userId, threadId, newComment) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) returning id, content, owner',
      values: [id, content, userId, threadId, date],
    };

    const { rows } = await this._pool.query(query);

    return new AddedComment({ ...rows[0] });
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `
        SELECT c.id, u.username, c.content, c.date, c.is_deleted
        FROM comments as c
        JOIN users as u
        ON c.owner = u.id
        WHERE c.thread_id = $1
        ORDER BY c.date ASC
      `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows.map((row) => new DetailComment({ ...row, replies: [] }));
  }

  async verifyCommentAccess(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
