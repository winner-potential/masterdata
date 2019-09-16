import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export class DialogData {
  public type: string;
}

@Component({
  selector: 'app-session-expired',
  templateUrl: './session-expired.component.html',
  styleUrls: ['./session-expired.component.css']
})
export class SessionExpiredComponent implements OnInit {
  ngOnInit(): void {
  }

  constructor(public dialogRef: MatDialogRef<SessionExpiredComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}
