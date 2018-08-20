import { BaseModel } from '../models/base';

export class State<ModelType extends BaseModel> {
  passes: ModelType[];
  filtered_passes: ModelType[];
  pass_lookup: { [id: number]: ModelType };
  sort = '-created';
  filter_query = '';

  constructor(passes: ModelType[]) {
    this.passes = Array.from(passes);
    this.filtered_passes = Array.from(passes);
    this.pass_lookup = {};

    for (const pass of this.passes) {
      this.pass_lookup[pass.id] = pass;
    }
  }

  addItem(item: ModelType) {
    this.passes.push(item);
    this.pass_lookup[item.id] = item;
  }

  updateItem(item: ModelType) {
    for (let i = 0; i < this.passes.length; i++) {
      if (this.passes[i].id === item.id) {
        this.passes[i] = item;
      }
    }

    this.pass_lookup[item.id] = item;
  }

  addOrUpdateItem(item: ModelType) {
    if (this.pass_lookup[item.id]) {
      this.updateItem(item);
    } else {
      this.addItem(item);
    }
  }

  removeItem(item: ModelType) {
    this.passes = this.passes.filter(p => p.id !== item.id);
    delete this.pass_lookup[item.id];
  }

  removeItemById(id: number | string) {
    const pass = this.pass_lookup[id];
    if (pass !== undefined) {
      this.removeItem(pass);
    }
  }
}
