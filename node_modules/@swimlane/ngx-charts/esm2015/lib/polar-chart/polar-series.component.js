import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { lineRadial } from 'd3-shape';
import { id } from '../utils/id';
import { sortLinear, sortByTime, sortByDomain } from '../utils/sort';
import { escapeLabel } from '../common/label.helper';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { ScaleType } from '../common/types/scale-type.enum';
export class PolarSeriesComponent {
    constructor() {
        this.tooltipDisabled = false;
        this.gradient = false;
        this.animations = true;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.circleRadius = 3;
        this.barOrientation = BarOrientation;
        this.placementTypes = PlacementTypes;
        this.styleTypes = StyleTypes;
    }
    ngOnChanges(changes) {
        this.update();
    }
    update() {
        this.updateGradients();
        const line = this.getLineGenerator();
        const data = this.sortData(this.data.series);
        const seriesName = this.data.name;
        const linearScaleType = this.colors.scaleType === ScaleType.Linear;
        const min = this.yScale.domain()[0];
        this.seriesColor = this.colors.getColor(linearScaleType ? min : seriesName);
        this.path = line(data) || '';
        this.circles = data.map(d => {
            const a = this.getAngle(d);
            const r = this.getRadius(d);
            const value = d.value;
            const color = this.colors.getColor(linearScaleType ? Math.abs(value) : seriesName);
            const cData = Object.assign({}, d, {
                series: seriesName,
                value,
                name: d.name
            });
            return {
                data: cData,
                cx: r * Math.sin(a),
                cy: -r * Math.cos(a),
                value,
                color,
                label: d.name
            };
        });
        this.active = this.isActive(this.data);
        this.inactive = this.isInactive(this.data);
        this.tooltipText = this.tooltipText || (c => this.defaultTooltipText(c));
    }
    getAngle(d) {
        const label = d.name;
        if (this.scaleType === ScaleType.Time) {
            return this.xScale(label);
        }
        else if (this.scaleType === ScaleType.Linear) {
            return this.xScale(Number(label));
        }
        return this.xScale(label);
    }
    getRadius(d) {
        return this.yScale(d.value);
    }
    getLineGenerator() {
        return lineRadial()
            .angle(d => this.getAngle(d))
            .radius(d => this.getRadius(d))
            .curve(this.curve);
    }
    sortData(data) {
        if (this.scaleType === ScaleType.Linear) {
            return sortLinear(data, 'name');
        }
        else if (this.scaleType === ScaleType.Time) {
            return sortByTime(data, 'name');
        }
        return sortByDomain(data, 'name', 'asc', this.xScale.domain());
    }
    isActive(entry) {
        if (!this.activeEntries)
            return false;
        const item = this.activeEntries.find(d => {
            return entry.name === d.name;
        });
        return item !== undefined;
    }
    isInactive(entry) {
        if (!this.activeEntries || this.activeEntries.length === 0)
            return false;
        const item = this.activeEntries.find(d => {
            return entry.name === d.name;
        });
        return item === undefined;
    }
    defaultTooltipText({ label, value }) {
        return `
      <span class="tooltip-label">${escapeLabel(this.data.name)} • ${escapeLabel(label)}</span>
      <span class="tooltip-val">${value.toLocaleString()}</span>
    `;
    }
    updateGradients() {
        this.hasGradient = this.gradient || this.colors.scaleType === ScaleType.Linear;
        if (!this.hasGradient) {
            return;
        }
        this.gradientId = 'grad' + id().toString();
        this.gradientUrl = `url(#${this.gradientId})`;
        if (this.colors.scaleType === ScaleType.Linear) {
            const values = this.data.series.map(d => d.value);
            const max = Math.max(...values);
            const min = Math.min(...values);
            this.gradientStops = this.colors.getLinearGradientStops(max, min);
        }
        else {
            this.gradientStops = undefined;
        }
    }
}
PolarSeriesComponent.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-polar-series]',
                template: `
    <svg:g class="polar-charts-series">
      <defs>
        <svg:g
          ngx-charts-svg-radial-gradient
          *ngIf="hasGradient"
          [color]="seriesColor"
          [name]="gradientId"
          [startOpacity]="0.25"
          [endOpacity]="1"
          [stops]="gradientStops"
        />
      </defs>
      <svg:g
        ngx-charts-line
        class="polar-series-path"
        [path]="path"
        [stroke]="hasGradient ? gradientUrl : seriesColor"
        [class.active]="active"
        [class.inactive]="inactive"
        [attr.fill-opacity]="rangeFillOpacity"
        [fill]="hasGradient ? gradientUrl : seriesColor"
        [animations]="animations"
      />
      <svg:g
        ngx-charts-circle
        *ngFor="let circle of circles"
        class="circle"
        [cx]="circle.cx"
        [cy]="circle.cy"
        [r]="circleRadius"
        [fill]="circle.color"
        [style.opacity]="inactive ? 0.2 : 1"
        ngx-tooltip
        [tooltipDisabled]="tooltipDisabled"
        [tooltipPlacement]="placementTypes.Top"
        [tooltipType]="styleTypes.tooltip"
        [tooltipTitle]="tooltipTemplate ? undefined : tooltipText(circle)"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipContext]="circle.data"
        (select)="select.emit(circle.data)"
        (activate)="activate.emit({ name: circle.data.series })"
        (deactivate)="deactivate.emit({ name: circle.data.series })"
      ></svg:g>
    </svg:g>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
PolarSeriesComponent.propDecorators = {
    name: [{ type: Input }],
    data: [{ type: Input }],
    xScale: [{ type: Input }],
    yScale: [{ type: Input }],
    colors: [{ type: Input }],
    scaleType: [{ type: Input }],
    curve: [{ type: Input }],
    activeEntries: [{ type: Input }],
    rangeFillOpacity: [{ type: Input }],
    tooltipDisabled: [{ type: Input }],
    tooltipText: [{ type: Input }],
    gradient: [{ type: Input }],
    tooltipTemplate: [{ type: Input }],
    animations: [{ type: Input }],
    select: [{ type: Output }],
    activate: [{ type: Output }],
    deactivate: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sYXItc2VyaWVzLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1jaGFydHMvc3JjL2xpYi9wb2xhci1jaGFydC9wb2xhci1zZXJpZXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUdMLHVCQUF1QixFQUV2QixNQUFNLEVBQ04sWUFBWSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNqQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRXJELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQTZENUQsTUFBTSxPQUFPLG9CQUFvQjtJQWxEakM7UUE0RFcsb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFFakMsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUUxQixlQUFVLEdBQVksSUFBSSxDQUFDO1FBRTFCLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzVCLGFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzlCLGVBQVUsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBSTFDLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBYXpCLG1CQUFjLEdBQUcsY0FB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QyxVQUFVLEdBQUcsQ0FBQztRQUU5QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUNoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNuRTthQUFNO1lBQ0wsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7U0FDaEM7SUFDSCxDQUFDOzs7WUE5TUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSw0QkFBNEI7Z0JBQ3RDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkNUO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2FBQ2hEOzs7bUJBRUUsS0FBSzttQkFDTCxLQUFLO3FCQUNMLEtBQUs7cUJBQ0wsS0FBSztxQkFDTCxLQUFLO3dCQUNMLEtBQUs7b0JBQ0wsS0FBSzs0QkFDTCxLQUFLOytCQUNMLEtBQUs7OEJBQ0wsS0FBSzswQkFDTCxLQUFLO3VCQUNMLEtBQUs7OEJBQ0wsS0FBSzt5QkFDTCxLQUFLO3FCQUVMLE1BQU07dUJBQ04sTUFBTTt5QkFDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVGVtcGxhdGVSZWYsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgbGluZVJhZGlhbCB9IGZyb20gJ2QzLXNoYXBlJztcblxuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi91dGlscy9pZCc7XG5pbXBvcnQgeyBzb3J0TGluZWFyLCBzb3J0QnlUaW1lLCBzb3J0QnlEb21haW4gfSBmcm9tICcuLi91dGlscy9zb3J0JztcbmltcG9ydCB7IGVzY2FwZUxhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2xhYmVsLmhlbHBlcic7XG5pbXBvcnQgeyBTZXJpZXMsIERhdGFJdGVtIH0gZnJvbSAnLi4vbW9kZWxzL2NoYXJ0LWRhdGEubW9kZWwnO1xuaW1wb3J0IHsgUGxhY2VtZW50VHlwZXMgfSBmcm9tICcuLi9jb21tb24vdG9vbHRpcC9wb3NpdGlvbic7XG5pbXBvcnQgeyBTdHlsZVR5cGVzIH0gZnJvbSAnLi4vY29tbW9uL3Rvb2x0aXAvc3R5bGUudHlwZSc7XG5pbXBvcnQgeyBCYXJPcmllbnRhdGlvbiB9IGZyb20gJy4uL2NvbW1vbi90eXBlcy9iYXItb3JpZW50YXRpb24uZW51bSc7XG5pbXBvcnQgeyBTY2FsZVR5cGUgfSBmcm9tICcuLi9jb21tb24vdHlwZXMvc2NhbGUtdHlwZS5lbnVtJztcblxuaW50ZXJmYWNlIFBvbGFyQ2hhcnRDaXJjbGUge1xuICBjb2xvcjogc3RyaW5nO1xuICBjeDogbnVtYmVyO1xuICBjeTogbnVtYmVyO1xuICBkYXRhOiBTZXJpZXM7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dbbmd4LWNoYXJ0cy1wb2xhci1zZXJpZXNdJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c3ZnOmcgY2xhc3M9XCJwb2xhci1jaGFydHMtc2VyaWVzXCI+XG4gICAgICA8ZGVmcz5cbiAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgbmd4LWNoYXJ0cy1zdmctcmFkaWFsLWdyYWRpZW50XG4gICAgICAgICAgKm5nSWY9XCJoYXNHcmFkaWVudFwiXG4gICAgICAgICAgW2NvbG9yXT1cInNlcmllc0NvbG9yXCJcbiAgICAgICAgICBbbmFtZV09XCJncmFkaWVudElkXCJcbiAgICAgICAgICBbc3RhcnRPcGFjaXR5XT1cIjAuMjVcIlxuICAgICAgICAgIFtlbmRPcGFjaXR5XT1cIjFcIlxuICAgICAgICAgIFtzdG9wc109XCJncmFkaWVudFN0b3BzXCJcbiAgICAgICAgLz5cbiAgICAgIDwvZGVmcz5cbiAgICAgIDxzdmc6Z1xuICAgICAgICBuZ3gtY2hhcnRzLWxpbmVcbiAgICAgICAgY2xhc3M9XCJwb2xhci1zZXJpZXMtcGF0aFwiXG4gICAgICAgIFtwYXRoXT1cInBhdGhcIlxuICAgICAgICBbc3Ryb2tlXT1cImhhc0dyYWRpZW50ID8gZ3JhZGllbnRVcmwgOiBzZXJpZXNDb2xvclwiXG4gICAgICAgIFtjbGFzcy5hY3RpdmVdPVwiYWN0aXZlXCJcbiAgICAgICAgW2NsYXNzLmluYWN0aXZlXT1cImluYWN0aXZlXCJcbiAgICAgICAgW2F0dHIuZmlsbC1vcGFjaXR5XT1cInJhbmdlRmlsbE9wYWNpdHlcIlxuICAgICAgICBbZmlsbF09XCJoYXNHcmFkaWVudCA/IGdyYWRpZW50VXJsIDogc2VyaWVzQ29sb3JcIlxuICAgICAgICBbYW5pbWF0aW9uc109XCJhbmltYXRpb25zXCJcbiAgICAgIC8+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgbmd4LWNoYXJ0cy1jaXJjbGVcbiAgICAgICAgKm5nRm9yPVwibGV0IGNpcmNsZSBvZiBjaXJjbGVzXCJcbiAgICAgICAgY2xhc3M9XCJjaXJjbGVcIlxuICAgICAgICBbY3hdPVwiY2lyY2xlLmN4XCJcbiAgICAgICAgW2N5XT1cImNpcmNsZS5jeVwiXG4gICAgICAgIFtyXT1cImNpcmNsZVJhZGl1c1wiXG4gICAgICAgIFtmaWxsXT1cImNpcmNsZS5jb2xvclwiXG4gICAgICAgIFtzdHlsZS5vcGFjaXR5XT1cImluYWN0aXZlID8gMC4yIDogMVwiXG4gICAgICAgIG5neC10b29sdGlwXG4gICAgICAgIFt0b29sdGlwRGlzYWJsZWRdPVwidG9vbHRpcERpc2FibGVkXCJcbiAgICAgICAgW3Rvb2x0aXBQbGFjZW1lbnRdPVwicGxhY2VtZW50VHlwZXMuVG9wXCJcbiAgICAgICAgW3Rvb2x0aXBUeXBlXT1cInN0eWxlVHlwZXMudG9vbHRpcFwiXG4gICAgICAgIFt0b29sdGlwVGl0bGVdPVwidG9vbHRpcFRlbXBsYXRlID8gdW5kZWZpbmVkIDogdG9vbHRpcFRleHQoY2lyY2xlKVwiXG4gICAgICAgIFt0b29sdGlwVGVtcGxhdGVdPVwidG9vbHRpcFRlbXBsYXRlXCJcbiAgICAgICAgW3Rvb2x0aXBDb250ZXh0XT1cImNpcmNsZS5kYXRhXCJcbiAgICAgICAgKHNlbGVjdCk9XCJzZWxlY3QuZW1pdChjaXJjbGUuZGF0YSlcIlxuICAgICAgICAoYWN0aXZhdGUpPVwiYWN0aXZhdGUuZW1pdCh7IG5hbWU6IGNpcmNsZS5kYXRhLnNlcmllcyB9KVwiXG4gICAgICAgIChkZWFjdGl2YXRlKT1cImRlYWN0aXZhdGUuZW1pdCh7IG5hbWU6IGNpcmNsZS5kYXRhLnNlcmllcyB9KVwiXG4gICAgICA+PC9zdmc6Zz5cbiAgICA8L3N2ZzpnPlxuICBgLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBQb2xhclNlcmllc0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIG5hbWU7XG4gIEBJbnB1dCgpIGRhdGE7XG4gIEBJbnB1dCgpIHhTY2FsZTsgLy8gVGhldGFcbiAgQElucHV0KCkgeVNjYWxlOyAvLyBSXG4gIEBJbnB1dCgpIGNvbG9ycztcbiAgQElucHV0KCkgc2NhbGVUeXBlO1xuICBASW5wdXQoKSBjdXJ2ZTogYW55O1xuICBASW5wdXQoKSBhY3RpdmVFbnRyaWVzOiBhbnlbXTtcbiAgQElucHV0KCkgcmFuZ2VGaWxsT3BhY2l0eTogbnVtYmVyO1xuICBASW5wdXQoKSB0b29sdGlwRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgdG9vbHRpcFRleHQ6IChvOiBhbnkpID0+IHN0cmluZztcbiAgQElucHV0KCkgZ3JhZGllbnQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgdG9vbHRpcFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBASW5wdXQoKSBhbmltYXRpb25zOiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCkgc2VsZWN0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgYWN0aXZhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIHBhdGg6IHN0cmluZztcbiAgY2lyY2xlczogUG9sYXJDaGFydENpcmNsZVtdO1xuICBjaXJjbGVSYWRpdXM6IG51bWJlciA9IDM7XG5cbiAgYXJlYVBhdGg6IHN0cmluZztcbiAgZ3JhZGllbnRJZDogc3RyaW5nO1xuICBncmFkaWVudFVybDogc3RyaW5nO1xuICBoYXNHcmFkaWVudDogYm9vbGVhbjtcbiAgZ3JhZGllbnRTdG9wczogYW55W107XG4gIGFyZWFHcmFkaWVudFN0b3BzOiBhbnlbXTtcbiAgc2VyaWVzQ29sb3I6IHN0cmluZztcblxuICBhY3RpdmU6IGJvb2xlYW47XG4gIGluYWN0aXZlOiBib29sZWFuO1xuXG4gIGJhck9yaWVudGF0aW9uID0gQmFyT3JpZW50YXRpb247XG4gIHBsYWNlbWVudFR5cGVzID0gUGxhY2VtZW50VHlwZXM7XG4gIHN0eWxlVHlwZXMgPSBTdHlsZVR5cGVzO1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlR3JhZGllbnRzKCk7XG5cbiAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRMaW5lR2VuZXJhdG9yKCk7XG5cbiAgICBjb25zdCBkYXRhID0gdGhpcy5zb3J0RGF0YSh0aGlzLmRhdGEuc2VyaWVzKTtcblxuICAgIGNvbnN0IHNlcmllc05hbWUgPSB0aGlzLmRhdGEubmFtZTtcbiAgICBjb25zdCBsaW5lYXJTY2FsZVR5cGUgPSB0aGlzLmNvbG9ycy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5MaW5lYXI7XG4gICAgY29uc3QgbWluID0gdGhpcy55U2NhbGUuZG9tYWluKClbMF07XG4gICAgdGhpcy5zZXJpZXNDb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKGxpbmVhclNjYWxlVHlwZSA/IG1pbiA6IHNlcmllc05hbWUpO1xuXG4gICAgdGhpcy5wYXRoID0gbGluZShkYXRhKSB8fCAnJztcblxuICAgIHRoaXMuY2lyY2xlcyA9IGRhdGEubWFwKGQgPT4ge1xuICAgICAgY29uc3QgYSA9IHRoaXMuZ2V0QW5nbGUoZCk7XG4gICAgICBjb25zdCByID0gdGhpcy5nZXRSYWRpdXMoZCk7XG4gICAgICBjb25zdCB2YWx1ZSA9IGQudmFsdWU7XG5cbiAgICAgIGNvbnN0IGNvbG9yID0gdGhpcy5jb2xvcnMuZ2V0Q29sb3IobGluZWFyU2NhbGVUeXBlID8gTWF0aC5hYnModmFsdWUpIDogc2VyaWVzTmFtZSk7XG5cbiAgICAgIGNvbnN0IGNEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZCwge1xuICAgICAgICBzZXJpZXM6IHNlcmllc05hbWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBuYW1lOiBkLm5hbWVcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBjRGF0YSxcbiAgICAgICAgY3g6IHIgKiBNYXRoLnNpbihhKSxcbiAgICAgICAgY3k6IC1yICogTWF0aC5jb3MoYSksXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBjb2xvcixcbiAgICAgICAgbGFiZWw6IGQubmFtZVxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWN0aXZlID0gdGhpcy5pc0FjdGl2ZSh0aGlzLmRhdGEpO1xuICAgIHRoaXMuaW5hY3RpdmUgPSB0aGlzLmlzSW5hY3RpdmUodGhpcy5kYXRhKTtcbiAgICB0aGlzLnRvb2x0aXBUZXh0ID0gdGhpcy50b29sdGlwVGV4dCB8fCAoYyA9PiB0aGlzLmRlZmF1bHRUb29sdGlwVGV4dChjKSk7XG4gIH1cblxuICBnZXRBbmdsZShkOiBEYXRhSXRlbSkge1xuICAgIGNvbnN0IGxhYmVsID0gZC5uYW1lO1xuICAgIGlmICh0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLlRpbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnhTY2FsZShsYWJlbCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLkxpbmVhcikge1xuICAgICAgcmV0dXJuIHRoaXMueFNjYWxlKE51bWJlcihsYWJlbCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy54U2NhbGUobGFiZWwpO1xuICB9XG5cbiAgZ2V0UmFkaXVzKGQ6IERhdGFJdGVtKSB7XG4gICAgcmV0dXJuIHRoaXMueVNjYWxlKGQudmFsdWUpO1xuICB9XG5cbiAgZ2V0TGluZUdlbmVyYXRvcigpOiBhbnkge1xuICAgIHJldHVybiBsaW5lUmFkaWFsPGFueT4oKVxuICAgICAgLmFuZ2xlKGQgPT4gdGhpcy5nZXRBbmdsZShkKSlcbiAgICAgIC5yYWRpdXMoZCA9PiB0aGlzLmdldFJhZGl1cyhkKSlcbiAgICAgIC5jdXJ2ZSh0aGlzLmN1cnZlKTtcbiAgfVxuXG4gIHNvcnREYXRhKGRhdGE6IERhdGFJdGVtKSB7XG4gICAgaWYgKHRoaXMuc2NhbGVUeXBlID09PSBTY2FsZVR5cGUuTGluZWFyKSB7XG4gICAgICByZXR1cm4gc29ydExpbmVhcihkYXRhLCAnbmFtZScpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5UaW1lKSB7XG4gICAgICByZXR1cm4gc29ydEJ5VGltZShkYXRhLCAnbmFtZScpO1xuICAgIH1cbiAgICByZXR1cm4gc29ydEJ5RG9tYWluKGRhdGEsICduYW1lJywgJ2FzYycsIHRoaXMueFNjYWxlLmRvbWFpbigpKTtcbiAgfVxuXG4gIGlzQWN0aXZlKGVudHJ5OiBEYXRhSXRlbSk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5hY3RpdmVFbnRyaWVzKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuYWN0aXZlRW50cmllcy5maW5kKGQgPT4ge1xuICAgICAgcmV0dXJuIGVudHJ5Lm5hbWUgPT09IGQubmFtZTtcbiAgICB9KTtcbiAgICByZXR1cm4gaXRlbSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaXNJbmFjdGl2ZShlbnRyeTogRGF0YUl0ZW0pOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlRW50cmllcyB8fCB0aGlzLmFjdGl2ZUVudHJpZXMubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuYWN0aXZlRW50cmllcy5maW5kKGQgPT4ge1xuICAgICAgcmV0dXJuIGVudHJ5Lm5hbWUgPT09IGQubmFtZTtcbiAgICB9KTtcbiAgICByZXR1cm4gaXRlbSA9PT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZGVmYXVsdFRvb2x0aXBUZXh0KHsgbGFiZWwsIHZhbHVlIH06IHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sdGlwLWxhYmVsXCI+JHtlc2NhcGVMYWJlbCh0aGlzLmRhdGEubmFtZSl9IOKAoiAke2VzY2FwZUxhYmVsKGxhYmVsKX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cInRvb2x0aXAtdmFsXCI+JHt2YWx1ZS50b0xvY2FsZVN0cmluZygpfTwvc3Bhbj5cbiAgICBgO1xuICB9XG5cbiAgdXBkYXRlR3JhZGllbnRzKCkge1xuICAgIHRoaXMuaGFzR3JhZGllbnQgPSB0aGlzLmdyYWRpZW50IHx8IHRoaXMuY29sb3JzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLkxpbmVhcjtcblxuICAgIGlmICghdGhpcy5oYXNHcmFkaWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZ3JhZGllbnRJZCA9ICdncmFkJyArIGlkKCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLmdyYWRpZW50VXJsID0gYHVybCgjJHt0aGlzLmdyYWRpZW50SWR9KWA7XG5cbiAgICBpZiAodGhpcy5jb2xvcnMuc2NhbGVUeXBlID09PSBTY2FsZVR5cGUuTGluZWFyKSB7XG4gICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmRhdGEuc2VyaWVzLm1hcChkID0+IGQudmFsdWUpO1xuICAgICAgY29uc3QgbWF4ID0gTWF0aC5tYXgoLi4udmFsdWVzKTtcbiAgICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKC4uLnZhbHVlcyk7XG4gICAgICB0aGlzLmdyYWRpZW50U3RvcHMgPSB0aGlzLmNvbG9ycy5nZXRMaW5lYXJHcmFkaWVudFN0b3BzKG1heCwgbWluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ncmFkaWVudFN0b3BzID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuIl19