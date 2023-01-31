export interface RecurringConfig {
	id: number;
	issuer_id: number;
	weekday: number;
	calendar_date: number;
	recurrence_type: number;
}

export enum RecurringOption {
	DoesNotRepeat,
	Daily,
	Weekly,
	Minutely, // Do not remove. Valid option
}
