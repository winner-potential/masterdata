import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ActionsService {

    public events: EventEmitter<String>;

    constructor() {
        this.events = new EventEmitter<String>();
    }
}
