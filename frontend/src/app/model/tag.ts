export class Tag {
  private _identifier: String;
  private _id: String;
  private _value: String;

  constructor(identifier: String = "", value: String = "", id: String = "") {
    this._identifier = identifier;
    this._value = value;
    this._id = id;
  }

  get value(): String {
    return this._value;
  }
  set value(val: String) {
    this._value = val;
  }

  get identifier(): String {
    return this._identifier;
  }
  set identifier(val: String) {
    this._identifier = val;
  }

  get id(): String {
    return this._id;
  }
}
