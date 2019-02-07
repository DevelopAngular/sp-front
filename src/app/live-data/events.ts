import { BaseModel } from '../models/base';
import { PollingEvent } from '../services/polling-service';
import { State } from './state';

/**
 * A wrapper for external events.
 */
export interface ExternalEvent<E> {
  type: 'external-event';
  event: E;
}

/**
 * A wrapper for transformation functions that directly modify the State object.
 */
export interface TransformFunc<ModelType extends BaseModel> {
  type: 'transform-func';
  func: (s: State<ModelType>) => State<ModelType>;
}

/**
 * A wrapper for polling events that also exposes the postDelayed function to allow
 * scheduling future transformation functions to run.
 */
export interface PollingEventContext<ModelType extends BaseModel> {
  type: 'polling-event';
  event: PollingEvent;

  postDelayed(ms: number, func: (s: State<ModelType>) => State<ModelType>);
}

/**
 * All possible actions to be handled.
 */
export type Action<ModelType extends BaseModel, E> =
  PollingEventContext<ModelType>
  | ExternalEvent<E>
  | TransformFunc<ModelType>
  | 'reload';

export function isPollingEvent(x: Action<any, any>): x is PollingEventContext<any> {
  return (<PollingEventContext<any>>x).type === 'polling-event';
}

export function isExternalEvent(x: Action<any, any>): x is ExternalEvent<any> {
  return (<ExternalEvent<any>>x).type === 'external-event';
}

export function isTransformFunc(x: Action<any, any>): x is TransformFunc<any> {
  return (<TransformFunc<any>>x).type === 'transform-func';
}

export type PollingEventHandler<ModelType extends BaseModel> =
  (state: State<ModelType>, e: PollingEventContext<ModelType>) => State<ModelType>;
