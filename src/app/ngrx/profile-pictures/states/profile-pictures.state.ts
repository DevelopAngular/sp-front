import {EntityState} from '@ngrx/entity';
import {ProfilePicture} from '../../../models/ProfilePicture';
import {ProfileMap} from '../../../models/ProfileMap';
import {User} from '../../../models/User';
import {ProfilePicturesUploadGroup} from '../../../models/ProfilePicturesUploadGroup';
import {ProfilePicturesError} from '../../../models/ProfilePicturesError';

export interface IProfilePicturesState extends EntityState<ProfilePicture> {
  loading: boolean;
  loaded: boolean;
  profilesMap: ProfileMap[];
  updatedProfiles: User[];
  loaderPercent: number;
  uploadGroups: ProfilePicturesUploadGroup[];
  currentUploadGroup: ProfilePicturesUploadGroup;
  uploadErrors: ProfilePicturesError[];
  missingProfilesPictures: User[];
}
