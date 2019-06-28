class Settings extends Map {
  constructor() {
    super();

    this.funds = {};
    this.set('streamOperation', false);
    this.comment = new Map();
    this.transfer = new Map();
    this.funds.track = new Map();

    // A new proxy to validate the types set arguments
    const validate = validator => new Proxy(Map.prototype.set, { apply: validator });

    this.comment.set = validate(this._validateComment);
    this.transfer.set = validate(this._validateTransfer);
    this.funds.track.set = validate(this._validateFundsTrack);
  }

  /**
   * Clears all settings
   */
  clear() {
    this.set('streamOperation', false);
    this.comment.clear();
    this.transfer.clear();
    this.funds.track.clear();
  }

  /**
   * Validate user comments arguments
   */
  _validateComment(target, that, args) {
    const [option, value] = args;

    switch (option) {
      case 'authors':
        if (!Array.isArray(value)) throw new Error('InvalidArgument: authors should be an `array`');
        break;
      default:
        throw new Error(`InvalidArgument: ${option} option is not supported!`);
    }
    target.apply(that, args);
  }

  /**
   * Validate transfer arguments
   */
  _validateTransfer(target, that, args) {
    const [option, value] = args;

    switch (option) {
      case 'senders':
        if (!Array.isArray(value)) throw new Error('InvalidArgument: senders should be an `array`');
        break;
      case 'receivers':
        if (!Array.isArray(value)) throw new Error('InvalidArgument: receivers should be an `array`');
        break;
      default:
        throw new Error(`InvalidArgument: ${option} option is not supported!`);
    }
    target.apply(that, args);
  }

  /**
   * Validate funds track arguments
   */
  _validateFundsTrack(target, that, args) {
    const [option, value] = args;

    switch (option) {
      case 'parentSender':
        if (typeof value !== 'string') throw new Error('InvalidArgument: parentSender should be `string`');
        break;

      default:
        throw new Error(`InvalidArgument: ${option} option is not supported!`);
    }
    target.apply(that, args);
  }
}

module.exports = Settings;
