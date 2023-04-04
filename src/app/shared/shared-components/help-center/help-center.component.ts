import { ConnectedPosition } from '@angular/cdk/overlay';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IntroData } from '../../../ngrx/intros';
import { NavbarElementsRefsService } from '../../../services/navbar-elements-refs.service';
import { UserService } from '../../../services/user.service';

@Component({
	selector: 'app-help-center',
	templateUrl: './help-center.component.html',
	styleUrls: ['./help-center.component.scss'],
})
export class HelpCenterComponent implements OnInit, OnDestroy, AfterViewInit {
	showHelpNuxTooltip: Subject<boolean> = new Subject();
	nuxWrapperPosition: ConnectedPosition = {
		originX: 'center',
		originY: 'bottom',
		overlayX: 'end',
		overlayY: 'top',
		offsetY: 15,
	};

	isOldUser: boolean = true;
	showBadge: boolean = false;
	title: string = 'Got a question?';
	description: string = '';

	destroy$: Subject<any> = new Subject<any>();

	// nux props
	showHelpCenterNux: boolean;
	introsData: IntroData;
	introSubs: Subscription;

	@Output() onClick: EventEmitter<any> = new EventEmitter<any>();

	constructor(private userService: UserService, private navbarService: NavbarElementsRefsService) {}

	ngOnInit(): void {
		this.nuxWrapperPosition = {
			originX: 'start',
			originY: 'top',
			overlayX: 'start',
			overlayY: 'top',
			offsetY: -90,
			offsetX: -30,
		};

		this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
			this.isOldUser = moment(user?.first_login).isBefore(moment('2023-02-15T00:00:00.000Z'));
			if (this.isOldUser) {
				this.showBadge = true;
				this.description = 'Discover our new Help sidebar to get the most out of SmartPass.';
			} else {
				this.showBadge = false;
				this.description = 'Help is never more than a few clicks away in SmartPass.';
			}
		});

		this.navbarService.getRenewalFill().subscribe((onRenewalPage) => {
			this.showHelpCenterNux = !onRenewalPage;
		});
	}

	ngAfterViewInit(): void {
		this.introSubs = this.userService.introsData$.subscribe((intros) => {
			this.introsData = intros;
			if (intros) this.showHelpNuxTooltip.next(!intros?.frontend_help_center?.universal?.seen_version);
		});
	}

	closeNuxToolTip(event) {
		this.showHelpNuxTooltip.next(false);
		this.userService.updateIntrosHelpCenterRequest(this.introsData, 'universal', '1');
		if (event == true) {
			this.openHelpCenter();
		}
	}

	openHelpCenter() {
		this.onClick.emit(true);
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		if (this.introSubs) {
			this.introSubs.unsubscribe();
		}
	}
}
