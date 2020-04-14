# Roundtrips

## Installation

```sh
npm install ngrx-roundtrips
```

## Description

`Roundtrips` is a tiny library that unifies the way we handle remote operations using the Redux pattern. It does that by
introducing a concept of `Loadable` that can be, well, loaded, and action/query `roundtrip`.

#### `Loadable` is a combination of data, and it's status.

```typescript
export enum LoadableStatus {
  Empty = "empty",
  HasData = "hasData"
}

interface RemoteValue {
  isLoading: boolean;
  status: LoadableStatus;
}

export interface Empty extends RemoteValue {
  status: LoadableStatus.Empty;
  data: undefined;
}

export interface HasData<T> extends RemoteValue {
  status: LoadableStatus.HasData;
  data: T;
}

export type Loadable<T> = Empty | HasData<T>;
```

Such definition enables you to know whether you've loaded the last value or not (to remove the ambiguity if the result
of your asynchronous operation was `undefined`), whether a value is currently loading (to show the spinner and prevent
duplicate requests should you want to), and the last received response.

#### `Roundtrip` is a collection of Redux actions related to a single asynchronous operation

Asynchronous operations divide into actions and queries. Actions do not return any result apart from whether it has
completed successfully, but queries do. Regardless of whether it's a query or an action, each roundtrip has three
Redux actions: the initiator action (that starts the action/query), the success action (suffixed with `" (Success)"`),
and the error action (suffixed with `" (Error)"`).

##### Actions roundtrip:

You create an action roundtrip with `createActionRoundtrip` function, specifying the type of arguments (if any), and
NgRx action name. In return, you receive a group of Redux action creators that looks like this:

```typescript
import { createAction, props } from "@ngrx/store";

export const successSuffix = " (Success)";
export const errorSuffix = " (Error)";

export function createActionRoundtrip<TArguments>(type: string): ActionRoundtrip<TArguments> {
  return {
    request: createAction(type, props<HasArguments<TArguments>>()),
    success: createAction(type + successSuffix, props<HasArguments<TArguments>>()),
    error: createAction(type + errorSuffix, props<HasArgumentsAndError<TArguments>>())
  };
}
```

Using action roundtrip looks like this:

```typescript
/** Create action definitions grouped into a single object */
const createPost = createActionRoundtrip<{ name: string; description: string }>("[Blog] Create Post");

/** In component or a service */
this.store.dispatch(createPost.request({ arguments: { name: "My new post!", description: "Hey guise!" } }));

/** In effect */
onCreatePost$ = createActionRoundtripEffect(
  this.actions$, // actions observable injected into Effect classes
  createPost, // action roundtrip to handle
  args => this.blogService.createPost(args) // Angular service that does a HTTP call and returns Observable
);
```

##### Query roundtrip:

You create a query roundtrip with `createQueryRoundtrip` function, specifying the type of arguments (if any), type of 
the result and NgRx action name. In return, you receive a group of Redux action creators that looks like this:

```typescript
import { createAction, props } from "@ngrx/store";

export const successSuffix = " (Success)";
export const errorSuffix = " (Error)";

export function createQueryRoundtrip<TArguments, TResult>(type: string): QueryRoundtrip<TArguments, TResult> {
  return {
    request: createAction(type, props<HasArguments<TArguments>>()),
    success: createAction(type + successSuffix, props<HasArgumentsAndResult<TArguments, TResult>>()),
    error: createAction(type + errorSuffix, props<HasArgumentsAndError<TArguments>>())
  } as const;
}
```

Using query roundtrip looks like this:

```typescript
/** Create action definitions grouped into a single object */
const loadPosts = createQueryRoundtrip<{ page: number }, Post[]>("[Blog] Load Posts");

/** In component or a service */
this.store.dispatch(loadPosts.request({ arguments: { page: 0 } }));

/** In reducer */
const reducer = createReducer(
  createEmptyLoadable<Post[]>(), // initial state
  ...createQueryRoundtripReducers(loadPosts) // handles initiator (turns on isLoading), 
                                             // success (turns off isLoading, fills in data) 
                                             // and error (turns off isLoading) redux actions
);

/** In effect */
onLoadPosts$ = createQueryRoundtripEffect(
  this.actions$, // actions observable injected into Effect classes
  loadPosts, // action roundtrip to handle
  args => this.blogService.loadPosts(args) // Angular service that does a HTTP call and returns Observable<Post[]>
);
```
