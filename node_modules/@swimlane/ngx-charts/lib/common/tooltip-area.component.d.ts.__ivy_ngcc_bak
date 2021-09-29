import { EventEmitter, TemplateRef } from '@angular/core';
import { ColorHelper } from '../common/color.helper';
import { PlacementTypes } from './tooltip/position';
import { StyleTypes } from './tooltip/style.type';
import { ViewDimensions } from './types/view-dimension.interface';
export interface Tooltip {
    color: string;
    d0: number;
    d1: number;
    max: number;
    min: number;
    name: any;
    series: any;
    value: any;
}
export declare class TooltipArea {
    private platformId;
    anchorOpacity: number;
    anchorPos: number;
    anchorValues: Tooltip[];
    lastAnchorPos: number;
    placementTypes: typeof PlacementTypes;
    styleTypes: typeof StyleTypes;
    dims: ViewDimensions;
    xSet: any[];
    xScale: any;
    yScale: any;
    results: any[];
    colors: ColorHelper;
    showPercentage: boolean;
    tooltipDisabled: boolean;
    tooltipTemplate: TemplateRef<any>;
    hover: EventEmitter<{
        value: any;
    }>;
    tooltipAnchor: any;
    constructor(platformId: any);
    getValues(xVal: any): Tooltip[];
    mouseMove(event: any): void;
    findClosestPointIndex(xPos: number): number;
    showTooltip(): void;
    hideTooltip(): void;
    getToolTipText(tooltipItem: Tooltip): string;
}
