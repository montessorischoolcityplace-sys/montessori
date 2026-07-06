const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'cityplacemontessorischool-1',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const listAllSchoolsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllSchools');
}
listAllSchoolsRef.operationName = 'ListAllSchools';
exports.listAllSchoolsRef = listAllSchoolsRef;

exports.listAllSchools = function listAllSchools(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllSchoolsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getMyFavoriteSchoolsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyFavoriteSchools');
}
getMyFavoriteSchoolsRef.operationName = 'GetMyFavoriteSchools';
exports.getMyFavoriteSchoolsRef = getMyFavoriteSchoolsRef;

exports.getMyFavoriteSchools = function getMyFavoriteSchools(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyFavoriteSchoolsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createSchoolInquiryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSchoolInquiry', inputVars);
}
createSchoolInquiryRef.operationName = 'CreateSchoolInquiry';
exports.createSchoolInquiryRef = createSchoolInquiryRef;

exports.createSchoolInquiry = function createSchoolInquiry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSchoolInquiryRef(dcInstance, inputVars));
}
;

const addSchoolToFavoritesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddSchoolToFavorites', inputVars);
}
addSchoolToFavoritesRef.operationName = 'AddSchoolToFavorites';
exports.addSchoolToFavoritesRef = addSchoolToFavoritesRef;

exports.addSchoolToFavorites = function addSchoolToFavorites(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addSchoolToFavoritesRef(dcInstance, inputVars));
}
;
