import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import {filter, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

import {EncounterOptionsComponent} from './encounter-options/encounter-options.component';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';
import {ExclusionGroup} from '../../../models/ExclusionGroup';
import {EncounterPreventionService} from '../../../services/encounter-prevention.service';
import {cloneDeep} from 'lodash';

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

  state: EncountersState = {
    pages_history: [Pages.Groups],
    current_page: Pages.Groups,
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

  exclusionGroups$: Observable<ExclusionGroup[]>;
  encounterPreventionLength$: Observable<number>;

  options: {label: string, textColor: string, hoverColor: string, icon: string, action: string, description: string}[] = [
    {label: 'Download report', textColor: '#7F879D', hoverColor: '#F4F4F4', icon: './assets/Download circle (Blue-Gray).svg', action: 'down_report',  description: ''},
    {label: 'Copy private link', textColor: '#7F879D', hoverColor: '#F4F4F4', icon: './assets/Private Link (Blue-Gray).svg', action: 'copy_link', description: ''},
    {label: 'Edit group', textColor: '#7F879D', hoverColor: '#F4F4F4', icon: './assets/Edit (Blue-Gray).svg', action: 'edit', description: ''},
    {label: 'Delete group', textColor: '#E32C66', hoverColor: '#F4F4F4', icon: './assets/Delete (Red).svg', action: 'delete', description: 'Deleting a group will permanently delete all encounter prevention information. This action cannot be undone.'}
  ];

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EncounterPreventionDialogComponent>,
    private encounterPreventionService: EncounterPreventionService,
    public cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.encounterPreventionService.getExclusionGroupsRequest();
    this.exclusionGroups$ = this.encounterPreventionService.exclusionGroups$;
    this.encounterPreventionLength$ = this.encounterPreventionService.encounterPreventionLength$;

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
        students: this.state.createGroup.users.map(s => s.id)
      });
    }
    if (this.state.current_page === Pages.EditGroup) {
      this.encounterPreventionService.updateExclusionGroupRequest(this.state.data.currentGroup, {
        name: this.state.data.currentGroup.name,
        notes: this.state.data.currentGroup.notes,
        students: this.state.data.currentGroup.users.map(s => s.id)
      });
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
