import { AttributeDefinitions } from './attribute-definitions';

export class AttributeDefinition {
    constructor(name: String = '', type: String = '', should: Boolean = false) {
        this._name = name;
        this._type = type;
        this._should = should;
    }

    private _name: String;

    get name(): String {
        return this._name;
    }

    set name(value: String) {
        this._name = value;
    }

    private _type: String;

    get type(): String {
        return this._type;
    }

    set type(value: String) {
        this._type = value;
    }

    private _should: Boolean;

    get should(): Boolean {
        return this._should;
    }

    set should(value: Boolean) {
        this._should = value;
    }

    private _parent: AttributeDefinitions;

    get parent(): AttributeDefinitions {
        return this._parent;
    }

    set parent(value: AttributeDefinitions) {
        this._parent = value;
    }

    public isValid(): Boolean {
        return this._name && this._type && this.nameIsUnique(this._name);
    }

    public nameIsUnique(newName: String): Boolean {
        newName = newName || '';
        let nameNotUnique = false;
        if (this._parent) {
            this._parent.forEach((attr: AttributeDefinition) => {
                if (attr == this) {
                    return;
                }
                if (attr.name.toLowerCase() == newName.toLowerCase()) {
                    nameNotUnique = true;
                }
            });
        }
        return !nameNotUnique;
    }

}
