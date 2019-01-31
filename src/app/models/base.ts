export abstract class BaseModel {

  abstract id: string;

  isSameObject(that: BaseModel) {
    return this.id === that.id;
  }

  isAssignedToSchool(schoolId: string) {
    const mySchool: string = (this as any).school_id;

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


