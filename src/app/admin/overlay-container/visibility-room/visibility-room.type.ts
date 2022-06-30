import {User} from '../../../models/User';

export type VisibilityMode = 'visible_all_students' | 'visible_certain_students' | 'hidden_certain_students';

export type ModeView = {text: string, textmenu: string, classname: string};
export type ModeViewMap = Record<VisibilityMode, ModeView>;

type VisibilityData<T> = {mode: VisibilityMode, over: T};

export type VisibilityOverStudents = VisibilityData<User[]>;
export const DEFAULT_VISIBILITY_STUDENTS: VisibilityOverStudents  = {mode: 'visible_all_students', over: []};

