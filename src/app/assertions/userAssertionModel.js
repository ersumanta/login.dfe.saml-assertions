class userAssertionModel {

  get UserAssertions() {
    return this.Assertions;
  }

  set UserAssertions(value) {
    this.Assertions = value;
  }

  get UserId() {
    return this.user_id;
  }
  set UserId(value) {
    this.user_id = value;
  }
  get UserEmail() {
    return this.email;
  }
  set UserEmail(value) {
    this.email = value;
  }
  get Issuer() {
    return this.id;
  }
  set Issuer(value) {
    this.id = value;
  }
}

module.exports = userAssertionModel;
