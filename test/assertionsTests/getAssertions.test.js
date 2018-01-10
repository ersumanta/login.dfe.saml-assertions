'use strict';

jest.mock('./../../src/infrastructure/logger');
jest.mock('./../../src/infrastructure/config', () => ({
  directories: {
    type: 'static',
  },
  assertions: {
    type: 'static',
  },
}));
jest.mock('./../../src/infrastructure/account');
jest.mock('./../../src/infrastructure/issuer');
const httpMocks = require('node-mocks-http');
const accountAssertionModel = require('./../../src/app/assertions/userAssertionModel');

describe('When getting issuer assertions', () => {
  let req;
  let res;
  let logger;
  let get;
  let getUserByIdStub;
  let getIssuerAssertions;
  let account;
  let issuerAssertions;
  const expectedUserId = '123EDCF';
  const expectedIssuer = 'issuer1';
  const expectedUserEmail = 'test@user.com';
  const expectedRequestCorrelationId = '41ab33e5-4c27-12e9-3451-abb349b12f35';
  const user = { sub: expectedUserId, email: expectedUserEmail };
  const issuerAssertion = { id: 'DQT1',
    assertions: [
      {
        Type: 'http://www.test.me.uk/SAUserId',
        Value: '__user_id__',
      },
      {
        Type: 'http://www.test.me.uk/SomeParam',
        Value: '__user_param__',
      },
    ] };

  beforeEach(() => {
    res = httpMocks.createResponse();
    req = {
      params: {
        userId: expectedUserId,
        issuer: expectedIssuer,
      },
      headers: {
        'x-correlation-id': expectedRequestCorrelationId,
      },
      header(header) {
        return this.headers[header];
      },
    };

    logger = require('./../../src/infrastructure/logger');
    logger.error = (() => ({}));

    getUserByIdStub = jest.fn().mockReturnValue(user);
    account = require('./../../src/infrastructure/account');
    account.getById = getUserByIdStub;

    getIssuerAssertions = jest.fn().mockReturnValue(issuerAssertion);
    issuerAssertions = require('./../../src/infrastructure/issuer');
    issuerAssertions.getById = getIssuerAssertions;

    get = require('../../src/app/assertions/getAssertions');
  });
  afterEach(() => {
    expect(res._isEndCalled()).toBe(true);
  });
  it('then a bad request is returned if the user id is not passed', async () => {
    req.params.userId = '';

    await get(req, res);

    expect(res.statusCode).toBe(400);
  });
  it('then a bad request is returned if the issuer is not passed', async () => {
    req.params.issuer = '';

    await get(req, res);

    expect(res.statusCode).toBe(400);
  });
  it('then if the user is not found a 404 is returned', async () => {
    account.getById.mockReset();
    account.getById.mockReturnValue(null);

    await get(req, res);

    expect(res.statusCode).toBe(404);
  });
  it('then if the record is found it is returned in the response', async () => {
    account.getById.mockReset();
    account.getById.mockReturnValue(user);

    await get(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getData().email).toBe(expectedUserEmail);
    expect(res._getData().user_id).toBe(expectedUserId);
    expect(res._getData().id).toBe(expectedIssuer);
    expect(account.getById.mock.calls[0][0]).toBe(expectedUserId);
    expect(account.getById.mock.calls[0][1]).toBe(expectedRequestCorrelationId);
  });
  it('then an accountAssertionModel is returned', async () => {
    await get(req, res);

    expect(res._getData()).toBeInstanceOf(accountAssertionModel);
  });
  it('then the assertionServices storage is called', async () => {
    await get(req, res);

    expect(issuerAssertions.getById.mock.calls[0][0]).toBe(expectedIssuer);
  });
  it('then if no assertions for the user are returned a 404 is returned', async () => {
    issuerAssertions.getById.mockReset();
    issuerAssertions.getById.mockReturnValue(null);

    await get(req, res);

    expect(res.statusCode).toBe(404);
  });
  it('then the assertions are mapped to the response', async () => {
    await get(req, res);

    expect(res._getData().Assertions[0].Value).toBe(expectedUserId);
  });
  it('then assertions with no map are not changed', async () => {
    await get(req, res);

    expect(res._getData().Assertions[1].Value).toBe('__user_param__');
  });
  it('then a 500 response is returned if there is an error', async () => {
    account.getById.mockReset();
    account.getById = () => {
      throw new Error();
    };

    await get(req, res);

    expect(res.statusCode).toBe(500);
  });
});
