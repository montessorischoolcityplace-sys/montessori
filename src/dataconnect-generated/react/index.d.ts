import { ListAllSchoolsData, GetMyFavoriteSchoolsData, CreateSchoolInquiryData, CreateSchoolInquiryVariables, AddSchoolToFavoritesData, AddSchoolToFavoritesVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListAllSchools(options?: useDataConnectQueryOptions<ListAllSchoolsData>): UseDataConnectQueryResult<ListAllSchoolsData, undefined>;
export function useListAllSchools(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllSchoolsData>): UseDataConnectQueryResult<ListAllSchoolsData, undefined>;

export function useGetMyFavoriteSchools(options?: useDataConnectQueryOptions<GetMyFavoriteSchoolsData>): UseDataConnectQueryResult<GetMyFavoriteSchoolsData, undefined>;
export function useGetMyFavoriteSchools(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyFavoriteSchoolsData>): UseDataConnectQueryResult<GetMyFavoriteSchoolsData, undefined>;

export function useCreateSchoolInquiry(options?: useDataConnectMutationOptions<CreateSchoolInquiryData, FirebaseError, CreateSchoolInquiryVariables>): UseDataConnectMutationResult<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;
export function useCreateSchoolInquiry(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSchoolInquiryData, FirebaseError, CreateSchoolInquiryVariables>): UseDataConnectMutationResult<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;

export function useAddSchoolToFavorites(options?: useDataConnectMutationOptions<AddSchoolToFavoritesData, FirebaseError, AddSchoolToFavoritesVariables>): UseDataConnectMutationResult<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;
export function useAddSchoolToFavorites(dc: DataConnect, options?: useDataConnectMutationOptions<AddSchoolToFavoritesData, FirebaseError, AddSchoolToFavoritesVariables>): UseDataConnectMutationResult<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;
