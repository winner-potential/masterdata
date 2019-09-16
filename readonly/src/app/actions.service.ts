import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {

  public events: EventEmitter<String>;

  constructor() { 
    this.events = new EventEmitter<String>();
  }
}
