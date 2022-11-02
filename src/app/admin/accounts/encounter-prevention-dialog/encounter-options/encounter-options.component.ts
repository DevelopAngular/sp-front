import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';
import {EncounterPreventionService} from '../../../../services/encounter-prevention.service';
import {ToastService} from '../../../../services/toast.service';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';

@Component({
  selector: 'app-encounter-options',
  templateUrl: './encounter-options.component.html',
  styleUrls: ['./encounter-options.component.scss']
})
export class EncounterOptionsComponent implements OnInit {

  triggerElementRef: HTMLElement;
  hoverOption;
  showConfirmButton: boolean;
  options: {label: string, textColor: string, hoverColor: string, pressedColor: string, icon: string, action: string, description?: string}[];
  preventionStatusForm: FormGroup;
  group: ExclusionGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<EncounterOptionsComponent>,
    private encounterService: EncounterPreventionService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.triggerElementRef = this.data['trigger'];
    this.options = this.data['options'];
    this.group = this.data['group'];
    this.preventionStatusForm = new FormGroup({
      status: new FormControl(this.group.enabled)
    });

    this.preventionStatusForm.get('status').valueChanges
      .pipe(
        tap((status) => this.encounterService.updateExclusionGroupRequest(this.group, {enabled: status})),
        switchMap((res) => {
          return this.encounterService.exclusionGroupsLoaded$
            .pipe(filter(r => !!r), switchMap(() => this.encounterService.updatedExclusionGroup$));
        })
      ).subscribe(res => {
        this.group = res;
        debugger;
        this.toast.openToast({
          title: `Encounter prevention group ${res.enabled ? 'enabled' : 'disabled'}`,
          type: res.enabled ? 'success' : 'info'
        });
    });
    this.updatePosition();
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left + rect.width - 245}px`, top: `${rect.bottom}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  selectedOption(option) {
    if (option.action === 'delete') {
      this.showConfirmButton = true;
    } else {
      this.dialogRef.close(option.action);
    }
  }

}
