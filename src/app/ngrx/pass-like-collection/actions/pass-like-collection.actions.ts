import {createAction, props} from '@ngrx/store';
import {User} from '../../../models/User';

const PASSLIKECOLLECTION = 'Pass Like Collection';

export const getPassLikeCollection = createAction(`[${PASSLIKECOLLECTION}] Get Pass Like Collection`, props<{user: User}>());
