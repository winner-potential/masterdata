import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute } from '@angular/router';

function djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
}

function hashStringToColor(str) {
    /* eslint no-bitwise: 0 */
    const hash = djb2(str);
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

@Component({
    selector: 'app-plotter',
    templateUrl: './plotter.component.html',
    styleUrls: ['./plotter.component.css']
})
export class PlotterComponent implements OnInit {
    public graph = {
        /* eslint-disable @typescript-eslint/naming-convention */
        data: [],
        layout: {margin: {t: 25}, xaxis: {nticks: 5}, paper_bgcolor: '#fafafa', plot_bgcolor: '#fafafa'}
    };
    public resultCount: number;
    public timeseries: Array<any> = [];
    private yaxis: object = {};
    private yaxisCount = 1;

    constructor(private active: ActivatedRoute, private api: ApiService) {}

    private _startDate: string;

    get startDate(): string {
        let v = this._startDate;
        if (!v) {
            const value = window.sessionStorage.getItem('plotter_startDate');
            if (value) {
                v = value;
            }
        }
        if (!v) {
            v = this.now(1000 * 60 * 60 * 24).toISOString();
        }
        return v;
    }

    set startDate(value: string) {
        this._startDate = new Date(value).toISOString();
        window.sessionStorage.setItem('plotter_startDate', this._startDate);
    }

    private _startHour: number;

    get startHour(): number {
        return this._startHour || parseFloat(window.sessionStorage.getItem('plotter_startHour')) ||
            this.now(1000 * 60 * 60 * 24).getHours();
    }

    set startHour(value: number) {
        this._startHour = value;
        window.sessionStorage.setItem('plotter_startHour', `${value}`);
    }

    private _startMinute: number;

    get startMinute(): number {
        return this._startMinute || parseFloat(window.sessionStorage.getItem('plotter_startMinute')) ||
            this.now(1000 * 60 * 60 * 24).getMinutes();
    }

    set startMinute(value: number) {
        this._startMinute = value;
        window.sessionStorage.setItem('plotter_startMinute', `${value}`);
    }

    private _endDate: string;

    get endDate(): string {
        let v = this._endDate;
        if (!v) {
            const value = window.sessionStorage.getItem('plotter_endDate');
            if (value) {
                v = value;
            }
        }
        if (!v) {
            v = this.now(0).toISOString();
        }
        return v;
    }

    set endDate(value: string) {
        this._endDate = new Date(value).toISOString();
        window.sessionStorage.setItem('plotter_endDate', this._endDate);
    }

    private _endHour: number;

    get endHour(): number {
        return this._endHour || parseFloat(window.sessionStorage.getItem('plotter_endHour')) || this.now(0).getHours();
    }

    set endHour(value: number) {
        this._endHour = value;
        window.sessionStorage.setItem('plotter_endHour', `${value}`);
    }

    private _endMinute: number;

    get endMinute(): number {
        return this._endMinute || parseFloat(window.sessionStorage.getItem('plotter_endMinute')) || this.now(0).getMinutes();
    }

    set endMinute(value: number) {
        this._endMinute = value;
        window.sessionStorage.setItem('plotter_endMinute', `${value}`);
    }

    get start(): Date {
        const d = new Date(this.startDate);
        d.setHours(this.startHour);
        d.setMinutes(this.startMinute);
        d.setSeconds(0);
        return d;
    }

    get end(): Date {
        const d = new Date(this.endDate);
        d.setHours(this.endHour);
        d.setMinutes(this.endMinute);
        d.setSeconds(0);
        return d;
    }

    now(n: number): Date {
        // There are multiple calls on getters, if values change between lifecycle steps, exception might be thrown!
        // Setting seconds and milliseconds to zero helps to reduce this error; however, buffering the value might be better :)
        const now = new Date(new Date().getTime() - n);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
    }

    loadSetting(name) {
        const res = window.sessionStorage.getItem(name);
        if (res) {
            return JSON.parse(res);
        }
        return [];
    }

    saveSetting(name, list) {
        window.sessionStorage.setItem(name, JSON.stringify(list));
    }

    clearYAxis() {
        let current = 'yaxis';
        let count = 1;
        while (this.graph.layout[current]) {
            this.graph.layout[current] = {};
            count++;
            current = 'yaxis' + count;
        }
        this.yaxis = {};
        this.yaxisCount = 1;
    }

    getOrCreateYAxis(name: string, alias: string, unit: string) {
        const id = name + '_' + unit;
        if (this.yaxis[id]) {
            return this.yaxis[id];
        }

        const shift = 0.07;
        const position = shift * (this.yaxisCount - 1);
        const current = 'yaxis' + (this.yaxisCount !== 1 ? this.yaxisCount : '');
        const short = 'y' + (this.yaxisCount !== 1 ? this.yaxisCount : '');

        this.yaxisCount++;

        this.graph.layout[current] = {
            title: (alias ? alias : name) + ' [' + unit + ']',
            position: position
            // side: side ? "right" : "left"
        };
        if (current !== 'yaxis') {
            this.graph.layout[current].overlaying = 'y';
        }
        this.yaxis[id] = short;
        (this.graph.layout.xaxis as any).domain = [position + 0.01, 1];
        return short;
    }

    ngOnInit() {
        this.active.params.subscribe(value => {
            setTimeout(_ => {
                const show = this.loadSetting('current');
                if (value.id) {
                    let found = false;
                    show.forEach(e => {
                        if (e.id === value.id) {
                            found = true;
                        }
                    });
                    if (!found) {
                        show.push({
                            id: value.id,
                            type: value.type
                        });
                    }
                    this.saveSetting('current', show);
                }
                this.draw();
            });
        });
    }

    remove(id: string) {
        const show = this.loadSetting('current');
        const replace = [];
        show.forEach(e => {
            if (e.id !== id) {
                replace.push(e);
            }
        });
        this.saveSetting('current', replace);
        this.draw();
    }

    swap() {
        const fooDate = this.startDate;
        const fooHour = this.startHour;
        const fooMinute = this.startMinute;
        this.startDate = this.endDate;
        this.startHour = this.endHour;
        this.startMinute = this.endMinute;
        this.endDate = fooDate;
        this.endHour = fooHour;
        this.endMinute = fooMinute;
    }

    rename() {
        const names = {};
        const map = {};
        this.timeseries.sort((a, b) => a.id < b.id ? -1 : 1);
        this.timeseries.forEach((v, k) => {
            names[v.name] = (names[v.name] || 0) + 1;
            map[v.id] = v;
        });
        const nrs = {};
        this.graph.data.forEach(v => {
            let add = '';
            if (names[v.original.name] > 1) {
                nrs[v.original.name] = (nrs[v.original.name] || 0) + 1;
                add = ' (' + nrs[v.original.name] + ')';
                map[v.original.id].count = nrs[v.original.name];
            } else {
                map[v.original.id].count = 0;
            }
            v.name = v.original.name + add + (v.original.unit ? ' [' + v.original.unit + ']' : '');
        });
        this.graph.data.sort((a, b) => a.name < b.name ? -1 : 1);
        this.timeseries.sort((a, b) => a.name + ':' + a.count < b.name + ':' + a.count ? -1 : 1);
    }

    draw() {
        this.resultCount = 0;
        this.graph.data.length = 0;
        this.timeseries.length = 0;
        this.clearYAxis();
        const show = this.loadSetting('current');
        show.forEach(e => {
            let req;
            if (e.type === 'source') {
                req = this.api.queryMetric(e.id, this.start.getTime(), this.end.getTime());
            } else {
                req = this.api.queryRelation(e.id, this.start.getTime(), this.end.getTime());
            }
            const timeseriesInformation = {
                id: e.id,
                name: 'Timeseries ' + e.id.substr(-5) + ' loading',
                loading: true,
                metric: {},
                color: hashStringToColor(e.id as string),
                type: e.source
            };
            this.timeseries.push(timeseriesInformation);

            req.subscribe((data: any) => {
                const information = data.metric || data.relation;
                const x = [];
                const y = [];
                (data.values as Array<Array<number>>).forEach(el => {
                    const d = new Date(el[0]);
                    const datestring =
                        ('0' + d.getDate()).slice(-2) +
                        '-' +
                        ('0' + (d.getMonth() + 1)).slice(-2) +
                        '-' +
                        d.getFullYear() +
                        ' ' +
                        ('0' + d.getHours()).slice(-2) +
                        ':' +
                        ('0' + d.getMinutes()).slice(-2) +
                        ':' +
                        ('0' + d.getSeconds()).slice(-2);

                    x.push(d);
                    y.push(el[1]);
                });
                const plot = {
                    x: x,
                    y: y,
                    original: {
                        id: e.id,
                        name: data.name,
                        unit: information.unit
                    },
                    type: 'scatter',
                    mode: 'lines+points',
                    yaxis: this.getOrCreateYAxis(information.name, information.alias, information.unit),
                    marker: {color: hashStringToColor(e.id as string)}
                };
                timeseriesInformation.name = data.name;
                timeseriesInformation.metric = information;
                timeseriesInformation.loading = false;
                this.graph.data.push(plot);
                this.rename();
                this.resultCount++;
            });
        });
    }
}
