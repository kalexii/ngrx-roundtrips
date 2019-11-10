import {createActionRoundtrip, createActionRoundtripEffect, createImpactLoadingStatusReducers} from "./actions";
import {errorSuffix, successSuffix} from "./core";
import {Action, createReducer} from "@ngrx/store";
import {createEmptyLoadable} from "./loadable";
import {BehaviorSubject, of, throwError} from "rxjs";

describe(`actions`, () => {
  const roundtripName = '[My Feature] My action';

  describe(`createActionRoundtrip`, () => {
    it('creates action roundtrip correctly', () => {
      const roundtrip = createActionRoundtrip(roundtripName);

      expect(roundtrip).toBeTruthy();

      expect(roundtrip.request).toBeDefined();
      expect(roundtrip.request.type).toBe(roundtripName);

      expect(roundtrip.success).toBeDefined();
      expect(roundtrip.success.type).toBe(roundtripName + successSuffix);

      expect(roundtrip.error).toBeDefined();
      expect(roundtrip.error.type).toBe(roundtripName + errorSuffix);
    });
  });

  describe(`createImpactLoadingStatusReducers`, () => {

    const roundtrip = createActionRoundtrip(roundtripName);
    let initialState = createEmptyLoadable<object>();
    const reducer = createReducer(initialState, ...createImpactLoadingStatusReducers(roundtrip));

    it(`changes isLoading to true when request is received`, () => {
      const state = reducer(initialState, roundtrip.request({arguments: {}}));
      expect(state).toEqual({...initialState, isLoading: true});
    });

    it(`changes isLoading to false when success is received`, () => {
      const state = reducer(initialState, roundtrip.success({arguments: {}}));
      expect(state).toEqual({...initialState, isLoading: false});
    });

    it(`changes isLoading to false when error is received`, () => {
      const state = reducer(initialState, roundtrip.error({arguments: {}, error: {}}));
      expect(state).toEqual({...initialState, isLoading: false});
    });
  });

  describe(`createActionRoundtripEffect`, () => {
    const roundtrip = createActionRoundtrip<{ arg: number }>(roundtripName);

    it('invokes the async operation and dispatches success if async operation dispatches success', async done => {
      const subject = new BehaviorSubject<Action>({type: 'dummy'});
      const effect = createActionRoundtripEffect(subject, roundtrip, () => of(undefined));

      subject.next(roundtrip.request({arguments: {arg: 123}}));

      effect.subscribe(a => {
        expect(a).toEqual(roundtrip.success({arguments: {arg: 123}}));
        done();
        subject.complete();
      });
    }, 100);

    it('invokes the async operation and dispatches error if async operation dispatches error', async done => {
      const subject = new BehaviorSubject<Action>({type: 'dummy'});
      const effect = createActionRoundtripEffect(subject, roundtrip, () => throwError('error'));
      subject.next(roundtrip.request({arguments: {arg: 123}}));

      effect.subscribe(a => {
        expect(a).toEqual(roundtrip.error({arguments: {arg: 123}, error: 'error'}));
        done();
        subject.complete();
      });
    }, 100);
  });
});
