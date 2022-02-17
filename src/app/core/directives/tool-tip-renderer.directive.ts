import {
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import {Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {CustomToolTipComponent} from '../../shared/shared-components/custom-tool-tip/custom-tool-tip.component';
import {ConnectedPosition} from '@angular/cdk/overlay/position/flexible-connected-position-strategy';
import {of, Subject, timer} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[customToolTip]'
})
export class ToolTipRendererDirective implements OnInit, OnDestroy, OnChanges {

  /**
   * This will be used to show tooltip or not
   * This can be used to show the tooltip conditionally
   */
  @Input() showToolTip: boolean = true;
  @Input() nonDisappearing: boolean = true;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() editable: boolean = false;
  @Input() positionStrategy: ConnectedPosition;
  @Input() width: string = 'auto';

  // If this is specified then specified text will be showin in the tooltip
  @Input(`customToolTip`) text: string;

  // If this is specified then specified template will be rendered in the tooltip
  @Input() contentTemplate: TemplateRef<any>;

  @Output() leave: EventEmitter<any> = new EventEmitter<any>();
  @Output() isOpen: EventEmitter<boolean> = new EventEmitter<boolean>();

  private destroyOpen$: Subject<any> = new Subject<any>();

  private _overlayRef: OverlayRef;
  private tooltipRef: ComponentRef<CustomToolTipComponent>;

  constructor(
    private _overlay: Overlay,
    private _overlayPositionBuilder: OverlayPositionBuilder,
    private _elementRef: ElementRef
  ) { }

  ngOnInit() {
    if (!this.contentTemplate && !this.text) {
      this.showToolTip = false;
    }
    if (!this.showToolTip) {
      return;
    }

    const positionStrategy = this._overlayPositionBuilder
      .flexibleConnectedTo(this._elementRef)
      .withPositions([this.positionStrategy ? this.positionStrategy : this.getPosition()]);

    this._overlayRef = this._overlay.create(
      {
        positionStrategy,
        panelClass: 'custom-tooltip',
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  getPosition(): ConnectedPosition {
    if (this.position === 'top') {
      return {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: -55
      };
    } else if (this.position === 'bottom') {
      return {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 15,
      };
    } else if (this.position === 'left') {
      return {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 15,
        offsetX: -50
      };
    } else if (this.position === 'right') {
      return {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'top',
      };
    }
  }

  @HostListener('click')
  @HostListener('pointerover')
  show() {
    // attach the component if it has not already attached to the overlay
    timer(300)
      .pipe(
        takeUntil(this.destroyOpen$),
        switchMap(() => {
          if (this._overlayRef && !this._overlayRef.hasAttached() && this.showToolTip) {
            this.tooltipRef = this._overlayRef.attach(new ComponentPortal(CustomToolTipComponent));
            this.tooltipRef.instance.contentTemplate = this.contentTemplate;
            this.tooltipRef.instance.text = this.text;
            this.tooltipRef.instance.width = this.width;
            this.tooltipRef.instance.nonDisappearing = this.nonDisappearing;
            this.isOpen.emit(true);

            return this.tooltipRef.instance.closeTooltip;
          }
          return of(null);
        }),
      ).subscribe(() => {
        this.closeToolTip();
    });
  }

  @HostListener('pointerout')
  @HostListener('mouseleave')
  hide() {
    if (this.editable) {
      this.closeToolTip();
    }
    this.destroyOpen$.next();
    // this.closeToolTip();
  }

  ngOnDestroy() {
    this.destroyOpen$.next();
    this.destroyOpen$.complete();
    this.closeToolTip();
  }

  private closeToolTip() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this.leave.emit();
      this.isOpen.emit(false);
    }
  }

}
