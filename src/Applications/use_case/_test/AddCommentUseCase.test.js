const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'example-content',
    };
    const useCaseParameter = {
      threadId: 'thread-123',
    };
    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });
    const userId = 'user-123';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCaseParameter, userId, useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));
    expect(mockCommentRepository.addComment)
      .toBeCalledWith(userId, useCaseParameter.threadId, new NewComment({
        content: useCasePayload.content,
      }));
    expect(mockThreadRepository.verifyThreadAvailability)
      .toBeCalledWith(useCaseParameter.threadId);
  });
});
