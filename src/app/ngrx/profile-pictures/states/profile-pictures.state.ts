import {EntityState} from '@ngrx/entity';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';

export interface IProfilePicturesState extends EntityState<ProfilePicture> {
  loading: boolean;
  loaded: boolean;
  profilesMap: ProfileMap[];
}
