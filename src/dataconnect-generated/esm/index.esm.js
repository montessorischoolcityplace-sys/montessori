import { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'cityplacemontessorischool-1',
  location: 'us-east4'
};
export const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
export const listAllSchoolsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllSchools');
}
listAllSchoolsRef.operationName = 'ListAllSchools';

export function listAllSchools(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllSchoolsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getMyFavoriteSchoolsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyFavoriteSchools');
}
getMyFavoriteSchoolsRef.operationName = 'GetMyFavoriteSchools';

export function getMyFavoriteSchools(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyFavoriteSchoolsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const createSchoolInquiryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSchoolInquiry', inputVars);
}
createSchoolInquiryRef.operationName = 'CreateSchoolInquiry';

export function createSchoolInquiry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSchoolInquiryRef(dcInstance, inputVars));
}

export const addSchoolToFavoritesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddSchoolToFavorites', inputVars);
}
addSchoolToFavoritesRef.operationName = 'AddSchoolToFavorites';

export function addSchoolToFavorites(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addSchoolToFavoritesRef(dcInstance, inputVars));
}

