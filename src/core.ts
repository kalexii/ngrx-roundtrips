import {ActionCreator, On} from "@ngrx/store";
import {TypedAction} from "@ngrx/store/src/models";
import {Observable} from "rxjs";
import {HttpResponse} from "@angular/common/http";

export interface HasResult<T> {
  readonly result: T;
}

export interface HasArguments<T> {
  readonly arguments: T;
}

export interface HasError {
  readonly error: any;
}

export type HasArgumentsAndResult<TArguments, TResult> = HasArguments<TArguments> & HasResult<TResult>;
export type HasArgumentsAndError<TArguments> = HasArguments<TArguments> & HasError;

export const successSuffix = ' (Success)';
export const errorSuffix = ' (Error)';

export type RoundtripReducers<T> = readonly [On<T>, On<T>, On<T>];
export type MaterializedAction<TProps> = TProps & TypedAction<string>;
export type ActionDefinition<TProps> = ActionCreator<string, (props: TProps) => MaterializedAction<TProps>>;

export type AsyncCall<TRequest> = (request: TRequest) => Observable<void | HttpResponse<void>>;
export type AsyncQuery<TRequest, TResponse> = (request: TRequest) => Observable<TResponse>;
