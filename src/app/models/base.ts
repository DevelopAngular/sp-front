export abstract class BaseModel {
	abstract id: number;

	isSameObject(that: BaseModel) {
		return this?.id === that?.id;
	}

	isAssignedToSchool(schoolId: number): boolean {
		const mySchool: number = (this as any).school_id;

		if (mySchool === undefined) {
			console.log(`Object ${this} has no school_id`);
			return true;
		}

		return mySchool === schoolId;
	}
}

export interface ReadableModel extends BaseModel {
	isRead: boolean;
}
