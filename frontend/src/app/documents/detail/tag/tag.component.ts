import { Component, Input, OnInit } from '@angular/core';
import { Tag } from '../../../model/tag';

@Component({
    selector: 'document-metric-tag',
    templateUrl: './tag.component.html',
    styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit {
    @Input('tag-name') public name: String;
    @Input('tag-default-value') public defaultValue: String;
    @Input() private tag: Tag;

    constructor() {}

    get value(): String {
        return this.tag ? this.tag.value : '';
    }

    set value(val: String) {
        this.tag.value = val;
    }

    ngOnInit() {
    }
}
