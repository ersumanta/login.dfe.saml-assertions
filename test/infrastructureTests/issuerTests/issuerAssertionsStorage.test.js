jest.mock('./../../../src/infrastructure/config', () => ({
  assertions: {
    redisUrl: 'http://orgs.api.test',
  },
}));

jest.mock('ioredis', () => jest.fn().mockImplementation(() => {

}));
jest.mock('./../../../src/infrastructure/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('When using the redis issuer assertion storage', () => {
  let issuerAssertionsStorage;
  const expectedIssuer = 'DQT1';
  beforeEach(()=>{
    jest.resetModules();
  });
  describe('and getting assertions for an issuer', () => {
    it('then if the issuer id is not supplied then null is returned', async () => {
      jest.doMock('ioredis', () => jest.fn().mockImplementation(() => {
        const RedisMock = require('ioredis-mock').default;
        const redisMock = new RedisMock();
        return redisMock;
      }));
      issuerAssertionsStorage = require('./../../../src/infrastructure/issuer/issuerAssertionsStorage');

      const actual = await issuerAssertionsStorage.getById('123EDC');

      expect(actual).toBeNull();
    });
    it('then if the record exists it is returned', async () => {
      jest.doMock('ioredis', () => jest.fn().mockImplementation(() => {
        const RedisMock = require('ioredis-mock').default;
        const redisMock = new RedisMock();
        redisMock.set('IssuerAssertions_DQT1', '{"id":"DQT1","assertions":[{"Type": "tester", "Value": "__testValue__"}]}');
        return redisMock;
      }));
      issuerAssertionsStorage = require('./../../../src/infrastructure/issuer/issuerAssertionsStorage');

      const actual = await issuerAssertionsStorage.getById(expectedIssuer);

      expect(actual).not.toBeNull();
    });
  });
});
