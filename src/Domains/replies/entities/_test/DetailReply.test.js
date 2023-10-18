const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply-content',
      date: '2023-10-15T23:52:41.893Z',
      username: 'user-123',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type spesification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: [],
      date: '2023-10-15T23:52:59.775Z',
      username: 'user-123',
      is_deleted: false,
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply-content',
      date: '2023-10-15T23:57:09.340Z',
      username: 'user-123',
      is_deleted: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });

  it('should content be **balasan telah dihapus** if is_deleted is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply-content',
      date: '2023-10-16T00:20:24.612Z',
      username: 'user-123',
      is_deleted: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
  });
});
