/**
 * @ngdoc component
 * @name RenderedFormComponent
 *
 * @description
 * `<tcfrm-rendered-form>` is a component providing the ability to reneder a form using the third party angular6-json-form library.
 *
 * @usage
 *
 * This component is used by tc--liveapps-lib to render forms based on a JSON schema that is supplied by the liveapps API
 *
 * It is located into this dedicated library to make it easier to plug in an alternative form rendering library
 *
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {JsonSchemaFormComponent, MaterialDesignFrameworkModule} from 'angular6-json-schema-form';
import {ActivatedRoute} from '@angular/router';
import {CustomFormDefs} from '../../models/tc-custom-forms';

@Component({
  selector: 'tcfrm-rendered-form',
  templateUrl: './rendered-form.component.html',
  styleUrls: ['./rendered-form.component.css']
})
export class RenderedFormComponent implements OnInit, OnChanges {
  @Input() schema: any = {};
  @Input() layout: any[] = [];
  @Input() data: any = {};
  @Input() options: any[];
  @Input() formRef: string;
  @Input() caseRef: string;
  @Input() appId: string;
  @Input() formsFramework: string = this.formsFramework ? this.formsFramework : 'material-design';
  @Input() customFormDefs: CustomFormDefs;
  /**
   * ~event formSubmit : form submitted
   * ~payload any : data submitted from the form on submit (type=any)
   */
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();

  /**
   * ~event renderedLayout : Form Layout JSON
   * ~payload any : The layout of the rendered form
   */
  @Output() renderedLayout: EventEmitter<any> = new EventEmitter<any>();

  formSchema: any;
  formLayout: any[];
  formData: any = {};
  test: string;
  useCustomForm: boolean;

  submitForm = (data: any) => {
    console.warn('*** Forms: Submitting form with payload: ', data);
    console.warn('*** Forms: JSON: ', JSON.stringify(data));
    this.formSubmit.emit(data);
  }

  handleLayoutOutput = (layout: any) => {
    console.log('Layout:');
    console.log(JSON.stringify(layout));
    this.renderedLayout.emit(layout);
  }

  constructor(protected route: ActivatedRoute) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // handle input param changes
    if (this.customFormDefs && changes.formRef && changes.formRef.currentValue && (changes.formRef.currentValue !== changes.formRef.previousValue)) {
      // check if this is a custom form
      if (this.customFormDefs && this.customFormDefs.customForms) {
        this.useCustomForm = (this.customFormDefs.customForms.findIndex((form) => {
          return (form === changes.formRef.currentValue);
        }) !== -1);
      }
      console.warn('*** Forms: Custom Form configuration (customForm.json): ', this.customFormDefs);
      if (this.useCustomForm) {
        console.warn('*** Forms: > Using custom form (formRef):', this.formRef);
      } else {
        console.warn('*** Forms: > Using auto-rendered form (formRef):', this.formRef);
      }
    }
    if (changes.schema && changes.schema.currentValue && (changes.schema.currentValue !== changes.schema.previousValue)) {
      const tmpSchema = changes.schema.currentValue;
      // json-schema-form doesnt like the $schema and wont parse the schema if it is present. So remove it.
      if (changes.schema.currentValue.$schema) {
        delete tmpSchema.$schema;
      }
      this.formSchema = tmpSchema;
      console.warn('*** Forms: Form Schema: ', JSON.stringify(this.formSchema));
    }
    if (changes.data && (changes.data.currentValue !== changes.data.previousValue)) {
      this.formData = this.data;
      console.warn('*** Forms: Initial Form Data:', this.formData);
      console.warn('*** Forms: Initial Form Data (JSON):', JSON.stringify(this.formData));
    }
    if (changes.layout && (changes.layout.currentValue !== changes.layout.previousValue)) {
      this.formLayout = this.layout;
    }
  }

  onChanges = ($event) => {
    this.data = $event;
  }


}
