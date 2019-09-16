import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "../../../../../node_modules/@angular/forms";
import { AttributeCheckConfiguration } from "./validator.directive";

@Component({
  selector: "document-attribute",
  templateUrl: "./attribute.component.html",
  styleUrls: ["./attribute.component.css"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentAttributeComponent),
      multi: true
    }
  ]
})
export class DocumentAttributeComponent implements OnInit, ControlValueAccessor {
  @Input("attribute-name") public name: string;
  @Input("attribute-type") public type: string;
  @Input("attribute-required") public required: boolean;
  @Output("data") public dataEvent = new EventEmitter<any>();
  public disabled: boolean;

  public config: AttributeCheckConfiguration;

  private _value: string;
  private onChange = _ => {};
  private onTouched = () => {};

  constructor() {}

  ngOnInit() {
    this.type = this.type.toLowerCase();
    if (this.type == "integer") this.config = new AttributeCheckConfiguration(false, true, this.required);
    else if (this.type == "number") this.config = new AttributeCheckConfiguration(true, false, this.required);
    else if (this.type == "separator") this.config = new AttributeCheckConfiguration(false, false, false);
    else this.config = new AttributeCheckConfiguration(false, false, this.required);
  }

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
  }

  handleFileChange(event) {
    if (event && event.length) {
      if (!event[0].type.match('image.*')) {
        return;
      }
      this.dataEvent.emit(event[0]);
    }
  }

  writeValue(obj: string): void {
    this._value = obj;
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
