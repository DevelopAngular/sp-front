import { BaseModel } from './base';
import { User } from './User';
import { PassLike } from './index';

export enum Status {
	Active = 'active',
	Closed = 'closed',
}

export class Report extends BaseModel {
	constructor(
		public id: string,
		public created: Date,
		public last_updated: Date,
		public issuer: User,
		public student: User,
		public message: string,
		public status: Status,
		public reported_pass_id: number | null,
		public reported_pass: PassLike | null
	) {
		super();
	}

	static fromJSON(JSON: any): Report {
		if (!JSON) {
			return null;
		}

		const id: string = '' + JSON['id'],
			created: Date = new Date(JSON['created']),
			last_updated: Date = new Date(JSON['last_updated']),
			issuer: User = User.fromJSON(JSON['issuer']),
			student: User = User.fromJSON(JSON['student']),
			message: string = JSON['message'],
			status: Status = Status[JSON['status']],
			reported_pass_id: number | null = JSON['reported_pass_id'] ?? null,
			reported_pass: PassLike | null = JSON['reported_pass'] ?? null;

		return new Report(id, created, last_updated, issuer, student, message, status, reported_pass_id, reported_pass);
	}
}

export type ReportDataUpdate = Partial<Report> & { id: string | number };
