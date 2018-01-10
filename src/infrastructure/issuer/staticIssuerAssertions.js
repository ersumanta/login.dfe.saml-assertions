
const issuerAssertions = [
  {
    id: 'EDUBASE1',
    assertions: [
      {
        Type: 'http://www.edubase.gov.uk/SAUserId',
        Value: '__user_id__',
      }, {
        Type: 'urn:oid:2.5.4.45',
        Value: '__oid__',
      },
    ],
  },
  {
    id: 'DQT1',
    assertions: [
      {
        Type: 'http://www.edubase.gov.uk/SAUserId',
        Value: '__user_id__',
      },
    ],
  },
];


const getById = async (id) => {
  const issuerAssertion = issuerAssertions.find(item => item.id.toLowerCase() === id.toLowerCase());
  return Promise.resolve(issuerAssertion || null);
};

module.exports = {
  getById,
};
