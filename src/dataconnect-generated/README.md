# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllSchools*](#listallschools)
  - [*GetMyFavoriteSchools*](#getmyfavoriteschools)
- [**Mutations**](#mutations)
  - [*CreateSchoolInquiry*](#createschoolinquiry)
  - [*AddSchoolToFavorites*](#addschooltofavorites)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllSchools
You can execute the `ListAllSchools` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllSchools(options?: ExecuteQueryOptions): QueryPromise<ListAllSchoolsData, undefined>;

interface ListAllSchoolsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllSchoolsData, undefined>;
}
export const listAllSchoolsRef: ListAllSchoolsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllSchools(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllSchoolsData, undefined>;

interface ListAllSchoolsRef {
  ...
  (dc: DataConnect): QueryRef<ListAllSchoolsData, undefined>;
}
export const listAllSchoolsRef: ListAllSchoolsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllSchoolsRef:
```typescript
const name = listAllSchoolsRef.operationName;
console.log(name);
```

### Variables
The `ListAllSchools` query has no variables.
### Return Type
Recall that executing the `ListAllSchools` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllSchoolsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAllSchools`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllSchools } from '@dataconnect/generated';


// Call the `listAllSchools()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllSchools();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllSchools(dataConnect);

console.log(data.schools);

// Or, you can use the `Promise` API.
listAllSchools().then((response) => {
  const data = response.data;
  console.log(data.schools);
});
```

### Using `ListAllSchools`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllSchoolsRef } from '@dataconnect/generated';


// Call the `listAllSchoolsRef()` function to get a reference to the query.
const ref = listAllSchoolsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllSchoolsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.schools);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.schools);
});
```

## GetMyFavoriteSchools
You can execute the `GetMyFavoriteSchools` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyFavoriteSchools(options?: ExecuteQueryOptions): QueryPromise<GetMyFavoriteSchoolsData, undefined>;

interface GetMyFavoriteSchoolsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyFavoriteSchoolsData, undefined>;
}
export const getMyFavoriteSchoolsRef: GetMyFavoriteSchoolsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyFavoriteSchools(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyFavoriteSchoolsData, undefined>;

interface GetMyFavoriteSchoolsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyFavoriteSchoolsData, undefined>;
}
export const getMyFavoriteSchoolsRef: GetMyFavoriteSchoolsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyFavoriteSchoolsRef:
```typescript
const name = getMyFavoriteSchoolsRef.operationName;
console.log(name);
```

### Variables
The `GetMyFavoriteSchools` query has no variables.
### Return Type
Recall that executing the `GetMyFavoriteSchools` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyFavoriteSchoolsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyFavoriteSchools`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyFavoriteSchools } from '@dataconnect/generated';


// Call the `getMyFavoriteSchools()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyFavoriteSchools();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyFavoriteSchools(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
getMyFavoriteSchools().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetMyFavoriteSchools`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyFavoriteSchoolsRef } from '@dataconnect/generated';


// Call the `getMyFavoriteSchoolsRef()` function to get a reference to the query.
const ref = getMyFavoriteSchoolsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyFavoriteSchoolsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateSchoolInquiry
You can execute the `CreateSchoolInquiry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createSchoolInquiry(vars: CreateSchoolInquiryVariables): MutationPromise<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;

interface CreateSchoolInquiryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSchoolInquiryVariables): MutationRef<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;
}
export const createSchoolInquiryRef: CreateSchoolInquiryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSchoolInquiry(dc: DataConnect, vars: CreateSchoolInquiryVariables): MutationPromise<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;

interface CreateSchoolInquiryRef {
  ...
  (dc: DataConnect, vars: CreateSchoolInquiryVariables): MutationRef<CreateSchoolInquiryData, CreateSchoolInquiryVariables>;
}
export const createSchoolInquiryRef: CreateSchoolInquiryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSchoolInquiryRef:
```typescript
const name = createSchoolInquiryRef.operationName;
console.log(name);
```

### Variables
The `CreateSchoolInquiry` mutation requires an argument of type `CreateSchoolInquiryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSchoolInquiryVariables {
  schoolId: UUIDString;
  message: string;
  subject?: string | null;
}
```
### Return Type
Recall that executing the `CreateSchoolInquiry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSchoolInquiryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSchoolInquiryData {
  inquiry_insert: Inquiry_Key;
}
```
### Using `CreateSchoolInquiry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSchoolInquiry, CreateSchoolInquiryVariables } from '@dataconnect/generated';

// The `CreateSchoolInquiry` mutation requires an argument of type `CreateSchoolInquiryVariables`:
const createSchoolInquiryVars: CreateSchoolInquiryVariables = {
  schoolId: ..., 
  message: ..., 
  subject: ..., // optional
};

// Call the `createSchoolInquiry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSchoolInquiry(createSchoolInquiryVars);
// Variables can be defined inline as well.
const { data } = await createSchoolInquiry({ schoolId: ..., message: ..., subject: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSchoolInquiry(dataConnect, createSchoolInquiryVars);

console.log(data.inquiry_insert);

// Or, you can use the `Promise` API.
createSchoolInquiry(createSchoolInquiryVars).then((response) => {
  const data = response.data;
  console.log(data.inquiry_insert);
});
```

### Using `CreateSchoolInquiry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSchoolInquiryRef, CreateSchoolInquiryVariables } from '@dataconnect/generated';

// The `CreateSchoolInquiry` mutation requires an argument of type `CreateSchoolInquiryVariables`:
const createSchoolInquiryVars: CreateSchoolInquiryVariables = {
  schoolId: ..., 
  message: ..., 
  subject: ..., // optional
};

// Call the `createSchoolInquiryRef()` function to get a reference to the mutation.
const ref = createSchoolInquiryRef(createSchoolInquiryVars);
// Variables can be defined inline as well.
const ref = createSchoolInquiryRef({ schoolId: ..., message: ..., subject: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSchoolInquiryRef(dataConnect, createSchoolInquiryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.inquiry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.inquiry_insert);
});
```

## AddSchoolToFavorites
You can execute the `AddSchoolToFavorites` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addSchoolToFavorites(vars: AddSchoolToFavoritesVariables): MutationPromise<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;

interface AddSchoolToFavoritesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddSchoolToFavoritesVariables): MutationRef<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;
}
export const addSchoolToFavoritesRef: AddSchoolToFavoritesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addSchoolToFavorites(dc: DataConnect, vars: AddSchoolToFavoritesVariables): MutationPromise<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;

interface AddSchoolToFavoritesRef {
  ...
  (dc: DataConnect, vars: AddSchoolToFavoritesVariables): MutationRef<AddSchoolToFavoritesData, AddSchoolToFavoritesVariables>;
}
export const addSchoolToFavoritesRef: AddSchoolToFavoritesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addSchoolToFavoritesRef:
```typescript
const name = addSchoolToFavoritesRef.operationName;
console.log(name);
```

### Variables
The `AddSchoolToFavorites` mutation requires an argument of type `AddSchoolToFavoritesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddSchoolToFavoritesVariables {
  schoolId: UUIDString;
}
```
### Return Type
Recall that executing the `AddSchoolToFavorites` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddSchoolToFavoritesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddSchoolToFavoritesData {
  favoriteSchool_insert: FavoriteSchool_Key;
}
```
### Using `AddSchoolToFavorites`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addSchoolToFavorites, AddSchoolToFavoritesVariables } from '@dataconnect/generated';

// The `AddSchoolToFavorites` mutation requires an argument of type `AddSchoolToFavoritesVariables`:
const addSchoolToFavoritesVars: AddSchoolToFavoritesVariables = {
  schoolId: ..., 
};

// Call the `addSchoolToFavorites()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addSchoolToFavorites(addSchoolToFavoritesVars);
// Variables can be defined inline as well.
const { data } = await addSchoolToFavorites({ schoolId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addSchoolToFavorites(dataConnect, addSchoolToFavoritesVars);

console.log(data.favoriteSchool_insert);

// Or, you can use the `Promise` API.
addSchoolToFavorites(addSchoolToFavoritesVars).then((response) => {
  const data = response.data;
  console.log(data.favoriteSchool_insert);
});
```

### Using `AddSchoolToFavorites`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addSchoolToFavoritesRef, AddSchoolToFavoritesVariables } from '@dataconnect/generated';

// The `AddSchoolToFavorites` mutation requires an argument of type `AddSchoolToFavoritesVariables`:
const addSchoolToFavoritesVars: AddSchoolToFavoritesVariables = {
  schoolId: ..., 
};

// Call the `addSchoolToFavoritesRef()` function to get a reference to the mutation.
const ref = addSchoolToFavoritesRef(addSchoolToFavoritesVars);
// Variables can be defined inline as well.
const ref = addSchoolToFavoritesRef({ schoolId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addSchoolToFavoritesRef(dataConnect, addSchoolToFavoritesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.favoriteSchool_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.favoriteSchool_insert);
});
```

