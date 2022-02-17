import {
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import {Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {CustomToolTipComponent} from '../../shared/shared-components/custom-tool-tip/custom-tool-tip.component';
import {ComponentPortal} from '@angular/cdk/portal';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ConnectedPosition} from '@angular/cdk/overlay/position/flexible-connected-position-strategy';

@Directive({
  selector: '[nuxTooltip]'
})
export class NuxTooltipRendererDirective implements OnInit, OnDestroy, OnChanges {

  @Input() showToolTip$: Subject<boolean>;
  @Input(`nuxToolTip`) text: string;
  @Input() contentTemplate: TemplateRef<any>;
  @Input() position: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 15,
  };

  @Output() leave: EventEmitter<any> = new EventEmitter<any>();

  private _overlayRef: OverlayRef;
  private tooltipRef: ComponentRef<CustomToolTipComponent>;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private _overlay: Overlay,
    private _overlayPositionBuilder: OverlayPositionBuilder,
    private _elementRef: ElementRef
  ) { }

  ngOnInit() {
    const positionStrategy = this._overlayPositionBuilder
      .flexibleConnectedTo(this._elementRef)
      .withPositions([this.position]);

    this._overlayRef = this._overlay.create({positionStrategy});

    this.showToolTip$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        if (this._overlayRef && !this._overlayRef.hasAttached()) {
          this.tooltipRef = this._overlayRef.attach(new ComponentPortal(CustomToolTipComponent));
          this.tooltipRef.instance.contentTemplate = this.contentTemplate;
          this.tooltipRef.instance.text = this.text;
        }
      } else {
        this.closeToolTip();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnDestroy() {
    this.closeToolTip();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private closeToolTip() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this.leave.emit();
    }
  }

}
