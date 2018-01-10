const config = require('./../../infrastructure/config');
const logger = require('./../../infrastructure/logger');
const Redis = require('ioredis');

const client = new Redis(config.assertions.redisUrl);

const getIssuerAssertionById = async (id) => {
  const result = await client.get(`IssuerAssertions_${id}`);
  if (!result) {
    return null;
  }
  const issuerAssertions = JSON.parse(result);
  return issuerAssertions || null;
};

const getById = async (id, correlationId) => {
  try {
    logger.info(`Get issuerAssertion for request: ${correlationId}`);
    return await getIssuerAssertionById(id);
  } catch (e) {
    logger.error(`Get issuerAssertion failed for request ${correlationId} error: ${e}`);
    throw e;
  }
};

module.exports = {
  getById,
};
