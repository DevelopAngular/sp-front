import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {uniqBy} from 'lodash';
import {User} from '../models/User';

@Component({
  selector: 'app-sp-chips',
  templateUrl: './sp-chips.component.html',
  styleUrls: ['./sp-chips.component.scss']
})
export class SpChipsComponent implements OnInit {
  // text for the button that triggers adding entities 
  private textAddButtonDefault: string = 'Add';

  @Input() selectedProfiles: User[] | any[] = [];
  @Input() preventRemovingLast: boolean = false;
  @Input() suggestedTeacher: User;
  @Input() isProposed: boolean;
  @Input() textAddButton: string | null; 
  @Input() selectedTarget: 'users' | 'orgunits' | 'roles' | 'rooms' = 'users';

  @Output() add: EventEmitter<boolean> = new EventEmitter();
  @Output() updateSelectedEvent: EventEmitter<User[]> = new EventEmitter();
  @Output() addSuggestedTeacher: EventEmitter<User> = new EventEmitter<User>();

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  get results() {
    return uniqBy(this.selectedProfiles, 'title');
  }

  ngOnInit() {
    this.textAddButton = this.textAddButton ?? this.textAddButtonDefault;
  }

  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    }
  }

  getBackground(item) {
    if (item.hovered) {
      return '#F7F7F7';
    } else {
      return '#F7F7F7';
    }
  }
  chipHover(chip: any, hover: boolean ) {
   if (this.preventRemovingLast && this.selectedProfiles.length === 1) {
     return;
   } else {
     chip.hovered = hover;
   }
  }
}
