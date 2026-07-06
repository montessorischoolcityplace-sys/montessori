import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddSchoolToFavoritesData {
  favoriteSchool_insert: FavoriteSchool_Key;
}

export interface AddSchoolToFavoritesVariables {
  schoolId: UUIDString;
}

export interface CreateSchoolInquiryData {
  inquiry_insert: Inquiry_Key;
}

export interface CreateSchoolInquiryVariables {
  schoolId: UUIDString;
  message: string;
  subject?: string | null;
}

export interface FavoriteSchool_Key {
  parentId: UUIDString;
  schoolId: UUIDString;
  __typename?: 'FavoriteSchool_Key';
}

export interface GetMyFavoriteSchoolsData {
  users: ({
    displayName: string;
    schools_via_FavoriteSchool: ({
      id: UUIDString;
      name: string;
      city: string;
      state: string;
    } & School_Key)[];
  })[];
}

export interface Inquiry_Key {
  id: UUIDString;
  __typename?: 'Inquiry_Key';
}

export interface ListAllSchoolsData {
  schools: ({
    id: UUIDString;
    name: string;
    city: string;
    state: string;
    zipCode: string;
    website?: string | null;
    phoneNumber: string;
    description?: string | null;
    foundingYear?: number | null;
    accreditations?: string | null;
    capacity?: number | null;
  } & School_Key)[];
}

export interface Program_Key {
  id: UUIDString;
  __typename?: 'Program_Key';
}

export interface School_Key {
  id: UUIDString;
  __typename?: 'School_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllSchoolsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllSchoolsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllSchoolsData, undefined>;
  operationName: string;
}
export const listAllSchoolsRef: ListAllSchoolsRef;

export function listAllSchools(options?: ExecuteQueryOptions): QueryPromise<ListAllSchoolsData, undefined>;
export function listAllSchools(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllSchoolsData, undefined>;

interface GetMyFavoriteSchoolsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyFavoriteSchoolsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyFavoriteSchoolsData, undefined>;
  operationName: string;
}
export const getMyFavoriteSchoolsRef: GetMyFavoriteSchoolsRef;

export function getMyFavoriteSchools(options?: ExecuteQueryOptions): QueryPromise<GetMyFavoriteSchoolsData, undefined>;
export function getMyFavoriteSchools(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyFavoriteSchoolsData, undefined>;

interface CreateSchoolInquiryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSchoolInquiryVariables): MutationRef<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSchoolInquiryVariables): MutationRef<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;
  operationName: string;
}
export const createSchoolInquiryRef: CreateSchoolInquiryRef;

export function createSchoolInquiry(vars: CreateSchoolInquiryVariables): MutationPromise<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;
export function createSchoolInquiry(dc: DataConnect, vars: CreateSchoolInquiryVariables): MutationPromise<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;

interface AddSchoolToFavoritesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddSchoolToFavoritesVariables): MutationRef<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddSchoolToFavoritesVariables): MutationRef<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;
  operationName: string;
}
export const addSchoolToFavoritesRef: AddSchoolToFavoritesRef;

export function addSchoolToFavorites(vars: AddSchoolToFavoritesVariables): MutationPromise<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;
export function addSchoolToFavorites(dc: DataConnect, vars: AddSchoolToFavoritesVariables): MutationPromise<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;

