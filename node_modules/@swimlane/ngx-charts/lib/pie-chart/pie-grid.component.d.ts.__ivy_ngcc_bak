import { TemplateRef, EventEmitter } from '@angular/core';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { DataItem, PieGridDataItem } from '../models/chart-data.model';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
import { ViewDimensions } from '../common/types/view-dimension.interface';
export interface PieGridData {
    data: PieGridDataItem;
    height: number;
    width: number;
    x: number;
    y: number;
}
export declare class PieGridComponent extends BaseChartComponent {
    designatedTotal: number;
    tooltipDisabled: boolean;
    tooltipText: (o: any) => any;
    label: string;
    minWidth: number;
    activeEntries: any[];
    activate: EventEmitter<any>;
    deactivate: EventEmitter<any>;
    dims: ViewDimensions;
    data: PieGridData[];
    transform: string;
    series: any[];
    domain: string[];
    colorScale: ColorHelper;
    margin: number[];
    placementTypes: typeof PlacementTypes;
    styleTypes: typeof StyleTypes;
    tooltipTemplate: TemplateRef<any>;
    update(): void;
    defaultTooltipText({ data }: {
        data: any;
    }): string;
    getDomain(): string[];
    getSeries(): any[];
    getTotal(): any;
    onClick(data: DataItem): void;
    setColors(): void;
    onActivate(item: any, fromLegend?: boolean): void;
    onDeactivate(item: any, fromLegend?: boolean): void;
}
