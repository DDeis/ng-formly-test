import { Component, OnInit, ViewChild} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Http } from '@angular/http';

import * as _ from 'lodash';

import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';

import { FormlyFieldConfig, FormlyForm } from 'ng-formly';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	@ViewChild('langTabs') langTabs: NgbTabset;
  @ViewChild('formly') formly: FormlyForm;

  form: FormGroup;
	model: any;
	fields: Array<FormlyFieldConfig>;

	languages: any[];
	selectedLang: string;

	iptcData: any;
	keywordsOptions: any;

	titleField: FormlyFieldConfig;
  noteField: FormlyFieldConfig;
	iptcField: FormlyFieldConfig;
	keywordsField: FormlyFieldConfig;

	constructor(private http: Http, private formBuilder: FormBuilder) { }

	ngOnInit() {

    this.form = this.formBuilder.group({});

    this.selectedLang = 'en';

    this.keywordsOptions = {
      en: [ { item: 'Default IPTC keyword'}],
      fr: [ { item: 'Manual keyword'}],
      de: [ ]
    };


    const model = {
      title: {
        en: 'This is an English Title',
        fr: 'This is a French Title',
      },
      note: 'Test note',
      iptc: [ 2 ],
      keywords: {
        en: ['Default IPTC keyword'],
        fr: ['Manual keyword'],
        de: []
      }
    };

    this.model = model;

    this.initData();

    this.initFormlyFields(this.selectedLang);

    this.getFields();


	}

	initData() {
		this.iptcData = [
			{
				id: 0,
				label: 'IPTC 1',
				keywords: {
					en: ['English keyword 1'],
					fr: ['French keyword 1', 'French keyword 2'],
					de: [ ]
				}
			},
			{
				id: 1,
				label: 'IPTC 2',
				keywords: {
					en: ['English keyword 3'],
					fr: ['French keyword 3'],
					de: ['German keyword 3']
				}
			},
			{
				id: 2,
				label: 'Default IPTC',
				keywords: {
					en: ['Default IPTC keyword'],
				}
			},
		];

		this.languages = [
			{ code: 'en', label: 'English' },
			{ code: 'fr', label: 'French' },
			{ code: 'de', label: 'German' },
		];

	}

	addControl(formGroup: AbstractControl, control: string) {
	  if(!formGroup) {
	    return;
    }

    if(!formGroup.get(control)) {
      (<FormGroup> formGroup).addControl(control, new FormControl());
    }
  }

	initFormlyFields(lang: string) {
		this.initMultilangFields(lang);
		this.initSimpleFields();
	}

	initMultilangFields(lang: string) {
	  this.keywordsField = this.buildMultilangField('keywords', {
      type: 'selectize',
      templateOptions: {
        label: 'Keywords (multi)',
        placeholder: 'Keywords',
        selectizeClassName: 'selectize-sm',
        config: {
          maxItems: null,
          create: (input, callback) => {
            const option = {item: input};

            if (!this.keywordsOptions[ lang ]) {
              this.keywordsOptions[ lang ] = [];
            }

            this.keywordsOptions[ lang ].push(option);
            callback(option);
          },
          labelField: 'item',
          valueField: 'item',
          searchField: [ 'item' ],
          plugins: [ 'remove_button' ],
        },
        selectizeOptions: (lang) => this.keywordsOptions[lang],

        // options: this.keywordsOptions[ lang ],
        required: true,
      },
    },
    this.languages,
    this.model.keywords);


		// this.keywordsField = {
		// 	id: 'keywords',
		// 	key: `keywords.${lang}`,
		// 	type: 'selectize',
		// 	templateOptions: {
		// 		label: 'Keywords (multi)',
		// 		placeholder: 'Keywords',
		// 		selectizeClassName: 'selectize-sm',
		// 		config: {
		// 			maxItems: null,
		// 			create: (input, callback) => {
		// 				const option = { item: input };
		//
		// 				if(!this.keywordsOptions[lang]) {
		// 					this.keywordsOptions[lang] = [];
		// 				}
		//
		// 				this.keywordsOptions[lang].push(option);
		// 				callback(option);
		// 			},
		// 			labelField: 'item',
		// 			valueField: 'item',
		// 			searchField: ['item'],
		// 			plugins: [ 'remove_button' ],
		// 		},
		// 		value: this.model && this.model.keywords && this.model.keywords[lang],
		// 		options: this.keywordsOptions[lang],
		// 		required: true,
		// 	},
		// };

	}

  private buildMultilangField(key: string, baseField: FormlyFieldConfig, languages: any[], model?: any, options?): FormlyFieldConfig {

	  const field: FormlyFieldConfig = {
	    key: key,
      fieldGroup: [ ]
    };

	  //
	  // const baseFieldCopy = Object.assign({}, baseField);
	  // const baseTemplateOptions = Object.assign({}, baseField.templateOptions);

	  languages.forEach(lang => {
      const newField: FormlyFieldConfig = Object.assign(
        {},
        _.cloneDeep(baseField),
        {
          id: `${key}-${lang.code}`,
          key: lang.code,
          hideExpression: () => lang.code !== this.selectedLang,
        });


      newField.templateOptions.label = `${newField.templateOptions.label} ${lang.code}`;

      if(model) {
        newField.templateOptions.value = model[lang.code];
      }

      if(newField.templateOptions.selectizeOptions) {
        newField.templateOptions.options = newField.templateOptions.selectizeOptions(lang);
      }

      field.fieldGroup.push(newField);
    });

    return field;
  }

	initSimpleFields() {

	  this.titleField = this.buildMultilangField('title',
      {
        type: 'input',
        templateOptions: {
          label: 'Title (multi)',
          placeholder: 'Title',
          inputClassName: 'form-control-sm',
          required: true,
        },
      },
      this.languages,
      this.model.keywords);

    // this.titleField = {
    //   id: 'title',
    //   type: 'multilang-field',
    //   templateOptions: {
    //     multilangKey: 'title',
    //     languages: this.languages,
    //     selectedLang: this.selectedLang,
			// 	field: {
	   //      type: 'input',
	   //      templateOptions: {
	   //        label: 'Title (multi)',
	   //        placeholder: 'Title',
	   //        inputClassName: 'form-control-sm',
	   //        required: true,
	   //      },
	   //    },
    //     hideExpression: (lang) => { return lang !== this.selectedLang; },
    //   },
    //   fieldGroup: [],
    //   formControl: new FormGroup({}),
    // };

    this.noteField = {
      id: 'note',
      key: 'note',
      type: 'input',
			className: 'col',
      templateOptions: {
        label: 'Note',
        placeholder: 'Note',
        inputClassName: 'form-control-sm',
        required: true,
      },
      expressionProperties: { }
    };

    this.iptcField = {
			key: 'iptc',
			type: 'selectize',
			templateOptions: {
				label: 'IPTC',
				placeholder: 'IPTC',
				selectizeClassName: 'selectize-sm',
				config: {
          options: this.iptcData,
					valueField: 'id',
					labelField: 'label',
					searchField: 'label',
					maxItems: null,
					create: false,
					persist: false,
					plugins: [ 'remove_button' ],
					value: this.model && this.model.iptc,
					onItemAdd: (item) => {
						this.onChangeIPTC(item, (keywords, iptcKeywords, lang) => {
							// transform IPTC keywords to options and add them to the keywords options
							this.addKeywords(this.keywordsOptions, iptcKeywords, lang, this.keywordToOption);

							// Add IPTC keywords to the keywords model
							this.addKeywords(keywords, iptcKeywords, lang);

						});
					},
					onItemRemove: (value) => {
						this.onChangeIPTC(value, (keywords, iptcKeywords, lang) => {
							// Remove IPTC keywords to the keywords model
							this.removeKeywords(keywords, iptcKeywords, lang);
						});

					},
				},
				required: true,
			}
		};
	}

	/**
	 * Add or Remove keywords on IPTC change
	 * @param iptcID
	 * @param method
	 */
	private onChangeIPTC(
		iptcID: string,
		method: (target: any, origin: any, lang: string) => void
	): void {
		const iptcItem = this.iptcData[iptcID];
		const iptcKeywords = iptcItem.keywords || {};

		// Creating a new keywords object with the existing keywords

		// For each IPTC keywords lang
		for(let lang in iptcKeywords) {

			this.addControl(this.form.get('keywords'), lang);

			// Call add or remove method
			method(this.model.keywords, iptcKeywords, lang);

		}

    for(let lang in this.model.keywords) {
      this.addControl(this.form.get('keywords'), lang);
    }

    const keywords = Object.assign({}, this.model.keywords);

		// Creating form model with the existing model and the new keywords
		// this.form.get('keywords').setValue(this.model.keywords);
		this.form.patchValue({ keywords: keywords })

	}

	/**
	 * Add origin keywords to target
	 * @param target
	 * @param origin
	 * @param lang
	 * @param map
	 */
	private addKeywords(target: any, origin: any, lang: string, map?): void {
		if(!target || !origin || !lang) {
			return;
		}

		const keywords = map && typeof map === 'function' ? origin[lang].map(map) : origin[lang];

		if(!target[lang]) {
			target[lang] = [];
		}

		target[lang].push(..._.difference(keywords, target[lang]));
	}

	/**
	 * Remove origin keywords from target
	 * @param target
	 * @param origin
	 * @param lang
	 */
	private removeKeywords(target: any, origin: any, lang: string): void {
	  console.log('remove');
		if(!target || !origin || !lang) {
			return;
		}

		_.remove(target[lang], elem => origin[lang].indexOf(elem) != -1);
	}

	/**
	 * Transform a keyword in a keywordOption for selectize
	 * @param keyword
	 * @return {{item: string}}
	 */
	private keywordToOption(keyword: string): any {
		return { item: keyword };
	}

	getFields() {
		const fields = [
			// this.titleField,
			// {
			// 	fieldGroupClassName: 'row',
			// 	fieldGroup: [
			// this.noteField,
			// 	],
			// },

      // this.buildFieldGroup('test', [
			  this.iptcField,
        this.keywordsField
      // ]),
		];

    this.fields = fields;

	}

  buildFieldGroup(id: string, fields: FormlyFieldConfig[], options?: { fieldClassNames?: string[] }): FormlyFieldConfig {

    // Apply 'col' class or specified class
    fields.forEach((field, index) => {
      field.className = options && options.fieldClassNames
        ? options.fieldClassNames[index]
        : 'col';
    });

    const group = {
      id: id,
      fieldGroupClassName: 'row',
      fieldGroup: fields
    };

    return group;
  }

	onChangeLang(payload: NgbTabChangeEvent): void {
    this.selectedLang = payload.nextId;

    // const model = Object.assign(this.model, this.form.value);

		// this.initMultilangFields(this.selectedLang);
		this.getFields();

  }

  submit(model) {
	  console.group('submit');
    console.log('model', model);
    console.log('form value', this.form.value);
    console.log('form', this.form);
    console.groupEnd();
  }

}