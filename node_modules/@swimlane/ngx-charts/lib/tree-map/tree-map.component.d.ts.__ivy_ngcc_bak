import { EventEmitter, TemplateRef } from '@angular/core';
import { BaseChartComponent } from '../common/base-chart.component';
import { ColorHelper } from '../common/color.helper';
import { DataItem } from '../models/chart-data.model';
import { ViewDimensions } from '../common/types/view-dimension.interface';
export declare class TreeMapComponent extends BaseChartComponent {
    results: DataItem[];
    tooltipDisabled: boolean;
    valueFormatting: any;
    labelFormatting: any;
    gradient: boolean;
    select: EventEmitter<any>;
    tooltipTemplate: TemplateRef<any>;
    dims: ViewDimensions;
    domain: any;
    transform: any;
    colors: ColorHelper;
    treemap: any;
    data: DataItem;
    margin: number[];
    update(): void;
    getDomain(): any[];
    onClick(data: DataItem): void;
    setColors(): void;
}
