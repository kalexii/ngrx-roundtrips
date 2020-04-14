import { Action, createAction, on, props } from "@ngrx/store";
import { Loadable, toLoading } from "./loadable";
import { Actions, ofType } from "@ngrx/effects";
import { Observable, of, zip } from "rxjs";
import { catchError, concatMap, map, switchMap } from "rxjs/operators";
import { ActionDefinition, AsyncQuery, errorSuffix, HasArguments, HasArgumentsAndError, successSuffix } from "./core";
import { QueryRoundtripReducers } from "./queries";

export interface ActionRoundtrip<TArguments> {
  readonly request: ActionDefinition<HasArguments<TArguments>>;
  readonly success: ActionDefinition<HasArguments<TArguments>>;
  readonly error: ActionDefinition<HasArgumentsAndError<TArguments>>;
}

export function createActionRoundtrip<TArguments>(type: string): ActionRoundtrip<TArguments> {
  return {
    request: createAction(type, props<HasArguments<TArguments>>()),
    success: createAction(type + successSuffix, props<HasArguments<TArguments>>()),
    error: createAction(type + errorSuffix, props<HasArgumentsAndError<TArguments>>())
  };
}

export type ActionRoundtripImpactingLoading<TResult> = QueryRoundtripReducers<TResult>;

export function createImpactLoadingStatusReducers<TResult extends any>({
  request,
  success,
  error
}: ActionRoundtrip<unknown>): ActionRoundtripImpactingLoading<TResult> {
  return [
    on(request, (state: Loadable<TResult>) => toLoading(state, true)),
    on(success, (state: Loadable<TResult>) => toLoading(state, false)),
    on(error, (state: Loadable<TResult>) => toLoading(state, false))
  ] as const;
}

export function createActionRoundtripEffect<TArguments, TAdditional>(
  actions$: Actions,
  roundtrip: ActionRoundtrip<TArguments>,
  request: AsyncQuery<TArguments & { additional?: TAdditional }, void>,
  withAdditional?: Observable<TAdditional>
): Observable<Action> {
  return actions$.pipe(
    ofType(roundtrip.request),
    switchMap(x => zip(of(x), withAdditional ? withAdditional : of(undefined))),
    concatMap(([action, additional]) =>
      request({ ...action.arguments, additional }).pipe(
        map(() => roundtrip.success({ arguments: action.arguments })),
        catchError(error => of(roundtrip.error({ arguments: action.arguments, error })))
      )
    )
  );
}
