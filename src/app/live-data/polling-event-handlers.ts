import { PassLike } from '../models';
import { BaseModel } from '../models/base';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { PollingEvent } from '../polling-service';
import { PollingEventContext, PollingEventHandler } from './events';
import { State } from './state';

/**
 * Matches some polling events in order to update the State object based on the polling event.
 */
export interface EventHandler<ModelType extends BaseModel> {
  matches(event: PollingEvent): boolean;

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip';
}

/**
 * A partial implementation of EventHandler that filters based on the polling events' action.
 */
abstract class BaseEventHandler<ModelType extends BaseModel> implements EventHandler<ModelType> {

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(private actions: string[]) {
  }

  matches(event: PollingEvent): boolean {
    return this.actions.includes(event.action);
  }

  abstract handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip';

}

/**
 * Adds an item (or array of items) provided by a polling event to the State
 * object they match the provided filter.
 */
export class AddItem<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
  constructor(actions: string[], private decoder: (raw: any) => ModelType, private filter?: (pass: ModelType) => boolean) {
    super(actions);
  }

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip' {
    const dataArray = Array.isArray(data) ? data : [data];

    for (const rawItem of dataArray) {
      const pass = this.decoder(rawItem);
      if (!this.filter || this.filter(pass)) {
        state.addOrUpdateItem(pass);
      }
    }
    return state;
  }
}

/**
 * Updates an item (or array of items) provided by a polling event to the State
 * object that match the provided filter only if the item already exists in the state object.
 */
export class UpdateItem<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
  constructor(actions: string[], private decoder: (raw: any) => ModelType, private filter?: (pass: ModelType) => boolean) {
    super(actions);
  }

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip' {
    const dataArray = Array.isArray(data) ? data : [data];

    for (const rawItem of dataArray) {
      const pass = this.decoder(rawItem);
      if (!this.filter || this.filter(pass)) {
        state.updateItem(pass);
      }
    }
    return state;
  }
}

/**
 * Removed an item provided by a polling event from the State object.
 */
export class RemoveItem<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
  constructor(actions: string[], private decoder: (raw: any) => ModelType) {
    super(actions);
  }

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip' {
    const pass = this.decoder(data);
    state.removeItem(pass);

    return state;
  }
}

/**
 * Removes a Pass Request when a 'pass_request.accept' action is received.
 * The data provided by this action is a hall pass so it needs to be handled by different EventHandler.
 */
export class RemoveRequestOnApprove extends BaseEventHandler<Request> {
  constructor(actions: string[]) {
    super(actions);
  }

  handle(state: State<Request>, context: PollingEventContext<Request>, data: any): State<Request> | 'skip' {
    const pass = HallPass.fromJSON(data);
    state.removeItemById(pass.parent_request);

    return state;
  }
}

/**
 * Removes a Pass Invitation when a 'pass_invitation.accept' action is received.
 * The data provided by this action is a hall pass so it needs to be handled by different EventHandler.
 */
export class RemoveInvitationOnApprove extends BaseEventHandler<Invitation> {
  constructor(actions: string[]) {
    super(actions);
  }

  handle(state: State<Invitation>, context: PollingEventContext<Invitation>, data: any): State<Invitation> | 'skip' {
    const pass = HallPass.fromJSON(data);
    state.removeItemById(pass.parent_invitation);

    return state;
  }
}

/**
 * Similar to RemoveItem but updates the item immediately and removes it from the State object after a delay.
 */
export class RemoveItemWithDelay<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
  constructor(actions: string[], private decoder: (raw: any) => ModelType) {
    super(actions);
  }

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip' {
    const pass = this.decoder(data);
    state.updateItem(pass);

    context.postDelayed(5 * 1000, (s1: State<ModelType>) => {
      s1.removeItem(pass);
      return s1;
    });

    return state;
  }
}

/**
 * Convert an array of individual event handlers into a PollingEventHandler.
 *
 * @param handlers An Array of EventHandler objects.
 * @return A PollingEventHandler.
 */
export function makePollingEventHandler<ModelType extends BaseModel>(handlers: EventHandler<ModelType>[]): PollingEventHandler<ModelType> {
  return (state: State<ModelType>, action: PollingEventContext<ModelType>) => {

    for (const handler of handlers) {
      if (handler.matches(action.event)) {
        const result = handler.handle(state, action, action.event.data);
        if (result !== 'skip') {
          return result;
        }
      }
    }

    return state;
  };
}
