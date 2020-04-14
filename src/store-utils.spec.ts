import { Loadable, LoadableStatus, toData } from "./loadable";
import { createActionRoundtrip } from "./actions";
import { createReducer } from "@ngrx/store";
import { onAnyFromRoundtrip } from "./store-utils";

type State = { a: string; b: string };

describe(`store utils`, () => {
  describe(`onAnyFromRoundtrip`, () => {
    const roundtrip = createActionRoundtrip<object>("[My feature] action");
    const state = toData<State>({ a: "123", b: "456" });
    const reducer = createReducer(
      state,
      ...onAnyFromRoundtrip<Loadable<State>, object>(roundtrip, (state, _) =>
        state.status === LoadableStatus.HasData
          ? { ...state, data: { ...state.data, b: "hello from b" } }
          : { ...state }
      )
    );

    it("should react to request", () => {
      const newState = reducer(state, roundtrip.request({ arguments: {} }));
      expect(newState.data).toEqual({ a: "123", b: "hello from b" });
    });

    it("should react to success", () => {
      const newState = reducer(state, roundtrip.success({ arguments: {} }));
      expect(newState.data).toEqual({ a: "123", b: "hello from b" });
    });

    it("should react to error", () => {
      const newState = reducer(state, roundtrip.error({ arguments: {}, error: "error" }));
      expect(newState.data).toEqual({ a: "123", b: "hello from b" });
    });
  });
});
