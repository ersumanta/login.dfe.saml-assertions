'use strict';

const logger = require('./../../infrastructure/logger');
const accountApi = require('./../../infrastructure/account');
const organisationApi = require('./../../infrastructure/organisation');
const UserAccountAssertionModel = require('./userAssertionModel');
const issuerAssertions = require('./../../infrastructure/issuer');
const { getServicesByUserId } = require('./../../infrastructure/access');
const { getServiceById } = require('./../../infrastructure/applications');
const doesServiceMeetRequestCriteria = (service, req) => {
  if (service.serviceId.toLowerCase() !== req.params.serviceId.toLowerCase()) {
    return false;
  }

  if (req.params.organisationId && service.organisationId.toLowerCase() !== req.params.organisationId.toLowerCase()) {
    return false;
  }

  return true;
};

const get = async (req, res) => {
  const correlationId = req.header('x-correlation-id');
  try {
    logger.info('Corona Virus Test:: req '+req);
    if (!req.params.userId || !req.params.serviceId) {
      return res.status(400).send();
    }
    logger.info('Corona Virus Test::req.params.serviceId:'+req.params.serviceId);

    const user = await accountApi.getById(req.params.userId, correlationId);
    if (!user) {
      return res.status(404).send();
    }

    let userOrganisation;
    if (req.params.organisationId) {
      const userOrganisations = await organisationApi.getOrganisationsForUser(req.params.userId, correlationId) || [];
      userOrganisation = userOrganisations.find(x => x.organisation.id.toLowerCase() === req.params.organisationId.toLowerCase());
      if (!userOrganisation) {
        return res.status(404).send();
      }
    }

    const services = await getServicesByUserId(req.params.userId, correlationId);
    if(req.params.serviceId === 'b45616a1-19a7-4a2e-966d-9e28c99bc6c6') {
      const organisation = await organisationApi.getOrganisationById(req.params.organisationId, correlationId);
      if (!organisation) {
        logger.info('Corona Virus Test:: !getOrganisationById');
        return res.status(404).send();
      }
      const issuerAssertion = await issuerAssertions.getById(req.params.serviceId);
      if (!issuerAssertion) {
        logger.info('Corona Virus Test:: !issuerAssertion');
        return res.status(404).send();
      }
      const service = await getServiceById(req.params.serviceId,correlationId);
      if (!service) {
        logger.info('Corona Virus Test:: !serviceCriteria');
        return res.status(404).send();
      }
      logger.info('Corona Virus Test:: service here..service.identifiers'+ service.identifiers);
      logger.info('Corona Virus Test:: issuerAssertion here..issuerAssertion'+ issuerAssertion.assertions);
      logger.info('Corona Virus Test:: organisation here..organisation'+ JSON.stringify(organisation));
      const userAccountAssertionModel = new UserAccountAssertionModel()
          .setUserPropertiesFromAccount(user)
          .setUserPropertiesFromUserOrganisation(userOrganisation)
          //.setServicePropertiesFromService(service)
          .setOrganisationPropertiesFromOrganisation(organisation)
          .buildAssertions(issuerAssertion.assertions);
      logger.info('Corona Virus Test:: Ends here..');
      const result = userAccountAssertionModel.export();
      res.send(result);
    }else {
      if (!services) {
        logger.info('Corona Virus Test:: !services');
        return res.status(404).send();
      }

      const servicesMeetingCriteria = services.filter(s => doesServiceMeetRequestCriteria(s, req));
      const service = servicesMeetingCriteria && servicesMeetingCriteria.length > 0 ? servicesMeetingCriteria[0] : undefined;
      if (!service) {
        logger.info('Corona Virus Test:: !servicesMeetingCriteria');
        return res.status(404).send();
      }

      const organisation = await organisationApi.getOrganisationById(service.organisationId, correlationId);
      if (!organisation) {
        logger.info('Corona Virus Test:: !getOrganisationById');
        return res.status(404).send();
      }

      const issuerAssertion = await issuerAssertions.getById(service.serviceId);
      if (!issuerAssertion) {
        logger.info('Corona Virus Test:: !issuerAssertion');
        return res.status(404).send();
      }

      const userAccountAssertionModel = new UserAccountAssertionModel()
          .setUserPropertiesFromAccount(user)
          .setUserPropertiesFromUserOrganisation(userOrganisation)
          .setServicePropertiesFromService(service)
          .setOrganisationPropertiesFromOrganisation(organisation)
          .buildAssertions(issuerAssertion.assertions);

      const result = userAccountAssertionModel.export();
      res.send(result);
    }
  } catch (e) {
    logger.error(e);
    res.status(500).send();
  }
};

module.exports = get;
