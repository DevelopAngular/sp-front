import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {remove, uniqBy} from 'lodash';
import {filter, map, pluck, switchMap, take, takeUntil} from 'rxjs/operators';
import {User} from '../models/User';
import {AdminService} from '../services/admin.service';
import {BehaviorSubject} from 'rxjs';
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
  @Input() hideAddButton: boolean;
  @Input() textAddButton: string | null; 
  @Input() textPrepend: string | null; 
  @Input() selectedTarget: 'users' | 'orgunits' | 'roles' | 'rooms' = 'users';
  @Input() orgUnitList:String[]
  @Input() orgUnitExistCheck:BehaviorSubject<Boolean>

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
    if (!this.selectedProfiles?.length) {
      return [];
    }
    // here for room visibility feature
    // not having a title...
    if (this.selectedProfiles.length > 0 && (
        (typeof this.selectedProfiles[0] !== 'object') || 
        !('title' in this.selectedProfiles[0])
      )) {
      return this.selectedProfiles;
    }
    // this is expected for a teacher instance
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
      return '#E2E6EC';
    } else {
      return '#E2E6EC';
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
        this.orgUnitExistCheck.next(true)
       return true
      
      }
    }
    
  }
  removeSelectedProfile(){
    let existCount=0;
    if(this.selectedProfiles && this.selectedProfiles.length && this.orgUnitList && this.orgUnitList.length ){
      this.selectedProfiles.forEach((sp:any)=>{
        if(this.orgUnitList.includes(sp.path)){
          existCount=existCount+1
        }
      })
      if(existCount==this.selectedProfiles.length){
        this.orgUnitExistCheck.next(false)
      }
    } else if(this.selectedProfiles.length == 0) {
      this.orgUnitExistCheck.next(false);
    }

  }

}


