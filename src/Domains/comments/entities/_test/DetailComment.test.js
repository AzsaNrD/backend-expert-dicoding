const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username123',
      date: '2023-10-10T11:35:41.625Z',
      content: 'comment-content',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type spesification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2023-10-10T11:43:07.806Z',
      content: 12345,
      replies: [],
      is_deleted: 'false',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2023-10-10T11:43:07.806Z',
      content: 'comment-content',
      replies: [],
      is_deleted: false,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.content).toEqual(payload.content);
  });

  it('should content be **komentar telah dihapus** if is_deleted is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2023-10-16T00:16:22.153Z',
      content: 'comment-content',
      replies: [],
      is_deleted: true,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
  });
});
