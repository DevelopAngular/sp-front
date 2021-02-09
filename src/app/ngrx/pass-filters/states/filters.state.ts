import {PassFilters} from '../../../models/PassFilters';

export interface IFiltersState {
  loading: boolean;
  loaded: boolean;
  filters: {
    [model: string]: PassFilters
  };
}
