export class Tag {
    constructor(identifier: String = '', value: String = '', id: String = '') {
        this._identifier = identifier;
        this._value = value;
        this._id = id;
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

    private _value: String;

    get value(): String {
        return this._value;
    }

    set value(val: String) {
        this._value = val;
    }
}
