import { Directive, Input } from "@angular/core";
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from "@angular/forms";

@Directive({
  selector: "[attribute-check]",
  providers: [{ provide: NG_VALIDATORS, useExisting: AttributeValidatorDirective, multi: true }]
})
export class AttributeValidatorDirective implements Validator {
  @Input("attribute-check") config: AttributeCheckConfiguration;

  validate(control: AbstractControl): ValidationErrors {
    if(this.config) {
      if(this.config.integer) {
        if(control.value) {
          if(!control.value.match(/^([+-]?[0-9]+)$/)) {
            return {"integer": "Bad integer format"};
          }
        }
      } else if(this.config.number) {
        if(control.value) {
          if(!control.value.match(/^([+-]?([0-9]*[.])?[0-9]+)$/)) {
            return {"number": "Bad number format"};
          }
        }
      }
      if(this.config.required) {
        if(!control.value) {
          return {"missing": "Missing value"};
        }
      }
    }
    return null;
  }
}

export class AttributeCheckConfiguration {
  constructor(public number: boolean, public integer: boolean, public required: boolean) {}
}
