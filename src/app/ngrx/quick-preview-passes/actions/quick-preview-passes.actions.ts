import {createAction, props} from '@ngrx/store';
import {QuickPreviewPasses} from '../../../models/QuickPreviewPasses';

const PREVIEW_PASSES = 'Preview Passes';

export const getPreviewPasses = createAction(`[${PREVIEW_PASSES}] Get Preview Passes`, props<{userId: string | number, pastPasses: boolean}>());
export const getPreviewPassesSuccess = createAction(`[${PREVIEW_PASSES}] Get Preview Passes Success`, props<{previewPasses: QuickPreviewPasses}>());
export const getPreviewPassesFailure = createAction(`[${PREVIEW_PASSES}] Get Preview Passes Failure`, props<{errorMessage: string}>());
