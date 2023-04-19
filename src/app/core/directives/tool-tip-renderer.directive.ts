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
	TemplateRef,
} from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CustomToolTipComponent } from '../../shared/shared-components/custom-tool-tip/custom-tool-tip.component';
import { ConnectedPosition } from '@angular/cdk/overlay/position/flexible-connected-position-strategy';
import { of, race, Subject, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Directive({
	selector: '[customToolTip]',
})
export class ToolTipRendererDirective implements OnInit, OnDestroy, OnChanges {
	/**
	 * This will be used to show tooltip or not
	 * This can be used to show the tooltip conditionally
	 */
	@Input() showToolTip: boolean = true;
	@Input() nonDisappearing: boolean = true;
	@Input() position: 'mouse' | 'top' | 'bottom' | 'left' | 'right' = 'bottom';
	@Input() editable: boolean = true;
	@Input() positionStrategy: ConnectedPosition;
	@Input() width: string = 'auto';
	@Input() allowVarTag: boolean = false;

	// If this is specified then specified text will be showin in the tooltip
	@Input(`customToolTip`) text: string;

	// If this is specified then specified template will be rendered in the tooltip
	@Input() contentTemplate: TemplateRef<any>;

	@Output() leave: EventEmitter<any> = new EventEmitter<any>();
	@Output() isOpen: EventEmitter<boolean> = new EventEmitter<boolean>();

	// destroy for tooltip component
	private destroyOpen$: Subject<any> = new Subject<any>();
	// destroy for this directive
	private destroy$: Subject<any> = new Subject<any>();

	private _overlayRef: OverlayRef;
	private tooltipRef: ComponentRef<CustomToolTipComponent>;

	constructor(private _overlay: Overlay, private _overlayPositionBuilder: OverlayPositionBuilder, private _elementRef: ElementRef) {}

	ngOnInit() {
		// this.contentTemplate has a default template
		// simpleText in CustomToolTipComponent
		// this.text is necessary only when we use simpleText
		// otherwise the template can have its own text
		// per total, we dont't need this condition
		/*if (!this.contentTemplate && !this.text) {
      this.showToolTip = false;
    }*/
		if (!this.showToolTip) {
			return;
		}

		const positionStrategy = this._overlayPositionBuilder
			.flexibleConnectedTo(this._elementRef)
			.withPositions([this.positionStrategy ? this.positionStrategy : this.getPosition()]);

		//const scrollStrategy = this._overlay.scrollStrategies.reposition({autoClose: true});
		const scrollStrategy = this._overlay.scrollStrategies.close();

		this._overlayRef = this._overlay.create({
			positionStrategy,
			scrollStrategy,
			panelClass: 'custom-tooltip',
		});

		// in case of the click event
		// this is (all time or most of the time?) followed by a hover event
		// resulting in a double call to this.show
		// and the second event triggers this.closeTooltip
		// so, the tooltip disappears imediatly
		// rxjs race "filters" the doubles to the quickest one
		race([this.click$, this.hover$])
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (evt: Event) => {
					if (this.position === 'mouse') {
						const origin = this._elementRef.nativeElement.getBoundingClientRect();
						const e = evt as any;
						this.mousex = e.clientX - origin.x;
						this.mousey = e.clientY - origin.y;

						const positionStrategy = this._overlayPositionBuilder.flexibleConnectedTo(this._elementRef).withPositions([this.getPosition()]);
						this._overlayRef.updatePositionStrategy(positionStrategy);
					}
					this.show();
				},
			});
	}

	private mousex: number = 0;
	private mousey: number = 0;

	ngOnChanges(changes: SimpleChanges) {
		if (changes?.['showToolTip']?.currentValue) {
			const positionStrategy = this._overlayPositionBuilder
				.flexibleConnectedTo(this._elementRef)
				.withPositions([this.positionStrategy ? this.positionStrategy : this.getPosition()]);
			// because showToolTip has chabged we re-create the tooltip
			// TODO: for other significant attributes, beside showToolTip
			this._overlayRef = this._overlay.create({
				positionStrategy,
				panelClass: 'custom-tooltip',
			});
		}
	}

	getPosition(): ConnectedPosition {
		if (this.position === 'top') {
			return {
				originX: 'center',
				originY: 'top',
				overlayX: 'center',
				overlayY: 'top',
				offsetY: -55,
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
				offsetX: -50,
			};
		} else if (this.position === 'right') {
			return {
				originX: 'center',
				originY: 'top',
				overlayX: 'center',
				overlayY: 'top',
			};
		} else if (this.position === 'mouse') {
			// TODO: other origin cases: start | end
			return {
				originX: 'center',
				originY: 'top',
				overlayX: 'center',
				overlayY: 'top',
				offsetY: this.mousey + 10,
				// added extra offset
				// to not trigger an accidental mouseleave event
			};
		}
	}

	click$: Subject<Event> = new Subject<Event>();
	hover$: Subject<Event> = new Subject<Event>();

	@HostListener('click', ['$event'])
	gotClick(evt: Event) {
		this.click$.next(evt);
	}
	@HostListener('pointerover', ['$event'])
	gotHover(evt: Event) {
		this.hover$.next(evt);
	}
	show() {
		// attach the component if it has not already attached to the overlay
		if (!(this.text || this.contentTemplate)) {
			return;
		}
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
						this.tooltipRef.instance.allowVarTag = this.allowVarTag;

						return this.tooltipRef.instance.closeTooltip;
					}
					return of(null);
				})
			)
			.subscribe(() => {
				this.closeToolTip();
			});
	}

	@HostListener('pointerout')
	@HostListener('mouseleave')
	hide() {
		this.closeToolTip();
		this.destroyOpen$.next();
	}

	ngOnDestroy() {
		this.destroyOpen$.next();
		this.destroyOpen$.complete();
		this.closeToolTip();

		this.destroy$.next();
		this.destroy$.complete();
	}

	private closeToolTip() {
		if (this._overlayRef) {
			this._overlayRef.detach();
			this.leave.emit();
			this.isOpen.emit(false);
		}
	}
}
