import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'document-input',
    templateUrl: './document-input.component.html',
    styleUrls: ['./document-input.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DocumentInputComponent),
            multi: true
        }
    ]
})
export class DocumentInputComponent implements OnInit, ControlValueAccessor {

    public documents: Array<any> = [];
    public _value: any;
    public disabled: boolean;
    public required: boolean;
    @Input() public placeholder: string;
    @Input('required') private _required: any;

    constructor(private api: ApiService) { }

    public _document: any;

    get document(): any {
        return this._document;
    }

    set document(value: any) {
        if (value && value._id) {
            this._value = value._id;
        } else {
            this._value = undefined;
        }
        this._document = value;
        this.onChange(this._value);
    }

    ngOnInit() {
        this.required = this._required == '';
    }

    handleDocument(e) {
        if (e && e.target && e.target.value) {
            this.api.findDocuments(e.target.value).subscribe((data: any) => {
                this.documents.length = 0;
                (data || []).forEach(p => {
                    this.documents.push(p);
                });
            });
        }
    }

    extractDisplayValue(document: any) {
        return document ? document.name : undefined;
    }

    handleSelection(e) {
        const doc = e.option.value;
    }

    writeValue(obj: string): void {
        this._value = obj;
        if (obj) {
            this.api.getDocument(obj).subscribe(document => {
                this.document = document;
            });
        }
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    private onChange = _ => {};

    private onTouched = () => {};

}
