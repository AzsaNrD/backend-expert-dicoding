const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(newLike) {
    const { commentId, owner } = newLike;
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, owner, commentId],
    };

    await this._pool.query(query);
  }

  async deleteLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async verifyIsLiked(commentId, owner) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      return false;
    }

    return true;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);

    return +rows[0].count;
  }
}

module.exports = LikeRepositoryPostgres;
