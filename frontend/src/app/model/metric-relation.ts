export class MetricRelation {
    constructor(alias: String = '', identifier: String = '', link: String = '', document: String = '', id: String = '') {
        this._identifier = identifier;
        this._alias = alias;
        this._link = link;
        this._id = id;
        this._document = document;
    }

    private _identifier: String;

    get identifier(): String {
        return this._identifier;
    }

    set identifier(val: String) {
        this._identifier = val;
    }

    private _id: String;

    get id(): String {
        return this._id;
    }

    private _link: String;

    get link(): String {
        return this._link;
    }

    set link(val: String) {
        this._link = val;
    }

    private _alias: String;

    get alias(): String {
        return this._alias;
    }

    set alias(val: String) {
        this._alias = val;
    }

    private _document: String;

    get document(): String {
        return this._document;
    }

    set document(val: String) {
        this._document = val;
    }
}
