import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

import {filter, switchMap, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

import {EncounterOptionsComponent} from './encounter-options/encounter-options.component';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';
import {ExclusionGroup} from '../../../models/ExclusionGroup';
import {EncounterPreventionService} from '../../../services/encounter-prevention.service';
import {cloneDeep} from 'lodash';
import {ToastService} from '../../../services/toast.service';

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
  createGroup: ExclusionGroup;
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
export class EncounterPreventionDialogComponent implements OnInit {

  @Input() forceNextPage: string;
  @Input() forceGroup: ExclusionGroup;
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

  options: {label: string, textColor: string, hoverColor: string, pressedColor: string, icon: string, action: string, description: string}[] = [
    // {label: 'Download report', textColor: '#7F879D', hoverColor: '#F4F4F4', icon: './assets/Download circle (Blue-Gray).svg', action: 'down_report',  description: ''},
    {label: 'Copy private link', textColor: '#7F879D', hoverColor: 'rgba(127, 135, 157, .1)', pressedColor: 'rgba(127, 135, 157, .15)',  icon: './assets/Private Link (Blue-Gray).svg', action: 'copy_link', description: ''},
    {label: 'Edit group', textColor: '#7F879D', hoverColor: 'rgba(127, 135, 157, .1)', pressedColor: 'rgba(127, 135, 157, .15)', icon: './assets/Edit (Blue-Gray).svg', action: 'edit', description: ''},
    {label: 'Delete group', textColor: '#E32C66', hoverColor: '#fce9ef', pressedColor: '#fce9ef', icon: './assets/Delete (Red).svg', action: 'delete', description: 'Deleting a group will permanently delete all encounter prevention information. This action cannot be undone.'}
  ];

  constructor(
    private dialog: MatDialog,
    @Optional() private dialogRef: MatDialogRef<EncounterPreventionDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private encounterPreventionService: EncounterPreventionService,
    public cdr: ChangeDetectorRef,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    if (this.forceNextPage === 'newGroup') {
      this.setState(true, Pages.NewGroup);
    } else if (this.forceNextPage === 'groupDescription') {
      this.state.data.currentGroup = this.forceGroup;
      this.setState(true, Pages.GroupDescription);
    } else {
      this.encounterPreventionService.getExclusionGroupsRequest();
      this.exclusionGroupsLoading$ = this.encounterPreventionService.exclusionGroupsLoading$;
      this.encounterPreventionService.exclusionGroupsLoaded$.pipe(
        filter(r => r),
        switchMap(() => this.encounterPreventionService.exclusionGroups$),
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

      this.encounterPreventionService.exclusionGroupsLoaded$.pipe(
        filter(r => r),
        switchMap(() => this.encounterPreventionService.encounterPreventionLength$)
      ).subscribe(res => {
        if (!res) {
          this.setState(true, Pages.StartPage);
        } else {
          this.setState(true, Pages.Groups);
        }
      });
      this.encounterPreventionLength$ = this.encounterPreventionService.encounterPreventionLength$;
    }

    this.encounterPreventionService.updatedExclusionGroup$
      .pipe(filter(r => !!r))
      .subscribe(group => {
        this.state.data.currentGroup = group;
      });
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
    if (this.state.current_page === Pages.StartPage || this.state.current_page === Pages.Groups) {
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
      if (this.forceNextPage) {
        this.backEmit.emit();
        return;
      }
    }
    if (this.state.current_page === Pages.EditGroup) {
      this.encounterPreventionService.updateExclusionGroupRequest(this.state.data.currentGroup, {
        name: this.state.data.currentGroup.name,
        notes: this.state.data.currentGroup.notes,
        students: this.state.data.currentGroup.users.map(s => s.id)
      });
      if (this.forceNextPage) {
        this.backEmit.emit();
        return;
      }
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
          this.setState(true, Pages.Groups);
        } else if (action === 'copy_link') {
          navigator.clipboard.writeText(`http://localhost:4200/admin/accounts/_profile_student?encounter_id=${this.state.data.currentGroup.id}`).then(() => {
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
