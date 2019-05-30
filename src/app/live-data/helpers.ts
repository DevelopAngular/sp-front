
import {scan} from 'rxjs/operators';
import { Observable } from 'rxjs';

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

type QueryValue = boolean | number | string;

export interface QueryParams {
  [key: string]: QueryValue | QueryValue[];
}

function encode(obj: Partial<QueryParams>): string {
  const segments: string[] = [];
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (Array.isArray(value)) {
      for (const item of value) {
        segments.push(encodeURIComponent(key) + '=' + encodeURIComponent(item.toString()));
      }
    } else {

      segments.push(encodeURIComponent(key) + '=' + encodeURIComponent(value.toString()));
    }
  }

  return segments.join('&');
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
  return updates.pipe(scan((current, update) => Object.assign({}, current, update), initial));
}
