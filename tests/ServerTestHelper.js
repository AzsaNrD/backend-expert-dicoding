/* istanbul ignore file */
const ServerTestHelper = {
  async getAccessToken(server, username = 'dicoding') {
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password: 'secret',
        fullname: `${username} fullname`,
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password: 'secret',
      },
    });

    return {
      accessToken: JSON.parse(responseAuth.payload).data.accessToken,
    };
  },

  async addThread(server) {
    const { accessToken } = await ServerTestHelper.getAccessToken(server, 'usertest');

    const requestPayload = {
      title: 'title-thread',
      body: 'body-thread',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      threadId: JSON.parse(response.payload).data.addedThread.id,
      accessToken,
    };
  },

  async addComment(server) {
    const { threadId, accessToken } = await ServerTestHelper.addThread(server);

    const requestPayload = {
      content: 'content-comment',
    };

    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      commentId: JSON.parse(response.payload).data.addedComment.id,
      accessToken,
      threadId,
    };
  },

  async addReply(server) {
    const { commentId, threadId, accessToken } = await ServerTestHelper.addComment(server);

    const requestPayload = {
      content: 'reply-content',
    };

    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      replyId: JSON.parse(response.payload).data.addedReply.id,
      commentId,
      threadId,
      accessToken,
    };
  },
};

module.exports = ServerTestHelper;
