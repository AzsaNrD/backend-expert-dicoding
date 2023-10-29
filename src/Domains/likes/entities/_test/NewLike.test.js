const NewLike = require('../NewLike');

describe('NewLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type spesification', () => {
    const payload = {
      commentId: 'comment-123',
      owner: [],
    };

    // Action and Assert
    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_MEET_DATA');
  });

  it('should create newLike object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const { commentId, owner } = new NewLike(payload);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
