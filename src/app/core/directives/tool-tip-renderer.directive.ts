import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
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
  @Input() tooltipDelay: number = 0;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() editable: boolean = false;
  @Input() positionStrategy: ConnectedPosition;

  // If this is specified then specified text will be showin in the tooltip
  @Input(`customToolTip`) text: string;

  // If this is specified then specified template will be rendered in the tooltip
  @Input() contentTemplate: TemplateRef<any>;

  private destroyOpen$: Subject<any> = new Subject<any>();
  private overEvent: boolean;

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
      .withPositions([this.editable ? this.positionStrategy : this.getPosition()]);

    this._overlayRef = this._overlay.create(
      {
        positionStrategy,
        panelClass: 'custom-tooltip'
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
        offsetX: -100
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

  @HostListener('mouseenter')
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

            return this.tooltipRef.instance.closeTooltip;
          }
          return of(null);
        }),
      ).subscribe(() => this.closeToolTip());
  }

  @HostListener('mouseleave')
  hide() {
    this.destroyOpen$.next();
    if (this.editable) {
      this.closeToolTip();
    }
    // this.closeToolTip();
  }

  ngOnDestroy() {
    this.closeToolTip();
  }

  private closeToolTip() {
    if (this._overlayRef) {
      this._overlayRef.detach();
    }
  }

}
