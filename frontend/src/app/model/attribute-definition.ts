import { AttributeDefinitions } from "./attribute-definitions";

export class AttributeDefinition {
  private _name: String;
  private _type: String;
  private _should: Boolean;
  private _parent: AttributeDefinitions;

  constructor(name: String = "", type: String = "", should : Boolean = false) {
    this._name = name;
    this._type = type;
    this._should = should;
  }

  set name(value: String) {
    this._name = value;
  }

  get name(): String {
    return this._name;
  }

  set should(value: Boolean) {
    this._should = value;
  }

  get should(): Boolean {
    return this._should;
  }

  set type(value: String) {
    this._type = value;
  }

  get type(): String {
    return this._type;
  }

  set parent(value: AttributeDefinitions) {
    this._parent = value;
  }

  get parent(): AttributeDefinitions {
    return this._parent;
  }

  public isValid() : Boolean {
    return this._name && this._type && this.nameIsUnique(this._name);
  }

  public nameIsUnique(newName : String) : Boolean {
    newName = newName || "";
    var nameNotUnique = false;
    if(this._parent) {
      this._parent.forEach((attr:AttributeDefinition) => {
        if(attr == this) {
          return;
        }
        if(attr.name.toLowerCase() == newName.toLowerCase()) {
          nameNotUnique = true;
        }
      })
    }
    return !nameNotUnique;
  }

}
