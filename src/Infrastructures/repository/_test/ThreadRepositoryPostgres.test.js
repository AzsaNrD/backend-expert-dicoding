const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-111',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add new thread to database and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'thread-title',
        body: 'thread-body',
      });
      const userId = 'user-111';
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(userId, newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'thread-title',
        body: 'thread-body',
      });
      const userId = 'user-111';
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(userId, newThread);

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');
      expect(thread).toBeDefined();
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('thread-title');
      expect(thread.body).toEqual('thread-body');
      expect(thread.date).toBeDefined();
      expect(thread.username).toEqual('dicoding');
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw error if thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-xxx'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
