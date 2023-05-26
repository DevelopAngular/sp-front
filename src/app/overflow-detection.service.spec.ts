import { TestBed } from '@angular/core/testing';

import { OverflowDetectionService } from './overflow-detection.service';

describe('OverflowDetectionService', () => {
	let service: OverflowDetectionService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(OverflowDetectionService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
