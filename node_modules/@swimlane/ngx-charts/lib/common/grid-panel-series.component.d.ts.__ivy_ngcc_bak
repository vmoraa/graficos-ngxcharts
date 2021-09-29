import { SimpleChanges, OnChanges } from '@angular/core';
import { BarOrientation } from './types/bar-orientation.enum';
import { ViewDimensions } from './types/view-dimension.interface';
interface GridPanel {
    class: ClassEnum;
    height: number;
    name: string;
    width: number;
    x: number;
    y: number;
}
declare enum ClassEnum {
    Odd = "odd",
    Even = "even"
}
export declare class GridPanelSeriesComponent implements OnChanges {
    gridPanels: GridPanel[];
    data: any[];
    dims: ViewDimensions;
    xScale: any;
    yScale: any;
    orient: BarOrientation;
    ngOnChanges(changes: SimpleChanges): void;
    update(): void;
    getGridPanels(): GridPanel[];
}
export {};
