const NewLike = require('../../../Domains/likes/entities/NewLike');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should orchestrate the add like action correctly', async () => {
    // Arrange
    const useCaseParameter = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const userId = 'user-123';

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyIsLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addLikeUseCase = new AddLikeUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await addLikeUseCase.execute(useCaseParameter, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toBeCalledWith(useCaseParameter.threadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toBeCalledWith(useCaseParameter.commentId);
    expect(mockLikeRepository.verifyIsLiked)
      .toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.addLike)
      .toBeCalledWith(new NewLike({ commentId: 'comment-123', owner: 'user-123' }));
  });

  it('should orchestrate the delete like action correctly', async () => {
    // Arrange
    const useCaseParameter = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const userId = 'user-123';

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyIsLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addLikeUseCase = new AddLikeUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await addLikeUseCase.execute(useCaseParameter, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toBeCalledWith(useCaseParameter.threadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toBeCalledWith(useCaseParameter.commentId);
    expect(mockLikeRepository.verifyIsLiked)
      .toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.deleteLike)
      .toBeCalledWith('comment-123', 'user-123');
  });
});
