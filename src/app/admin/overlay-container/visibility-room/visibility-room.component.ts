import {KeyValue} from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, Renderer2, HostListener} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subject, Observable} from 'rxjs';
import {map, tap, take, takeUntil, filter, finalize, startWith, shareReplay} from 'rxjs/operators';
import {cloneDeep, isEqual} from 'lodash';

import {User} from '../../../models/User';
import {SPSearchComponent} from '../../../sp-search/sp-search.component'; 
import {VisibilityMode, ModeView, ModeViewMap, VisibilityOverStudents, DEFAULT_VISIBILITY_STUDENTS} from './visibility-room.type';
import {OverlayDataService} from '../overlay-data.service';
import {slideOpacity } from '../../../animations';
import {DataService} from '../../../services/data-service';

@Component({
  selector: 'app-visibility-room',
  templateUrl: './visibility-room.component.html',
  styleUrls: ['./visibility-room.component.scss'],
  animations: [slideOpacity],
})
export class VisibilityRoomComponent implements OnInit, AfterViewInit, OnDestroy {

  // element who trigger the opening and closing of options panel 
  @ViewChild('opener') openerRef: ElementRef<HTMLElement>;
  // it contains options to choose from
  @ViewChild('panel') panelRef: TemplateRef<any>;
  // access to search component public methods: cancel, etc
  @ViewChild(SPSearchComponent) searchComponent: SPSearchComponent;
  // grade level
  @ViewChild('gradeLevel') gradeLevelTpl: TemplateRef<any>;
  
  @Input() data?: VisibilityOverStudents = DEFAULT_VISIBILITY_STUDENTS; 

  @Input() showErrors: boolean
  showErrorsVisibility: boolean = false;

  @Input() visibilityForm: FormGroup;

  // option element has been selected
  @Output('onVisibilityChange') optionSelectedEvent: EventEmitter<VisibilityOverStudents> = new EventEmitter<VisibilityOverStudents>();

  // reasons the component exists for
  // 1) the students to be subject of visibility room rule
  selectedStudents: User[] = [];
  // grade levels
  selectedGradeLevels: string[] = [];
  // related setting to search component
  showOptions = false;
  // 2) how visibility room rule will operate - value that has meaning for database
  mode: VisibilityMode = 'visible_all_students';
  // text representing selected mode
  modeView: ModeView;
 // options as they exists in database as IDs
  // with their displaying texts in view 
  private modes: ModeViewMap = {
    'visible_all_students': {text: 'All students', textmenu: 'Show room for all students', classname: 'visibility-all'},
    'visible_certain_students': {text: 'Show for certain students', textmenu: 'Show room for certain students',  classname: 'visibility-allow'},
    'hidden_certain_students': {text: 'Hide for certain students', textmenu: 'Hide room for certain students', classname: 'visibility-denny'},
  };

  // keeps previous changes
  private prevdata: Partial<{[key in Exclude<VisibilityMode, 'visible_all_students'>]: VisibilityOverStudents}> = {};

  private change$ = new Subject();
  destroy$ = new Subject();

  // did open the panel with options 
  didOpen: boolean = false;

  // need to show the search UI?
  get isShowSearch(): boolean {
   return this.mode !== 'visible_all_students';
  }

  constructor(
    public dialog: MatDialog,
    public overlayService: OverlayDataService,
    private renderer: Renderer2,
    private dataService: DataService,
  ) {
    this.modeView = this.modes[this.mode];
  }

  grades$: Observable<string[]> = new Observable<string[]>();
  loadedGrades$: Observable<boolean>;

  ngOnInit(): void {
    this.grades$ = this.dataService.getGradesList().pipe(
      takeUntil(this.destroy$),
      shareReplay(1),
    );

    this.loadedGrades$ = this.grades$.pipe(
      tap(_ => console.log('LOAD')),
      tap(_ => this.adjustGradeDialogScroll()),
      map(_ => true),
    );

    if (!this.data) {
      this.data = this.overlayService.pageState.getValue().data?.visibility ?? DEFAULT_VISIBILITY_STUDENTS;
    }
    this.mode = this.data.mode;
    this.modeView = this.modes[this.data.mode];
    this.selectedStudents = this.data.over; 
    this.selectedGradeLevels = this.data.grade;

    const hasChanged = !this.isEqualPrevData(this.data);
    // keep last non-all data
    this.updatePrevData();

    this.dirty.pipe(
      takeUntil(this.destroy$),
      startWith(hasChanged),
    ).subscribe((v: boolean) => {
      const c = this.visibilityForm.get('visibility');
      console.log('PRISTINE VAL:', this.visibilityForm.pristine, c.value)
      if (v) {
        c.markAsDirty();
      } else {
        c.markAsPristine();
      }
    });

    this.change$.pipe(
      takeUntil(this.destroy$),
      tap(() => this.visibilityChange())
    ).subscribe();
  }

  adjustGradeDialogScroll() {
    setTimeout(( ) => {
      const $ul = document.querySelector('.panel.grade-level');
      if (!!$ul) {
        const $x = $ul.getBoundingClientRect();
        const delta = this.bottomSearchComponent - $x.height; 
        if (delta < 0) {
          // deals with a posible too long grades's list
          this.panelMaxHeight = this.bottomSearchComponent + 'px';
        }
      }
    }, 0); 
  }

  unlisten: () => void;

  ngAfterViewInit() {
    if (this.selectedStudents.length > 0) {
      this.searchComponent.inputField = false;
    } else if (this.selectedGradeLevels.length > 0) {
      this.searchComponent.inputField = false;
    }

    this.unlisten = this.renderer.listen('document', 'click', event => {
      try {
        let $input = null;
        if (this.searchComponent?.input && ('input' in this.searchComponent.input))  {
          $input = this.searchComponent.input['input']['nativeElement'];
        }
        const $el = event.target;
        const $opener = this.openerRef.nativeElement; 
        const isInput = $el === $input;
        const isOpener = $el === $opener; 
        const fromdialog = !!$el.closest('#opener-visibility-options')

        this.showErrorsVisibility = true;
        if (isInput || isOpener || fromdialog) {
          this.showErrorsVisibility = false;
        }
        // TODO search left opened  will close on clicking elsewhere
        /*} else if (this.isShowSearch) {
          this.searchComponent.inputField = false;
        }*/
      } catch (e) {
        console.log('RV.listen', e);
      }
    });
  }

  private allowOpenGradeLevel: boolean = true;
  // the focus of internal input native of app-search
  // triggers this method in order to hide the errors 
  public onSearchComponentFocus() {
    this.showErrorsVisibility = false;
    // open grade level options
    this.openGradeLevelDialog();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unlisten();
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.clickoutFn) {
      this.clickoutFn(event);
    }
  }

  clickoutFn: Function;
  
  private gradeLevelDialog: MatDialogRef<TemplateRef<any>> | undefined;
  private readonly GRADE_LEVEl_DIALOG_ID = 'grade-level-options';

  openGradeLevelDialog() {

    const panelDialogExists = this.dialog.getDialogById(this.GRADE_LEVEl_DIALOG_ID);
    if (panelDialogExists) return;

    this.loadedGrades$.pipe(take(1)).subscribe();

    if (this.searchComponent.inputField) {
      const $input = this.searchComponent.input['input']['nativeElement'];
      // non empty field  cancels the dialog opening
      if ($input.value.length) return;
    }

    if (!this.allowOpenGradeLevel) {
      this.allowOpenGradeLevel = !this.allowOpenGradeLevel;
      return;
    }

    const conf = {
      id: this.GRADE_LEVEl_DIALOG_ID,
      panelClass: 'consent-dialog-container',
      hasBackdrop: false,
      autofocus: false,
    };
    this.gradeLevelDialog = this.dialog.open(this.gradeLevelTpl, conf);
    this.positionGradeLevelDialog();
    this.gradeLevelDialog.afterClosed()
    .pipe(
      take(1),
      tap(() => {
        if (!!this.visibilityForm.value.visibility?.grade) {
          this.selectedGradeLevels = [...this.visibilityForm.value.visibility.grade];
        }
      }),
    )
    .subscribe(() => {
      this.clickoutFn = null;
    });

    this.gradeLevelDialog.afterOpened().subscribe(() => {
      this.clickoutFn = this.closeGradeLevelDialog;
    });

    this.allowOpenGradeLevel = !this.allowOpenGradeLevel;
  }

  closeGradeLevelDialog(event: MouseEvent) {
    const $matContainer = document.getElementById(this.GRADE_LEVEl_DIALOG_ID);
    if (!$matContainer) {
      this.gradeLevelDialog?.close();// might be undefined
      return 
    }

    const rect = $matContainer.getBoundingClientRect()
    if(
      event.clientX <= rect.left || event.clientX >= rect.right || 
      event.clientY <= rect.top || event.clientY >= rect.bottom)
    {
      this.gradeLevelDialog.close();
    }
  }

  handleGradeLevelSelected(grade: string) {
    const visibility = this.visibilityForm.value.visibility;
    visibility.grade = [...visibility?.grade ?? [], grade].filter((v, i, self) => self.indexOf(v) === i);

    this.mode = visibility.mode;
    this.selectedStudents = visibility.over;
    this.selectedGradeLevels = visibility.grade;

    this.change$.next();

    //this.visibilityForm.patchValue({visibility});
    //this.visibilityForm.markAsDirty();

    this.gradeLevelDialog.close();
    this.searchComponent.inputField = false;
    this.allowOpenGradeLevel = true;
  }

  updateGradeLevel(grades: string[]) {
    let visibility = this.visibilityForm.value.visibility;
    visibility.grade = [...grades ?? []].filter((v, i, self) => self.indexOf(v) === i);
    visibility = cloneDeep(visibility);

    this.mode = visibility.mode;
    this.selectedStudents = visibility.over;
    this.selectedGradeLevels = visibility.grade;

    this.change$.next();
    this.dirty.next();

    //this.visibilityForm.patchValue({visibility});
  }

  private dirty: Subject<boolean> = new Subject<boolean>();

  // needed for template in order to stop keyvalue ordering
  private asIs = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  };

  private panelDialog: MatDialogRef<TemplateRef<any>> | undefined;

  handleOpenClose() {
    const PANEL_ID = 'opener-visibility-options';

    const panelDialogExists = this.dialog.getDialogById(PANEL_ID);
    if (panelDialogExists) return;

    const conf = {
      id: PANEL_ID,
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
    };
    this.panelDialog = this.dialog.open(this.panelRef, conf);
    this.positionPanelDialog();
    this.didOpen = true;

    this.panelDialog.afterClosed()
    .pipe(
      take(1),
      filter( (v: VisibilityMode | null) => !!v && (v !== this.mode)),
      tap((v: VisibilityMode) => {
        
        // init new mode
        const visibility: VisibilityOverStudents = DEFAULT_VISIBILITY_STUDENTS;
        visibility.over = this.selectedStudents = [];
        visibility.grade = this.selectedGradeLevels = [];
        visibility.mode = this.mode = v;
        if (v !== 'visible_all_students' && this.prevdata[v]) {
          visibility.over = this.selectedStudents = this.prevdata[v].over;
          visibility.grade = this.selectedGradeLevels = this.prevdata[v].grade;
        }
        this.visibilityForm.setValue({visibility});
        this.modeView = this.modes[v];

        if (!this.prevdata[v]) {
          this.resetSearchComponent();
        } else {
          this.setSearchComponent(this.prevdata[v].over);
        }
      }),
      finalize(() => {
        this.didOpen = false;
        this.panelDialog = undefined;
        // component is untouched
        //this.dirty.next(false);
      }),
    ).subscribe();
  }

  handleModeSelected(modefromview: VisibilityMode): void {
    // hide options panel
    this.panelDialog.close(modefromview);
  }

  public addFoundStudents(found: User[]) {
    this.dirty.next(true);
    this.selectedStudents = found; 
    this.change$.next();
  }

  public visibilityChange() {
    // prepare data for external use
    this.data = {mode: this.mode, over: [...this.selectedStudents], grade: [...this.selectedGradeLevels]};
   const data = cloneDeep(this.data); 
    // sync with page state
    this.overlayService.patchData({data});

    this.visibilityForm.setValue({visibility: data});
    // notify parent of selected option
    this.optionSelectedEvent.emit(data);

    // keep last modification
    this.updatePrevData();

    // no data? shows the search input
    if (this.data.over.length === 0 && !!this.searchComponent) {
      setTimeout(() => this.searchComponent.inputField = true, 0);
    }
  }

  private updatePrevData(data: VisibilityOverStudents | null = null) {
    if (data === null) data = this.data;
    
    if (data.mode === 'visible_all_students') return;

    this.prevdata = {
      ...this.prevdata,
      [data.mode]: {
        mode: data.mode, 
        over: data.over,
        grade: data.grade,
      }
    };
    this.prevdata = cloneDeep(this.prevdata);
  }

  private isEqualPrevData(data: VisibilityOverStudents): boolean {
    const prev = this.prevdata[data.mode];
    return isEqual(prev, data);
  }

  // call public method cancel of the search component
  // used inside VisibilityRoom  template
  public resetSearchComponent() {
    //TODO use setTimeout to check next js loop 
    // the presence of searchComponent 
    // how britle is this solution?
    setTimeout(() => {
      if (this.searchComponent) {
        // remove students;s chips from UI
        this.searchComponent.removeStudents();
        this.searchComponent.inputField = true;
      }
      this.change$.next();
    }, 0);
  }

  public setSearchComponent(ss: User[]) {
    setTimeout(() => {
      this.selectedStudents = ss;
      this.searchComponent.inputField = (ss.length === 0);
      this.change$.next();
    }, 0);
  }

  private positionPanelDialog() {
    // input search should exists
    const $rect = this.openerRef.nativeElement;
    const rect = $rect.getBoundingClientRect();
    // bottom right related to opener
    const position = {
      top: (rect.bottom) + 'px', 
      // 270 is taken from CSS not live calculated, also 13 represents padding
      left: rect.left + (rect.width - 270 - 13) + 'px', 
    };
    this.panelDialog.updatePosition(position)
  }

  public panelMaxHeight: string = 'none';
  private bottomSearchComponent: number | null = null;

  private positionGradeLevelDialog() {
    // input search should exists
    const $rect = this.searchComponent.input['input']['nativeElement'];
    const rect = $rect.getBoundingClientRect();

    // bottom right related to opener
    const position = {
      top: (rect.bottom) + 'px', 
      // 270 is taken from CSS not live calculated, also 13 represents padding
      left: rect.left + (rect.width - 270 - 13) + 'px', 
    };
    this.gradeLevelDialog.updatePosition(position);

    this.bottomSearchComponent = window.innerHeight - rect.bottom;
  }

  // UI hover color
  hoveredNonSelected: boolean | null
  
  onEnter(mode: string) {
    if (mode !== this.mode) this.hoveredNonSelected = true;
  }
  
  onLeave(mode: string) {
    this.hoveredNonSelected = false;
  }
}
