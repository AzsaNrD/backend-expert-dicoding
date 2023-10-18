const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    await this._threadRepository.verifyThreadAvailability(threadId);
    const detailThread = await this._threadRepository.getThreadById(threadId);
    const detailComment = await this._commentRepository.getCommentByThreadId(threadId);

    const comments = await Promise.all(detailComment.map(async (comment) => {
      const replies = await this._getRepliesByCommentId(comment.id);
      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        replies,
        content: comment.content,
      };
    }));

    return new DetailThread({
      ...detailThread,
      comments,
    });
  }

  async _getRepliesByCommentId(commentId) {
    const replies = await this._replyRepository.getReplyByCommentId(commentId);
    return replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      date: reply.date,
      username: reply.username,
    }));
  }
}

module.exports = GetThreadUseCase;
