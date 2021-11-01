import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

import {User} from '../../../models/User';
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
  prevent_page: number;
  current_page: number;
  createGroup: {
    students: User[],
    teachers: User[],
    group_name: string,
    notes: string
  };
  data: {
    currentGroup?: ExclusionGroup;
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
    prevent_page: 0,
    current_page: Pages.Groups,
    createGroup: {
      students: [],
      teachers: [],
      group_name: '',
      notes: ''
    },
    data: {
      currentGroup: null
    }
  };

  exclusionGroups$: Observable<ExclusionGroup[]>;

  options: {label: string, textColor: string, hoverColor: string, icon: string, action: string, description: string}[] = [
    {label: 'Download report', textColor: '#7F879D', hoverColor: '#FFFFFF', icon: './assets/Download circle (Blue-Gray).svg', action: 'down_report',  description: ''},
    {label: 'Copy private link', textColor: '#7F879D', hoverColor: '#FFFFFF', icon: './assets/Private Link (Blue-Gray).svg', action: 'copy_link', description: ''},
    {label: 'Edit group', textColor: '#7F879D', hoverColor: '#FFFFFF', icon: './assets/Edit (Blue-Gray).svg', action: 'edit', description: ''},
    {label: 'Delete group', textColor: '#E32C66', hoverColor: '#FFFFFF', icon: './assets/Delete (Red).svg', action: 'delete', description: 'Deleting a group will permanently delete all encounter prevention information. This action cannot be undone.'}
  ];

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EncounterPreventionDialogComponent>,
    private encounterPreventionService: EncounterPreventionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.encounterPreventionService.getExclusionGroupsRequest();
    this.exclusionGroups$ = this.encounterPreventionService.exclusionGroups$;
  }

  setState(from, to, data?) {
    this.state = cloneDeep({
      ...this.state,
      prevent_page: from,
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
      this.setState(this.state.current_page, this.state.current_page + 1);
    }, 100);
  }

  back() {
    if (this.state.current_page === Pages.StartPage) {
      this.dialogRef.close();
    } else {
      setTimeout(() => {
        this.setState(this.state.current_page, this.state.current_page - 1);
      }, 100);
    }
  }

  save() {
    if (this.state.current_page === Pages.NewGroup) {
      this.encounterPreventionService.createExclusionGroupRequest({
        name: null,
        notes: this.state.createGroup.notes,
        students: this.state.createGroup.students.map(s => s.id)
      });
    }
  }

  openPopup(event) {
    UNANIMATED_CONTAINER.next(true);
    const ED = this.dialog.open(EncounterOptionsComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: event.currentTarget, options: this.options}
    });

    ED.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false))).subscribe();
  }

  goDescription(currentGroup: ExclusionGroup) {
    this.setState(this.state.current_page, Pages.GroupDescription, {currentGroup});
  }

  goNewGroup() {
    this.setState(this.state.current_page, Pages.NewGroup);
  }
}
