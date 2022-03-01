import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { AttributeDefinition } from '../../../model/attribute-definition';

@Directive({
    selector: '[attribute-type-validation]',
    providers: [{provide: NG_VALIDATORS, useExisting: AttributeTypeValidatorDirective, multi: true}]
})
export class AttributeTypeValidatorDirective implements Validator {
    @Input('attribute-type-validation') attributeType: AttributeDefinition;

    validate(control: AbstractControl): ValidationErrors {
        if (this.attributeType && !this.attributeType.nameIsUnique(control.value)) {
            return {'unique': true};
        }
        return null;
    }
}
