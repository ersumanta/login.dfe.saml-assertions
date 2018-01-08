const issuerAssertionsStorage = require('./issuerAssertionsStorage');
const staticIssuerAssertions = require('./staticIssuerAssertions');
const config = require('./../config');

let account;
if (config.assertions.type.toLowerCase() === 'api') {
  account = issuerAssertionsStorage;
} else {
  account = staticIssuerAssertions;
}
module.exports = account;
