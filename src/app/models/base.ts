export abstract class BaseModel {

  abstract id: string;

  isSameObject(that: BaseModel) {
    return this.id === that.id;
  }

}
