const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParameter, userId, useCasePayload) {
    const { threadId } = useCaseParameter;
    await this._threadRepository.verifyThreadAvailability(threadId);
    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.addComment(userId, threadId, newComment);
  }
}

module.exports = AddCommentUseCase;
