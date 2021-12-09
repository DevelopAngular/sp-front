import {User} from './User';
import {SafeHtml} from '@angular/platform-browser';
import {ExclusionGroup} from './ExclusionGroup';

export class Toast {
  title: string;
  subtitle?: string | SafeHtml;
  type: 'success' | 'error' | 'info';
  icon?: string;
  action?: string;
  showButton?: boolean;
  buttonText?: string;
  hasBackdrop?: boolean;
  encounterPrevention?: boolean;
  exclusionPass?: any;
  issuer?: User;
  exclusionGroups?: ExclusionGroup[];
}
