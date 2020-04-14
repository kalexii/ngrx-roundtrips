export enum LoadableStatus {
  Empty = "empty",
  HasData = "hasData"
}

interface RemoteValue {
  readonly isLoading: boolean;
  readonly status: LoadableStatus;
}

export interface Empty extends RemoteValue {
  readonly status: LoadableStatus.Empty;
  readonly data: undefined;
}

export interface HasData<T> extends RemoteValue {
  readonly status: LoadableStatus.HasData;
  readonly data: T;
}

export type Loadable<T> = Readonly<Empty> | Readonly<HasData<T>>;

export function toLoading<T>(loadable: Loadable<T>, isLoading: boolean = true): Loadable<T> {
  return { ...loadable, isLoading };
}

export function toData<T>(data: T): Loadable<T> {
  return { data, isLoading: false, status: LoadableStatus.HasData };
}

export const emptyLoadable: Loadable<undefined> = {
  isLoading: false,
  status: LoadableStatus.Empty,
  data: undefined
};

export function createEmptyLoadable<T>(): Loadable<T> {
  return {
    isLoading: false,
    status: LoadableStatus.Empty,
    data: undefined
  };
}
