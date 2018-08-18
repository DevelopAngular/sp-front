import { PassLike } from '../models';
import { BaseModel } from '../models/base';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { PollingEvent } from '../polling-service';
import { PollingEventContext, PollingEventHandler } from './events';
import { State } from './state';

export interface EventHandler<ModelType extends BaseModel> {
  matches(event: PollingEvent): boolean;

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip';
}

abstract class BaseEventHandler<ModelType extends BaseModel> implements EventHandler<ModelType> {

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(private actions: string[]) {
  }

  matches(event: PollingEvent): boolean {
    return this.actions.includes(event.action);
  }

  abstract handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip';

}

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

class RemoveItemWithDelay<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
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
