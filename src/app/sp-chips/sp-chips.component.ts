import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {uniqBy} from 'lodash';
import {filter, map, pluck, switchMap, take, takeUntil} from 'rxjs/operators';
import {User} from '../models/User';
import {AdminService} from '../services/admin.service';
interface OrgUnits{
  path:string
}
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
  @Input() orgUnitList:String[]

  @Output() add: EventEmitter<boolean> = new EventEmitter();
  @Output() updateSelectedEvent: EventEmitter<User[]> = new EventEmitter();
  @Output() addSuggestedTeacher: EventEmitter<User> = new EventEmitter<User>();
  orgUnits:any=[]

  constructor(
    private sanitizer: DomSanitizer,
    private adminService:AdminService
  ) {
  
   }

  get results() {
    // here for room visibility feature
    // not having a title...
    if (this.selectedProfiles.length > 0 && !('title' in this.selectedProfiles[0])) {
      return this.selectedProfiles;
    }
    // this is expected for a teacher instance
    return uniqBy(this.selectedProfiles, 'title');
  }

  ngOnInit() {
    this.textAddButton = this.textAddButton ?? this.textAddButtonDefault;
    console.log("props:::",this.orgUnitList)
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
  orgUnitDeleteCheck(item:any){

    if(this.orgUnitList && this.orgUnitList.length){
      if(this.orgUnitList.includes(item.path)){
        return false
      }else{
       return true
      }
    }
    
  }

}
