const pool = require('../../database/postgres/pool');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  it('should response 201 and persisted comment', async () => {
    // Arrange
    const server = await createServer(container);
    const { commentId, accessToken, threadId } = await ServerTestHelper.addComment(server);

    // Action
    const response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
  });

  it('should response 404 if comment not found', async () => {
    // Arrange
    const server = await createServer(container);
    const { threadId, accessToken } = await ServerTestHelper.addThread(server);

    // Action
    const response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/comment-xxx/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('comment tidak ditemukan');
  });
});
