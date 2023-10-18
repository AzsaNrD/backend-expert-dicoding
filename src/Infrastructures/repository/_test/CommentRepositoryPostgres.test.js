const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'usercomment123',
    });
    await UsersTableTestHelper.addUser({
      id: 'user-456',
      username: 'usercomment456',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'thread-title',
      body: 'thread-body',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add comment to database', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'example-content',
      });
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(userId, threadId, newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });
  });

  describe('getCommentById function', () => {
    it('should return comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'example-content',
      });
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(userId, threadId, newComment);

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');
      expect(comment).toEqual({
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'example-content',
        owner: 'user-123',
        date: expect.any(String),
        is_deleted: false,
      });
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should get comment correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'example-content-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        owner: 'user-456',
        content: 'example-content-456',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('usercomment123');
      expect(comments[1].id).toEqual('comment-456');
      expect(comments[1].username).toEqual('usercomment456');
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError if user id not owner', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'example-content',
      });
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(userId, threadId, newComment);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess('comment-123', 'user-456')).rejects.toThrow(
        AuthorizationError,
      );
    });

    it('should verify comment access', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'example-content',
      });
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(userId, threadId, newComment);

      // Action
      await commentRepositoryPostgres.verifyCommentAccess('comment-123', userId);

      // Assert
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');
      expect(comment).toBeDefined();
      expect(comment.owner).toEqual(userId);
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw error if comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-xxx'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteComment function', () => {
    it('should set is_deleted to true', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'example-content',
      });
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(userId, threadId, newComment);

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toBeDefined();
      expect(comment[0].is_deleted).toEqual(true);
    });
  });
});
