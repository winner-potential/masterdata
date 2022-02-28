import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { CacheService } from './cache.service';

import { Observable, Subscriber } from 'rxjs';

const TTL = 60;

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
    private running: Map<string, Array<Subscriber<HttpEvent<any>>>> = new Map<string, Array<Subscriber<HttpEvent<any>>>>();

    constructor(private cache: CacheService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRequestCachable(req)) {
            return next.handle(req);
        }
        return this.sendRequest(req, next);
    }

    sendRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return new Observable(observer => {
            const cachedResponse = this.cache.get(req.url);
            if (cachedResponse) {
                observer.next(cachedResponse);
            } else if (this.running.has(req.url)) {
                this.running.get(req.url).push(observer);
            } else {
                this.running.set(req.url, [observer]);
                next.handle(req).subscribe((ev: HttpEvent<any>) => {
                    if (ev instanceof HttpResponse) {
                        this.cache.set(req.url, ev, TTL);
                        (this.running.get(req.url) || []).forEach(subs => {
                            subs.next(ev);
                        });
                        this.running.delete(req.url);
                    }
                });
            }
        });
    }

    isRequestCachable(req: HttpRequest<any>) {
        return req.method === 'GET';
    }
}
