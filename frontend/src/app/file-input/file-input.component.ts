import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'masterdata-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.css']
})
export class FileInputComponent implements OnInit {

  @Input('value')
  public filename: String;

  @Input('placeholder')
  public placeholder : String;

  @Input('accept')
  public accept : String;

  @Output('changed') 
  public changedEvent = new EventEmitter<any>(); 

  constructor() { }

  ngOnInit() {
  }

  handleUpload(files: FileList) {
    var path = [];
    for(var k = 0; k < files.length; k ++) {
      path.push(files.item(k).name);
    }
    this.filename = path.join(', ');
    this.changedEvent.emit(files);
  }

}
