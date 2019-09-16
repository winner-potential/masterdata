import { Tag } from "./tag";

export class Metric {
  private _alias: String;
  private _key: String;
  private _identifier: String;
  private _id: String;
  private _tags: Map<string, Tag> = new Map<string, Tag>();

  constructor(alias: String = "", key: String = "", identifier: String = "", id: String = "") {
    this._alias = alias;
    this._key = key;
    this._identifier = identifier;
    this._id = id;
  }

  set alias(val: String) {
    this._alias = val;
  }

  get alias(): String {
    return this._alias;
  }

  set key(val: String) {
    this._key = val;
  }

  get key(): String {
    return this._key;
  }

  set identifier(val: String) {
    this._identifier = val;
  }

  get identifier(): String {
    return this._identifier;
  }

  get id(): String {
    return this._id;
  }

  set tags(val: Map<string, Tag>) {
    this._tags = val;
  }

  get tags(): Map<string, Tag> {
    return this._tags;
  }

  public getOrCreateTag(template: any): Tag {
    if (!this.tags.has(template._id)) {
      this.tags.set(template._id, new Tag(template._id, template.value, undefined));
    }
    return this.tags.get(template._id);
  }
}
