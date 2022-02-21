import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ApiService } from '../api.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '../../../node_modules/@angular/forms';

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
  public _document: any;
  public _value: any;
  public disabled: boolean;
  public required: boolean;
  
  @Input('required') private _required: any;
  @Input('placeholder') public placeholder: string;

  private onChange = _ => {};
  private onTouched = () => {};

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.required = this._required == "";
  }

  get document() : any {
    return this._document;
  }

  set document(value: any) {
    if(value && value._id) {
      this._value = value._id;
    } else {
      this._value = undefined;
    }
    this._document = value;
    this.onChange(this._value);
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
    let doc = e.option.value;
  }

  writeValue(obj: string): void {
    this._value = obj;
    if(obj) {
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

}
