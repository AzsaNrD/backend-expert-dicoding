class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, likeCount, replies, is_deleted,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.likeCount = likeCount;
    this.replies = replies;
    this.content = is_deleted ? '**komentar telah dihapus**' : content;
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, likeCount, replies, is_deleted,
    } = payload;

    if (
      !id ||
      !username ||
      !date ||
      !replies ||
      !content ||
      likeCount === undefined ||
      is_deleted === undefined
    ) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string' ||
      typeof likeCount !== 'number' ||
      !Array.isArray(replies) ||
      typeof is_deleted !== 'boolean'
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
