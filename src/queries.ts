import {Loadable, toData, toLoading} from "./loadable";
import {Action, createAction, on, props} from "@ngrx/store";
import {ActionRoundtrip} from "./actions";
import {Actions, ofType} from "@ngrx/effects";
import {Observable, of, zip} from "rxjs";
import {catchError, map, mergeMap, switchMap} from "rxjs/operators";
import {
  ActionDefinition,
  AsyncQuery,
  errorSuffix,
  HasArguments,
  HasArgumentsAndError,
  HasArgumentsAndResult,
  HasResult,
  RoundtripReducers,
  successSuffix
} from "./core";


export type QueryRoundtripReducers<TResult extends {}> = RoundtripReducers<Loadable<TResult>>;

export function createQueryRoundtripReducers<TResult>({request, success, error}: QueryRoundtrip<any, TResult>): QueryRoundtripReducers<TResult> {
  return [
    on(request, (state: Loadable<TResult>) => toLoading(state, true)),
    on(success, (state: Loadable<TResult>, action: HasResult<TResult>) => toData(action.result)),
    on(error, (state: Loadable<TResult>) => toLoading(state, false))
  ] as const;
}

// @ts-ignore
export interface QueryRoundtrip<TArguments, TResult> extends ActionRoundtrip<TArguments> {
  readonly success: ActionDefinition<HasArgumentsAndResult<TArguments, TResult>>;
}

export function createQueryRoundtrip<TArguments, TResult>(type: string): QueryRoundtrip<TArguments, TResult> {
  return {
    request: createAction(type, props<HasArguments<TArguments>>()),
    success: createAction(type + successSuffix, props<HasArgumentsAndResult<TArguments, TResult>>()),
    error: createAction(type + errorSuffix, props<HasArgumentsAndError<TArguments>>())
  } as const;
}

export function createQueryRoundtripEffect<TRequest, TResponse, TAdditional>(
  actions$: Actions,
  saga: QueryRoundtrip<TRequest, TResponse>,
  request: AsyncQuery<TRequest & { additional?: TAdditional }, TResponse>,
  withAdditional?: Observable<TAdditional>):
  Observable<Action> {
  return actions$.pipe(
    ofType(saga.request),
    switchMap(x => zip(of(x), withAdditional ? withAdditional : of(undefined))),
    mergeMap(([action, additional]) =>
      request({...action.arguments, additional}).pipe(
        map(result => saga.success({arguments: action.arguments, result})),
        catchError(error => of(saga.error({arguments: action.arguments, error})))
      )
    )
  );
}
