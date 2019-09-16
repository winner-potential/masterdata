import { Directive } from "@angular/core";
import { NG_VALIDATORS, AbstractControl, ValidationErrors, Validator } from "../../../node_modules/@angular/forms";

@Directive({
  selector: "[selection-validator]",
  providers: [{ provide: NG_VALIDATORS, useExisting: SelectionValidatorDirective, multi: true }]
})
export class SelectionValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors {
    if (!control.value || !control.value._id) {
      return { integer: "No entry selected" };
    }
    return null;
  }
}
