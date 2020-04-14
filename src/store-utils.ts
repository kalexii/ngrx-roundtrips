import { on } from "@ngrx/store";
import { ActionRoundtrip } from "./actions";
import { HasArguments, MaterializedAction, RoundtripReducers } from "./core";

export type Mutation<TState, TArguments> = (
  state: TState,
  action: MaterializedAction<HasArguments<TArguments>>
) => TState;

export function onAnyFromRoundtrip<TState, TArguments>(
  { request, success, error }: ActionRoundtrip<TArguments>,
  mutation: Mutation<TState, TArguments>
): RoundtripReducers<TState> {
  return [on(request, mutation), on(success, mutation), on(error, mutation)] as const;
}
