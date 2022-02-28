import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'masterdata-file-input',
    templateUrl: './file-input.component.html',
    styleUrls: ['./file-input.component.css']
})
export class FileInputComponent implements OnInit {

    @Input('value')
    public filename: String;

    @Input()
    public placeholder: String;

    @Input()
    public accept: String;

    @Output('changed')
    public changedEvent = new EventEmitter<any>();

    constructor() { }

    ngOnInit() {
    }

    handleUpload(files: FileList) {
        const path = [];
        for (let k = 0; k < files.length; k++) {
            path.push(files.item(k).name);
        }
        this.filename = path.join(', ');
        this.changedEvent.emit(files);
    }

}
