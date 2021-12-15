import {ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {CustomToolTipComponent} from '../../shared/shared-components/custom-tool-tip/custom-tool-tip.component';

@Directive({
  selector: '[customToolTip]'
})
export class ToolTipRendererDirective implements OnInit, OnDestroy {

  /**
   * This will be used to show tooltip or not
   * This can be used to show the tooltip conditionally
   */
  @Input() showToolTip: boolean = true;
  @Input() tooltipDelay: number = 0;

  // If this is specified then specified text will be showin in the tooltip
  @Input(`customToolTip`) text: string;

  // If this is specified then specified template will be rendered in the tooltip
  @Input() contentTemplate: TemplateRef<any>;

  private _overlayRef: OverlayRef;
  private tooltipRef: ComponentRef<CustomToolTipComponent>;

  constructor(
    private _overlay: Overlay,
    private _overlayPositionBuilder: OverlayPositionBuilder,
    private _elementRef: ElementRef
  ) { }

  ngOnInit() {

    console.log('HTML ELEM  ==>>>', this._elementRef.nativeElement);

    if (!this.showToolTip) {
      return;
    }

    const positionStrategy = this._overlayPositionBuilder
      .flexibleConnectedTo(this._elementRef)
      .withPositions([{
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 15,
      }]);

    this._overlayRef = this._overlay.create(
      {
        positionStrategy,
        panelClass: 'custom-tooltip'
      }
    );

  }

  @HostListener('mouseenter')
  show() {
    // attach the component if it has not already attached to the overlay
    if (this._overlayRef && !this._overlayRef.hasAttached()) {
      this.tooltipRef = this._overlayRef.attach(new ComponentPortal(CustomToolTipComponent));
      this.tooltipRef.instance.contentTemplate = this.contentTemplate;
      this.tooltipRef.instance.text = this.text;

      this.tooltipRef.instance.closeTooltip.subscribe(res => {
        this.closeToolTip();
        console.log('close');
      });
    }
  }

  @HostListener('mouseleave')
  hide() {
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
