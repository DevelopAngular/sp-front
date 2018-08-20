import { Observable } from 'rxjs/Observable';

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface QueryParams {
  [key: string]: boolean | number | string;
}

function encode(obj: Partial<QueryParams>): string {
  return Object.keys(obj).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key].toString())}`).join('&');

}

export function constructUrl(base: string, obj: Partial<QueryParams>): string {
  const query = encode(obj);
  if (query) {
    return `${base}?${query}`;
  } else {
    return base;
  }
}

export function mergeObject<T>(initial: T, updates: Observable<Partial<T>>): Observable<T> {
  // @ts-ignore
  return updates.scan((current, update) => Object.assign({}, current, update), initial);
}
