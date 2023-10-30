const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
// const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
// const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewLike = require('../../../Domains/likes/entities/NewLike');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      username: 'userlike123',
    });
    await ThreadsTableTestHelper.addThread({
      title: 'thread-likes',
    });
    await CommentsTableTestHelper.addComment({
      threadId: 'thread-likes',
    });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addLike function', () => {
    it('should add like to database', async () => {
      // Arrange
      const newLike = new NewLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(newLike);

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like from database', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        comment_id: 'comment-123',
        owner: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const like = await LikesTableTestHelper.findLikeById('like-123');
      expect(like).toHaveLength(0);
    });
  });

  describe('verifyIsLiked function', () => {
    it('should verify is liked and return true', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        comment_id: 'comment-123',
        owner: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action and Assert
      const isLiked = await likeRepositoryPostgres.verifyIsLiked('comment-123', 'user-123');
      expect(isLiked).toBeTruthy();
    });

    it('should verify is liked and return false', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action and Assert
      const isLiked = await likeRepositoryPostgres.verifyIsLiked('comment-123', 'user-123');
      expect(isLiked).toBeFalsy();
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should get like count by comment id', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        comment_id: 'comment-123',
        owner: 'user-123',
      });
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await likeRepository.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likeCount).toEqual(1);
    });
  });
});
