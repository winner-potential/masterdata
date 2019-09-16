export class MetricRelation {
    private _identifier: String;
    private _id: String;
    private _link: String;
    private _alias: String;
    private _document: String;
  
    constructor(alias: String = "", identifier: String = "", link: String = "", document: String = "", id: String = "") {
      this._identifier = identifier;
      this._alias = alias;
      this._link = link;
      this._id = id;
      this._document = document;
    }
  
    get document(): String {
      return this._document;
    }
    set document(val: String) {
      this._document = val;
    }
  
    get link(): String {
      return this._link;
    }
    set link(val: String) {
      this._link = val;
    }
  
    get alias(): String {
      return this._alias;
    }
    set alias(val: String) {
      this._alias = val;
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
