import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from 'ng-formly';

@Component({
  selector: 'formly-multilang-field',
  template: `
    <!--[model]="model"-->
    <formly-form [model]="model" [fields]="fields" [form]="control" [options]="newOptions" [buildForm]="false"></formly-form>
  `,
})
export class FormlyMultilangField extends FieldType implements OnInit {

  fields: FormlyFieldConfig[];

  get control() {
    return this.form.get(this.to.key);
  }

  get selectedlang(): string {
    return this.to.selectedLang;
  }

  get newOptions() {
    return { ...this.options };
  }

  ngOnInit() {
    (<FormGroup> this.form).addControl(this.to.key, new FormGroup({}));

    const control = <FormGroup> this.form.get(this.to.key);

    const fields = [];

    this.to.languages.forEach(lang => {
      control.addControl(lang.code, new FormControl(undefined));

      const newField = Object.assign({}, this.field.fieldGroup[0], {
        key: lang.code,
        hideExpression: () => this.selectedlang !== lang.code,
      });

      fields.push(newField);
    });

    this.fields = fields;
  }
}