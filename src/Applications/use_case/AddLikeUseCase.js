const NewLike = require('../../Domains/likes/entities/NewLike');

class AddLikeUseCase {
  constructor({ likeRepository, threadRepository, commentRepository }) {
    this._likeRepository = likeRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParameter, userId) {
    const { threadId, commentId } = useCaseParameter;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    if (await this._likeRepository.verifyIsLiked(commentId, userId)) {
      return this._likeRepository.deleteLike(commentId, userId);
    }
    return this._likeRepository.addLike(new NewLike({ commentId, owner: userId }));
  }
}

module.exports = AddLikeUseCase;
