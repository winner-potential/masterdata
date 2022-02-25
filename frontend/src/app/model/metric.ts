import { Tag } from './tag';

export class Metric {
    constructor(alias: String = '', key: String = '', identifier: String = '', id: String = '') {
        this._alias = alias;
        this._key = key;
        this._identifier = identifier;
        this._id = id;
    }

    private _alias: String;

    get alias(): String {
        return this._alias;
    }

    set alias(val: String) {
        this._alias = val;
    }

    private _key: String;

    get key(): String {
        return this._key;
    }

    set key(val: String) {
        this._key = val;
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

    private _tags: Map<string, Tag> = new Map<string, Tag>();

    get tags(): Map<string, Tag> {
        return this._tags;
    }

    set tags(val: Map<string, Tag>) {
        this._tags = val;
    }

    public getOrCreateTag(template: any): Tag {
        if (!this.tags.has(template._id)) {
            this.tags.set(template._id, new Tag(template._id, template.value, undefined));
        }
        return this.tags.get(template._id);
    }
}
