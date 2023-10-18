const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
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
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'comment-content',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should add reply to database', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'reply-content',
      });
      const userId = 'user-123';
      const commentId = 'comment-123';
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(userId, commentId, newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });
  });

  describe('getReplyById function', () => {
    it('should return reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'reply-content',
      });
      const userId = 'user-123';
      const commentId = 'comment-123';
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(userId, commentId, newReply);

      // Action
      const reply = await replyRepositoryPostgres.getReplyById('reply-123');

      // Assert
      expect(reply).toBeDefined();
      expect(reply.id).toEqual('reply-123');
      expect(reply.content).toEqual('reply-content');
      expect(reply.owner).toEqual('user-123');
      expect(reply.comment_id).toEqual('comment-123');
      expect(reply.date).toBeDefined();
      expect(reply.is_deleted).toEqual(false);
    });
  });

  describe('getReplyByCommentId function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'reply-content-first',
        owner: 'user-123',
        date: '2023-10-15T04:53:46.120Z',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        content: 'reply-content-second',
        owner: 'user-456',
        date: '2023-10-15T04:54:13.698Z',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].content).toEqual('reply-content-first');
      expect(replies[0].date).toEqual('2023-10-15T04:53:46.120Z');
      expect(replies[1].id).toEqual('reply-456');
      expect(replies[1].content).toEqual('reply-content-second');
      expect(replies[1].date).toEqual('2023-10-15T04:54:13.698Z');
    });
  });

  describe('verifyReplyAccess function', () => {
    it('should throw AuthorizationError if user is not owner', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'reply-content',
      });
      const userId = 'user-123';
      const commentId = 'comment-123';
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(userId, commentId, newReply);

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess('reply-123', 'user-xxx')).rejects.toThrow(AuthorizationError);
    });

    it('should verify reply access', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'reply-content',
      });
      const userId = 'user-123';
      const commentId = 'comment-123';
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(userId, commentId, newReply);

      // Action
      await replyRepositoryPostgres.verifyReplyAccess('reply-123', userId);

      // Assert
      const reply = await replyRepositoryPostgres.getReplyById('reply-123');
      expect(reply).toBeDefined();
      expect(reply.owner).toEqual(userId);
    });
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError if reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-xxx'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteReply function', () => {
    it('should set is_deleted to true', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'reply-content',
      });
      const userId = 'user-123';
      const commentId = 'comment-123';
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(userId, commentId, newReply);

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toBeDefined();
      expect(reply[0].is_deleted).toEqual(true);
    });
  });
});
