import { errorSuffix, successSuffix } from "./core";
import { Action, createReducer } from "@ngrx/store";
import { BehaviorSubject, of, throwError } from "rxjs";
import { createQueryRoundtrip, createQueryRoundtripEffect, createQueryRoundtripReducers } from "./queries";
import { createEmptyLoadable, LoadableStatus } from "./loadable";

describe(`queries`, () => {
  const roundtripName = "[My Feature] My query";

  describe(`createQueryRoundtrip`, () => {
    it("creates query roundtrip correctly", () => {
      const roundtrip = createQueryRoundtrip(roundtripName);

      expect(roundtrip).toBeTruthy();

      expect(roundtrip.request).toBeDefined();
      expect(roundtrip.request.type).toBe(roundtripName);

      expect(roundtrip.success).toBeDefined();
      expect(roundtrip.success.type).toBe(roundtripName + successSuffix);

      expect(roundtrip.error).toBeDefined();
      expect(roundtrip.error.type).toBe(roundtripName + errorSuffix);
    });
  });

  describe(`createQueryRoundtripReducers`, () => {
    const roundtrip = createQueryRoundtrip<number, number>(roundtripName);
    let initialState = createEmptyLoadable<number>();
    const reducer = createReducer(initialState, ...createQueryRoundtripReducers(roundtrip));

    it(`changes isLoading to true when request is received`, () => {
      const state = reducer(initialState, roundtrip.request({ arguments: 123 }));
      expect(state).toEqual({ ...initialState, isLoading: true });
    });

    it(`changes isLoading to false and data to result when success is received`, () => {
      const state = reducer(initialState, roundtrip.success({ arguments: 123, result: 456 }));
      expect(state).toEqual({ data: 456, isLoading: false, status: LoadableStatus.HasData });
    });

    it(`changes isLoading to false when error is received`, () => {
      const state = reducer(initialState, roundtrip.error({ arguments: 123, error: "error" }));
      expect(state).toEqual({ ...initialState, isLoading: false });
    });

    it(`changes isLoading to false and doesn't touch the data if error is received`, () => {
      const successState = reducer(initialState, roundtrip.success({ arguments: 123, result: 456 }));
      const errorAfterSuccessState = reducer(successState, roundtrip.error({ arguments: 123, error: "error" }));
      expect(errorAfterSuccessState).toEqual({ data: 456, isLoading: false, status: LoadableStatus.HasData });
    });
  });

  describe(`createQueryRoundtripEffect`, () => {
    const roundtrip = createQueryRoundtrip<number, number>(roundtripName);

    it("invokes the async operation and dispatches success if async operation dispatches success", async done => {
      const subject = new BehaviorSubject<Action>({ type: "dummy" });
      const effect = createQueryRoundtripEffect(subject, roundtrip, () => of(456));

      subject.next(roundtrip.request({ arguments: 123 }));

      effect.subscribe(a => {
        expect(a).toEqual(roundtrip.success({ arguments: 123, result: 456 }));
        done();
        subject.complete();
      });
    }, 100);

    it("invokes the async operation and dispatches error if async operation dispatches error", async done => {
      const subject = new BehaviorSubject<Action>({ type: "dummy" });
      const effect = createQueryRoundtripEffect(subject, roundtrip, () => throwError("error"));
      subject.next(roundtrip.request({ arguments: 123 }));

      effect.subscribe(a => {
        expect(a).toEqual(roundtrip.error({ arguments: 123, error: "error" }));
        done();
        subject.complete();
      });
    }, 100);
  });
});
