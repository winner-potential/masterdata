import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export class ReallyDeleteData {
  doIt : boolean;
  title : string;
  message : string;

  constructor(title?: string, message?: string) {
    this.title = title;
    this.message = message;
  }
}

@Component({
  selector: 'app-really-delete',
  templateUrl: './really-delete.component.html',
  styleUrls: ['./really-delete.component.css']
})
export class ReallyDeleteComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ReallyDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReallyDeleteData) {}

  ngOnInit() {
    this.data.doIt = false;
  }

  onOk() {
    this.data.doIt = true;
    this.dialogRef.close(this.data);
  }

  onAbort() {
    this.data.doIt = false;
    this.dialogRef.close(this.data);
  }

}
