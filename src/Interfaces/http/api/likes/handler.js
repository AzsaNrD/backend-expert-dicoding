const AddLikeUseCase = require('../../../../Applications/use_case/AddLikeUseCase');

class LikeHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request) {
    const { id: userId } = request.auth.credentials;
    const addLikeUseCase = this._container.getInstance(AddLikeUseCase.name);
    await addLikeUseCase.execute(request.params, userId);

    return {
      status: 'success',
    };
  }
}

module.exports = LikeHandler;
