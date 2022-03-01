import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class DialogData {
    public type: string;
}

@Component({
    selector: 'app-session-expired',
    templateUrl: './session-expired.component.html',
    styleUrls: ['./session-expired.component.css']
})
export class SessionExpiredComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<SessionExpiredComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit(): void {
    }

}
