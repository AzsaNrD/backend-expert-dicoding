const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParameter, userId, useCasePayload) {
    const { threadId, commentId } = useCaseParameter;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    const newReply = new NewReply(useCasePayload);
    return this._replyRepository.addReply(userId, commentId, newReply);
  }
}

module.exports = AddReplyUseCase;
