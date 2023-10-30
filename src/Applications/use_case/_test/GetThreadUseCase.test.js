const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the detail thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };
    const mockDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'example-title',
      body: 'example-body',
      date: '2023-10-10T13:58:49.546Z',
      username: 'user123',
      comments: [],
    });
    const comment1 = new DetailComment({
      id: 'comment-123',
      username: 'user123',
      date: '2023-10-11T01:34:05.525Z',
      content: 'example-comment',
      replies: [],
      likeCount: 0,
      is_deleted: false,
    });
    const comment2 = new DetailComment({
      id: 'comment-234',
      username: 'user234',
      date: '2023-10-11T01:36:20.082Z',
      content: 'example-comment',
      replies: [],
      likeCount: 0,
      is_deleted: true,
    });
    const mockDetailComment = [comment1, comment2];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailComment));
    mockReplyRepository.getReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(0));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCaseParams);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCaseParams.threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.getReplyByCommentId).toBeCalledWith(comment1.id);
    expect(mockLikeRepository.getLikeCountByCommentId).toBeCalledWith(comment1.id);
    expect(detailThread).toStrictEqual(new DetailThread({
      id: 'thread-123',
      title: 'example-title',
      body: 'example-body',
      date: '2023-10-10T13:58:49.546Z',
      username: 'user123',
      comments: [
        {
          id: 'comment-123',
          username: 'user123',
          date: '2023-10-11T01:34:05.525Z',
          replies: [],
          content: 'example-comment',
          likeCount: 0,
        },
        {
          id: 'comment-234',
          username: 'user234',
          date: '2023-10-11T01:36:20.082Z',
          replies: [],
          content: '**komentar telah dihapus**',
          likeCount: 0,
        },
      ],
    }));
  });
});
