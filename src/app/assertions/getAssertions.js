'use strict';

const logger = require('./../../infrastructure/logger');
const accountApi = require('./../../infrastructure/account');
const UserAccountAssertionModel = require('./userAssertionModel');
const issuerAssertions = require('./../../infrastructure/issuer');

const get = async (req, res) => {
  try {
    if (!req.params.userId || !req.params.issuer) {
      res.status(400).send();
      return;
    }

    const user = await accountApi.getById(req.params.userId, req.header('x-correlation-id'));

    if (!user) {
      res.status(404).send();
      return;
    }

    const userAccountAssertionModel = new UserAccountAssertionModel();
    userAccountAssertionModel.Issuer = req.params.issuer;
    userAccountAssertionModel.UserId = user.sub;
    userAccountAssertionModel.UserEmail = user.email;

    const issuerAssertion = await issuerAssertions.getById(req.params.issuer);

    if (!issuerAssertion) {
      res.status(404).send();
      return;
    }

    userAccountAssertionModel.UserAssertions = issuerAssertion.assertions.map((issuerA) => {
      const issuerMapped = issuerA;

      Object.keys(userAccountAssertionModel).forEach((assertion) => {
        if (`__${assertion.toLowerCase()}__` === issuerMapped.Value.toLowerCase()) {
          issuerMapped.Value = Object.values(userAccountAssertionModel)[Object.keys(userAccountAssertionModel).indexOf(assertion)];
        }
      });

      return issuerMapped;
    });

    res.send(userAccountAssertionModel);
  } catch (e) {
    logger.error(e);
    res.status(500).send();
  }
};

module.exports = get;
