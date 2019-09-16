import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AttributeDefinition } from "../../../../model/attribute-definition";

@Component({
  selector: "document-attribute-type",
  templateUrl: "./attribute.component.html",
  styleUrls: ["./attribute.component.css"]
})
export class AttributeComponent implements OnInit {
  @Input('attribute') 
  public _content: AttributeDefinition;
  public types: Array<String> = ['Boolean', 'Integer', 'Image', 'Link', 'Number', 'Separator', 'String'];

  @Output('action') 
  public actionEvent = new EventEmitter<any>(); 

  @Output('change') 
  public changeEvent = new EventEmitter<any>(); 

  @Input('icon') 
  public icon: String; 

  @Input('needed') 
  public needed: Boolean;

  constructor() {}

  ngOnInit() {}

  get content() {
    return this._content;
  }
  
  get should():Boolean {
    return this._content ? this._content.should : false;
  }

  set should(val:Boolean) {
    this._content.should = val;
    this.changeEvent.emit(this._content);
  }
  
  get name() {
    return this._content ? this._content.name : "";
  }

  set name(val) {
    this._content.name = val;
    this.changeEvent.emit(this._content);
  }
  
  get type() {
    return this._content ? this._content.type : "";
  }

  set type(val) {
    this._content.type = val;
    this.changeEvent.emit(this._content);
  }

  triggerAction() {
    this.actionEvent.emit(this._content);
  }
}
