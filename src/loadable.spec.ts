import {createEmptyLoadable, LoadableStatus, toData, toLoading} from "./loadable";

describe(`loadable`, () => {
  const loadable = createEmptyLoadable();

  describe(`createEmptyLoadable`, () => {
    it('has isLoading = false', () => expect(loadable.isLoading).toBe(false));
    it('has data = undefined', () => expect(loadable.data).toBe(undefined));
    it('has status = empty', () => expect(loadable.status).toBe(LoadableStatus.Empty));
    it('should not have anything beyond aforementioned', () => {
      expect(loadable).toEqual({
        isLoading: false,
        status: LoadableStatus.Empty,
        data: undefined
      });
    });
  });

  describe(`toLoading`, () => {
    it('should only change isLoading in new loadable if true is specified', () => {
      expect(toLoading(loadable, true)).toEqual({
        isLoading: true,
        status: LoadableStatus.Empty,
        data: undefined
      })
    });
    it('should only change isLoading in new loadable if true is specified', () => {
      expect(toLoading(loadable, false)).toEqual({
        isLoading: false,
        status: LoadableStatus.Empty,
        data: undefined
      })
    });
    it('should only change isLoading in old loadable if true is specified', () => {
      expect(toLoading(toData({}), true)).toEqual({
        isLoading: true,
        status: LoadableStatus.HasData,
        data: {}
      })
    });
    it('should only change isLoading in old loadable if true is specified', () => {
      expect(toLoading(toData({}), false)).toEqual({
        isLoading: false,
        status: LoadableStatus.HasData,
        data: {}
      })
    });
  });

  describe(`toData`, () => {
    it('should return non-loading loadable with populated', () => {
      expect(toData({})).toEqual({
        isLoading: false,
        status: LoadableStatus.HasData,
        data: {}
      });
    });
  });
});
