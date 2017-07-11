import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import * as _ from 'lodash';

import { FieldType, FormlyFormBuilder, FormlyConfig, FormlyFieldConfig } from 'ng-formly';

@Component({
  selector: 'formly-multilang-field',
  template: `
      <formly-form [fields]="fields"
                   [model]="model"
                   [form]="formlyGroup"
                   [options]="newOptions">
      </formly-form>
  `,
})
export class FormlyMultilangField extends FieldType implements OnInit, OnChanges {

  fields;

  get newOptions() {
    return { ...this.options };
  }

  get formlyGroup(): AbstractControl {
    if (this.field.formControl) {
      return this.field.formControl;
    } else {
      return this.form;
    }
  }

  constructor(private formlyConfig: FormlyConfig, private formlyBuilder: FormlyFormBuilder) {
    super();
  }

  ngOnInit() {
    this.buildMultilangField(this.to);
  }

  private buildMultilangField(templateOptions): void {

    debugger

    const key = templateOptions.key;
    const baseField = templateOptions.field;
    const languages = templateOptions.languages;
    const fieldExpression = templateOptions.fieldExpression;

    const field = {
      key: key,
      fieldGroup: [],
			templateOptions: {
				label: templateOptions.label,
			}
    };

		const fields = [];

    languages.forEach(lang => {
      const newField: FormlyFieldConfig = Object.assign(
          {
            id: `${key}-${lang}`,
            key: lang,
            templateOptions: {},
            validators: {},
          },
          _.cloneDeep(baseField),
        );

      if(fieldExpression.validators) {
        for(let validator in fieldExpression.validators) {
          newField.validators[validator] = fieldExpression.validators[validator](lang);
        }
      }

      if(fieldExpression.fieldMapping) {
        fieldExpression.fieldMapping(newField, lang);
      }

      field.fieldGroup.push({
        fieldGroup: [newField],
        hideExpression: () => fieldExpression.hideExpression(lang),
      });
    });

    this.fields = [ field ];
  }
}
