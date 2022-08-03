import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';

import {EncounterOptionsComponent} from './encounter-options/encounter-options.component';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';
import {ExclusionGroup} from '../../../models/ExclusionGroup';
import {EncounterPreventionService} from '../../../services/encounter-prevention.service';
import {cloneDeep} from 'lodash';
import {ToastService} from '../../../services/toast.service';
import {User} from '../../../models/User';
import {UserService} from '../../../services/user.service';

enum Pages {
  StartPage = 0,
  NewGroup= 1,
  EditGroup = 2,
  Groups = 3,
  GroupDescription = 4
}

export interface EncountersState {
  pages_history: number[];
  current_page: number;
  createGroup: any;
  data: {
    currentGroup?: ExclusionGroup;
    showSaveButton: boolean;
  };
}

@Component({
  selector: 'app-encounter-prevention-dialog',
  templateUrl: './encounter-prevention-dialog.component.html',
  styleUrls: ['./encounter-prevention-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterPreventionDialogComponent implements OnInit, OnDestroy {

  @Input() forceNextPage: string;
  @Input() forceGroup: ExclusionGroup;
  @Input() currentUser: User;
  @Input() secondUser: User;
  @Output() backEmit: EventEmitter<any> = new EventEmitter<any>();

  state: EncountersState = {
    pages_history: [Pages.Groups],
    current_page: null,
    createGroup: {
      users: [],
      name: '',
      notes: ''
    },
    data: {
      currentGroup: null,
      showSaveButton: false
    }
  };

  exclusionGroups: ExclusionGroup[];
  encounterPreventionLength$: Observable<number>;
  exclusionGroupsLoading$: Observable<boolean>;
  user$: Observable<User>;

  options: {label: string, textColor: string, hoverColor: string, pressedColor: string, icon: string, action: string, description: string}[] = [
    // {label: 'Download report', textColor: '#7F879D', hoverColor: '#F4F4F4', icon: './assets/Download circle (Blue-Gray).svg', action: 'down_report',  description: ''},
    {label: 'Copy private link', textColor: '#7F879D', hoverColor: 'rgba(127, 135, 157, .1)', pressedColor: 'rgba(127, 135, 157, .15)',  icon: './assets/Private Link (Blue-Gray).svg', action: 'copy_link', description: ''},
    {label: 'Edit group', textColor: '#7F879D', hoverColor: 'rgba(127, 135, 157, .1)', pressedColor: 'rgba(127, 135, 157, .15)', icon: './assets/Edit (Blue-Gray).svg', action: 'edit', description: ''},
    {label: 'Delete group', textColor: '#E32C66', hoverColor: '#fce9ef', pressedColor: '#fce9ef', icon: './assets/Delete (Red).svg', action: 'delete', description: 'Deleting a group will permanently delete all encounter prevention information. This action cannot be undone.'}
  ];

  destroy$ = new Subject();

  constructor(
    private dialog: MatDialog,
    @Optional() private dialogRef: MatDialogRef<EncounterPreventionDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private encounterPreventionService: EncounterPreventionService,
    public cdr: ChangeDetectorRef,
    private toast: ToastService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.user$ = this.userService.user$.pipe(map(u => User.fromJSON(u)));
    if (this.data) {
      if (this.data['forceNextPage']) {
        this.forceNextPage = this.data['forceNextPage'];
      }
      if (this.data['currentUser']) {
        this.currentUser = this.data['currentUser'];
      }
      if (this.data['secondUser']) {
        this.secondUser = this.data['secondUser'];
      }
      if (this.data['forceGroup']) {
        this.forceGroup = this.data['forceGroup'];
      }
    }
    if (this.forceNextPage === 'newGroup') {
      this.state.createGroup.users.push({...this.currentUser, lockAccount: true});
      this.state.createGroup.users.push({...this.secondUser, lockAccount: true});
      this.setState(true, Pages.NewGroup);
      return;
    } else if (this.forceNextPage === 'groupDescription') {
      this.state.data.currentGroup = this.forceGroup;
      this.setState(true, Pages.GroupDescription);
    } else if (this.data && this.data['currentPage'] === 'groups') {
      this.setState(true, Pages.Groups);
    } else {
      this.encounterPreventionService.getExclusionGroupsRequest();
    }
    this.exclusionGroupsLoading$ = this.encounterPreventionService.exclusionGroupsLoading$;

    this.encounterPreventionService.exclusionGroupsLoaded$.pipe(
      filter(r => r && !this.forceNextPage),
      switchMap(() => this.encounterPreventionService.exclusionGroupsLength$)
    ).subscribe(res => {
      if (!res) {
        this.setState(true, Pages.StartPage);
      } else {
        this.setState(true, Pages.Groups);
      }
    });

    this.encounterPreventionService.exclusionGroupsLoaded$.pipe(
      filter(r => r),
      switchMap(() => this.encounterPreventionService.exclusionGroups$),
      takeUntil(this.destroy$),
      tap(groups => {
        if (this.data && this.data['currentGroupId']) {
          const currentGroup = groups.find(g => +g.id === +this.data['currentGroupId']);
          this.goDescription(currentGroup);
          return;
        }
      })
    ).subscribe((groups) => {
      this.exclusionGroups = groups;
      this.cdr.detectChanges();
    });

    this.encounterPreventionLength$ = this.encounterPreventionService.encounterPreventionLength$;

    this.encounterPreventionService.updatedExclusionGroup$
      .pipe(filter(r => !!r), takeUntil(this.destroy$))
      .subscribe(group => {
        this.state.data.currentGroup = group;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setState(isNext, to, data?) {
    this.state = cloneDeep({
      ...this.state,
      pages_history: isNext ? [...this.state.pages_history, to] : this.state.pages_history.filter((i, index) => index !== this.state.pages_history.length - 1),
      current_page: to,
      data: {
        ...this.state.data,
        ...data
      }
    });
    this.cdr.detectChanges();
  }

  nextPage() {
    setTimeout(() => {
      this.setState(true, this.state.current_page + 1);
    }, 100);
  }

  back() {
    if (this.state.current_page === Pages.StartPage || this.state.current_page === Pages.Groups || (this.data && this.data['forceNextPage'])) {
        this.dialogRef.close();
    } else {
      if (!!this.forceNextPage) {
        this.backEmit.emit();
        return;
      }
      setTimeout(() => {
        this.setState(false, this.state.pages_history[this.state.pages_history.length - 2]);
      }, 100);
    }
  }

  save() {
    if (this.state.current_page === Pages.NewGroup) {
      this.encounterPreventionService.createExclusionGroupRequest({
        name: this.state.createGroup.name,
        notes: this.state.createGroup.notes,
        students: this.state.createGroup.users.map(s => s.id),
        enabled: true
      });
      if (this.data && this.data['forceNextPage']) {
        this.dialogRef.close();
      }
      if (this.forceNextPage) {
        this.backEmit.emit();
        return;
      }
      this.state.createGroup.users = [];
    }
    if (this.state.current_page === Pages.EditGroup) {
      this.encounterPreventionService.updateExclusionGroupRequest(this.state.data.currentGroup, {
        name: this.state.data.currentGroup.name,
        notes: this.state.data.currentGroup.notes,
        students: this.state.data.currentGroup.users.map(s => s.id)
      });
      if (this.data && this.data['forceNextPage']) {
        this.dialogRef.close();
      }
      if (this.forceNextPage) {
        this.backEmit.emit();
        return;
      }
      setTimeout(() => {
        this.toast.openToast({
          title: 'Encounter prevention group updated',
          type: 'success'
        });
      }, 500);
    }
    this.setState(true, Pages.Groups);
  }

  openPopup(event) {
    UNANIMATED_CONTAINER.next(true);
    const ED = this.dialog.open(EncounterOptionsComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: event.currentTarget, group: this.state.data.currentGroup, options: this.options}
    });

    ED.afterClosed()
      .pipe(tap(() => UNANIMATED_CONTAINER.next(false)), filter(r => !!r))
      .subscribe((action) => {
        if (action === 'edit') {
          this.setState(true, Pages.EditGroup);
        } else if (action === 'delete') {
          this.encounterPreventionService.deleteExclusionGroupRequest(this.state.data.currentGroup);
          if (this.data && this.data['forceNextPage']) {
            this.dialogRef.close();
          }
          if (this.forceNextPage) {
            this.backEmit.emit();
            return;
          }
          this.setState(true, Pages.Groups);
        } else if (action === 'copy_link') {
          navigator.clipboard.writeText(`${window.location.href}?encounter_id=${this.state.data.currentGroup.id}`).then(() => {
            this.toast.openToast({
              title: 'Link copied to clipboard!',
              subtitle: 'Send this link to other admins if you want to share with them encounter prevention information.',
              type: 'info'
            });
          });
        }
      });
  }

  goDescription(currentGroup: ExclusionGroup) {
    this.setState(true, Pages.GroupDescription, {currentGroup});
  }

  goNewGroup() {
    this.setState(true, Pages.NewGroup);
  }
}
