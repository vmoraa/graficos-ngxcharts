import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { max } from 'd3-array';
import { arc, pie } from 'd3-shape';
import { formatLabel, escapeLabel } from '../common/label.helper';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
export class PieSeriesComponent {
    constructor() {
        this.series = [];
        this.innerRadius = 60;
        this.outerRadius = 80;
        this.trimLabels = true;
        this.maxLabelLength = 10;
        this.tooltipDisabled = false;
        this.animations = true;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.dblclick = new EventEmitter();
        this.placementTypes = PlacementTypes;
        this.styleTypes = StyleTypes;
    }
    ngOnChanges(changes) {
        this.update();
    }
    update() {
        const pieGenerator = pie()
            .value(d => d.value)
            .sort(null);
        const arcData = pieGenerator(this.series);
        this.max = max(arcData, d => {
            return d.value;
        });
        this.data = this.calculateLabelPositions(arcData);
        this.tooltipText = this.tooltipText || this.defaultTooltipText;
    }
    midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
    outerArc() {
        const factor = 1.5;
        return arc()
            .innerRadius(this.outerRadius * factor)
            .outerRadius(this.outerRadius * factor);
    }
    calculateLabelPositions(pieData) {
        const factor = 1.5;
        const minDistance = 10;
        const labelPositions = pieData;
        labelPositions.forEach(d => {
            d.pos = this.outerArc().centroid(d);
            d.pos[0] = factor * this.outerRadius * (this.midAngle(d) < Math.PI ? 1 : -1);
        });
        for (let i = 0; i < labelPositions.length - 1; i++) {
            const a = labelPositions[i];
            if (!this.labelVisible(a)) {
                continue;
            }
            for (let j = i + 1; j < labelPositions.length; j++) {
                const b = labelPositions[j];
                if (!this.labelVisible(b)) {
                    continue;
                }
                // if they're on the same side
                if (b.pos[0] * a.pos[0] > 0) {
                    // if they're overlapping
                    const o = minDistance - Math.abs(b.pos[1] - a.pos[1]);
                    if (o > 0) {
                        // push the second up or down
                        b.pos[1] += Math.sign(b.pos[0]) * o;
                    }
                }
            }
        }
        return labelPositions;
    }
    labelVisible(myArc) {
        return this.showLabels && myArc.endAngle - myArc.startAngle > Math.PI / 30;
    }
    getTooltipTitle(a) {
        return this.tooltipTemplate ? undefined : this.tooltipText(a);
    }
    labelText(myArc) {
        if (this.labelFormatting) {
            return this.labelFormatting(myArc.data.name);
        }
        return this.label(myArc);
    }
    label(myArc) {
        return formatLabel(myArc.data.name);
    }
    defaultTooltipText(myArc) {
        const label = this.label(myArc);
        const val = formatLabel(myArc.data.value);
        return `
      <span class="tooltip-label">${escapeLabel(label)}</span>
      <span class="tooltip-val">${val}</span>
    `;
    }
    color(myArc) {
        return this.colors.getColor(this.label(myArc));
    }
    trackBy(index, item) {
        return item.data.name;
    }
    onClick(data) {
        this.select.emit(data);
    }
    isActive(entry) {
        if (!this.activeEntries)
            return false;
        const item = this.activeEntries.find(d => {
            return entry.name === d.name && entry.series === d.series;
        });
        return item !== undefined;
    }
}
PieSeriesComponent.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-pie-series]',
                template: `
    <svg:g *ngFor="let arc of data; trackBy: trackBy">
      <svg:g
        ngx-charts-pie-label
        *ngIf="labelVisible(arc)"
        [data]="arc"
        [radius]="outerRadius"
        [color]="color(arc)"
        [label]="labelText(arc)"
        [labelTrim]="trimLabels"
        [labelTrimSize]="maxLabelLength"
        [max]="max"
        [value]="arc.value"
        [explodeSlices]="explodeSlices"
        [animations]="animations"
      ></svg:g>
      <svg:g
        ngx-charts-pie-arc
        [startAngle]="arc.startAngle"
        [endAngle]="arc.endAngle"
        [innerRadius]="innerRadius"
        [outerRadius]="outerRadius"
        [fill]="color(arc)"
        [value]="arc.data.value"
        [gradient]="gradient"
        [data]="arc.data"
        [max]="max"
        [explodeSlices]="explodeSlices"
        [isActive]="isActive(arc.data)"
        [animate]="animations"
        (select)="onClick($event)"
        (activate)="activate.emit($event)"
        (deactivate)="deactivate.emit($event)"
        (dblclick)="dblclick.emit($event)"
        ngx-tooltip
        [tooltipDisabled]="tooltipDisabled"
        [tooltipPlacement]="placementTypes.Top"
        [tooltipType]="styleTypes.tooltip"
        [tooltipTitle]="getTooltipTitle(arc)"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipContext]="arc.data"
      ></svg:g>
    </svg:g>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
PieSeriesComponent.propDecorators = {
    colors: [{ type: Input }],
    series: [{ type: Input }],
    dims: [{ type: Input }],
    innerRadius: [{ type: Input }],
    outerRadius: [{ type: Input }],
    explodeSlices: [{ type: Input }],
    showLabels: [{ type: Input }],
    gradient: [{ type: Input }],
    activeEntries: [{ type: Input }],
    labelFormatting: [{ type: Input }],
    trimLabels: [{ type: Input }],
    maxLabelLength: [{ type: Input }],
    tooltipText: [{ type: Input }],
    tooltipDisabled: [{ type: Input }],
    tooltipTemplate: [{ type: Input }],
    animations: [{ type: Input }],
    select: [{ type: Output }],
    activate: [{ type: Output }],
    deactivate: [{ type: Output }],
    dblclick: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGllLXNlcmllcy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtY2hhcnRzL3NyYy9saWIvcGllLWNoYXJ0L3BpZS1zZXJpZXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBRVQsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBRVosdUJBQXVCLEVBRXhCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDL0IsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHcEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUdsRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBbUQxRCxNQUFNLE9BQU8sa0JBQWtCO0lBaEQvQjtRQWtEVyxXQUFNLEdBQWUsRUFBRSxDQUFDO1FBRXhCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBQ3pCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBTXpCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFDM0IsbUJBQWMsR0FBVyxFQUFFLENBQUM7UUFFNUIsb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFFakMsZUFBVSxHQUFZLElBQUksQ0FBQztRQUUxQixXQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM1QixhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM5QixlQUFVLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNoQyxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUt4QyxtQkFBYyxHQUFHLGNBQWMsQ0FBQztRQUNoQyxlQUFV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QkFDTCxLQUFLOzBCQUNMLEtBQUs7NEJBQ0wsS0FBSzt5QkFDTCxLQUFLO3VCQUNMLEtBQUs7NEJBQ0wsS0FBSzs4QkFDTCxLQUFLO3lCQUNMLEtBQUs7NkJBQ0wsS0FBSzswQkFDTCxLQUFLOzhCQUNMLEtBQUs7OEJBQ0wsS0FBSzt5QkFDTCxLQUFLO3FCQUVMLE1BQU07dUJBQ04sTUFBTTt5QkFDTixNQUFNO3VCQUNOLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25DaGFuZ2VzLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVGVtcGxhdGVSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBtYXggfSBmcm9tICdkMy1hcnJheSc7XG5pbXBvcnQgeyBhcmMsIHBpZSB9IGZyb20gJ2QzLXNoYXBlJztcbmltcG9ydCB7IENvbG9ySGVscGVyIH0gZnJvbSAnLi4vY29tbW9uL2NvbG9yLmhlbHBlcic7XG5cbmltcG9ydCB7IGZvcm1hdExhYmVsLCBlc2NhcGVMYWJlbCB9IGZyb20gJy4uL2NvbW1vbi9sYWJlbC5oZWxwZXInO1xuaW1wb3J0IHsgRGF0YUl0ZW0gfSBmcm9tICcuLi9tb2RlbHMvY2hhcnQtZGF0YS5tb2RlbCc7XG5pbXBvcnQgeyBQaWVEYXRhIH0gZnJvbSAnLi9waWUtbGFiZWwuY29tcG9uZW50JztcbmltcG9ydCB7IFBsYWNlbWVudFR5cGVzIH0gZnJvbSAnLi4vY29tbW9uL3Rvb2x0aXAvcG9zaXRpb24nO1xuaW1wb3J0IHsgU3R5bGVUeXBlcyB9IGZyb20gJy4uL2NvbW1vbi90b29sdGlwL3N0eWxlLnR5cGUnO1xuaW1wb3J0IHsgVmlld0RpbWVuc2lvbnMgfSBmcm9tICcuLi9jb21tb24vdHlwZXMvdmlldy1kaW1lbnNpb24uaW50ZXJmYWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZ1tuZ3gtY2hhcnRzLXBpZS1zZXJpZXNdJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c3ZnOmcgKm5nRm9yPVwibGV0IGFyYyBvZiBkYXRhOyB0cmFja0J5OiB0cmFja0J5XCI+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgbmd4LWNoYXJ0cy1waWUtbGFiZWxcbiAgICAgICAgKm5nSWY9XCJsYWJlbFZpc2libGUoYXJjKVwiXG4gICAgICAgIFtkYXRhXT1cImFyY1wiXG4gICAgICAgIFtyYWRpdXNdPVwib3V0ZXJSYWRpdXNcIlxuICAgICAgICBbY29sb3JdPVwiY29sb3IoYXJjKVwiXG4gICAgICAgIFtsYWJlbF09XCJsYWJlbFRleHQoYXJjKVwiXG4gICAgICAgIFtsYWJlbFRyaW1dPVwidHJpbUxhYmVsc1wiXG4gICAgICAgIFtsYWJlbFRyaW1TaXplXT1cIm1heExhYmVsTGVuZ3RoXCJcbiAgICAgICAgW21heF09XCJtYXhcIlxuICAgICAgICBbdmFsdWVdPVwiYXJjLnZhbHVlXCJcbiAgICAgICAgW2V4cGxvZGVTbGljZXNdPVwiZXhwbG9kZVNsaWNlc1wiXG4gICAgICAgIFthbmltYXRpb25zXT1cImFuaW1hdGlvbnNcIlxuICAgICAgPjwvc3ZnOmc+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgbmd4LWNoYXJ0cy1waWUtYXJjXG4gICAgICAgIFtzdGFydEFuZ2xlXT1cImFyYy5zdGFydEFuZ2xlXCJcbiAgICAgICAgW2VuZEFuZ2xlXT1cImFyYy5lbmRBbmdsZVwiXG4gICAgICAgIFtpbm5lclJhZGl1c109XCJpbm5lclJhZGl1c1wiXG4gICAgICAgIFtvdXRlclJhZGl1c109XCJvdXRlclJhZGl1c1wiXG4gICAgICAgIFtmaWxsXT1cImNvbG9yKGFyYylcIlxuICAgICAgICBbdmFsdWVdPVwiYXJjLmRhdGEudmFsdWVcIlxuICAgICAgICBbZ3JhZGllbnRdPVwiZ3JhZGllbnRcIlxuICAgICAgICBbZGF0YV09XCJhcmMuZGF0YVwiXG4gICAgICAgIFttYXhdPVwibWF4XCJcbiAgICAgICAgW2V4cGxvZGVTbGljZXNdPVwiZXhwbG9kZVNsaWNlc1wiXG4gICAgICAgIFtpc0FjdGl2ZV09XCJpc0FjdGl2ZShhcmMuZGF0YSlcIlxuICAgICAgICBbYW5pbWF0ZV09XCJhbmltYXRpb25zXCJcbiAgICAgICAgKHNlbGVjdCk9XCJvbkNsaWNrKCRldmVudClcIlxuICAgICAgICAoYWN0aXZhdGUpPVwiYWN0aXZhdGUuZW1pdCgkZXZlbnQpXCJcbiAgICAgICAgKGRlYWN0aXZhdGUpPVwiZGVhY3RpdmF0ZS5lbWl0KCRldmVudClcIlxuICAgICAgICAoZGJsY2xpY2spPVwiZGJsY2xpY2suZW1pdCgkZXZlbnQpXCJcbiAgICAgICAgbmd4LXRvb2x0aXBcbiAgICAgICAgW3Rvb2x0aXBEaXNhYmxlZF09XCJ0b29sdGlwRGlzYWJsZWRcIlxuICAgICAgICBbdG9vbHRpcFBsYWNlbWVudF09XCJwbGFjZW1lbnRUeXBlcy5Ub3BcIlxuICAgICAgICBbdG9vbHRpcFR5cGVdPVwic3R5bGVUeXBlcy50b29sdGlwXCJcbiAgICAgICAgW3Rvb2x0aXBUaXRsZV09XCJnZXRUb29sdGlwVGl0bGUoYXJjKVwiXG4gICAgICAgIFt0b29sdGlwVGVtcGxhdGVdPVwidG9vbHRpcFRlbXBsYXRlXCJcbiAgICAgICAgW3Rvb2x0aXBDb250ZXh0XT1cImFyYy5kYXRhXCJcbiAgICAgID48L3N2ZzpnPlxuICAgIDwvc3ZnOmc+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIFBpZVNlcmllc0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIGNvbG9yczogQ29sb3JIZWxwZXI7XG4gIEBJbnB1dCgpIHNlcmllczogRGF0YUl0ZW1bXSA9IFtdO1xuICBASW5wdXQoKSBkaW1zOiBWaWV3RGltZW5zaW9ucztcbiAgQElucHV0KCkgaW5uZXJSYWRpdXM6IG51bWJlciA9IDYwO1xuICBASW5wdXQoKSBvdXRlclJhZGl1czogbnVtYmVyID0gODA7XG4gIEBJbnB1dCgpIGV4cGxvZGVTbGljZXM6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHNob3dMYWJlbHM6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGdyYWRpZW50OiBib29sZWFuO1xuICBASW5wdXQoKSBhY3RpdmVFbnRyaWVzOiBhbnlbXTtcbiAgQElucHV0KCkgbGFiZWxGb3JtYXR0aW5nOiBhbnk7XG4gIEBJbnB1dCgpIHRyaW1MYWJlbHM6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBtYXhMYWJlbExlbmd0aDogbnVtYmVyID0gMTA7XG4gIEBJbnB1dCgpIHRvb2x0aXBUZXh0OiAobzogYW55KSA9PiBhbnk7XG4gIEBJbnB1dCgpIHRvb2x0aXBEaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSB0b29sdGlwVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gIEBJbnB1dCgpIGFuaW1hdGlvbnM6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBPdXRwdXQoKSBzZWxlY3QgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBhY3RpdmF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGRlYWN0aXZhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkYmxjbGljayA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBtYXg6IG51bWJlcjtcbiAgZGF0YTogUGllRGF0YVtdO1xuXG4gIHBsYWNlbWVudFR5cGVzID0gUGxhY2VtZW50VHlwZXM7XG4gIHN0eWxlVHlwZXMgPSBTdHlsZVR5cGVzO1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIGNvbnN0IHBpZUdlbmVyYXRvciA9IHBpZTxhbnksIGFueT4oKVxuICAgICAgLnZhbHVlKGQgPT4gZC52YWx1ZSlcbiAgICAgIC5zb3J0KG51bGwpO1xuXG4gICAgY29uc3QgYXJjRGF0YSA9IHBpZUdlbmVyYXRvcih0aGlzLnNlcmllcyk7XG5cbiAgICB0aGlzLm1heCA9IG1heChhcmNEYXRhLCBkID0+IHtcbiAgICAgIHJldHVybiBkLnZhbHVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kYXRhID0gdGhpcy5jYWxjdWxhdGVMYWJlbFBvc2l0aW9ucyhhcmNEYXRhKTtcbiAgICB0aGlzLnRvb2x0aXBUZXh0ID0gdGhpcy50b29sdGlwVGV4dCB8fCB0aGlzLmRlZmF1bHRUb29sdGlwVGV4dDtcbiAgfVxuXG4gIG1pZEFuZ2xlKGQpOiBudW1iZXIge1xuICAgIHJldHVybiBkLnN0YXJ0QW5nbGUgKyAoZC5lbmRBbmdsZSAtIGQuc3RhcnRBbmdsZSkgLyAyO1xuICB9XG5cbiAgb3V0ZXJBcmMoKTogYW55IHtcbiAgICBjb25zdCBmYWN0b3IgPSAxLjU7XG5cbiAgICByZXR1cm4gYXJjKClcbiAgICAgIC5pbm5lclJhZGl1cyh0aGlzLm91dGVyUmFkaXVzICogZmFjdG9yKVxuICAgICAgLm91dGVyUmFkaXVzKHRoaXMub3V0ZXJSYWRpdXMgKiBmYWN0b3IpO1xuICB9XG5cbiAgY2FsY3VsYXRlTGFiZWxQb3NpdGlvbnMocGllRGF0YSk6IGFueSB7XG4gICAgY29uc3QgZmFjdG9yID0gMS41O1xuICAgIGNvbnN0IG1pbkRpc3RhbmNlID0gMTA7XG4gICAgY29uc3QgbGFiZWxQb3NpdGlvbnMgPSBwaWVEYXRhO1xuXG4gICAgbGFiZWxQb3NpdGlvbnMuZm9yRWFjaChkID0+IHtcbiAgICAgIGQucG9zID0gdGhpcy5vdXRlckFyYygpLmNlbnRyb2lkKGQpO1xuICAgICAgZC5wb3NbMF0gPSBmYWN0b3IgKiB0aGlzLm91dGVyUmFkaXVzICogKHRoaXMubWlkQW5nbGUoZCkgPCBNYXRoLlBJID8gMSA6IC0xKTtcbiAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFiZWxQb3NpdGlvbnMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBjb25zdCBhID0gbGFiZWxQb3NpdGlvbnNbaV07XG4gICAgICBpZiAoIXRoaXMubGFiZWxWaXNpYmxlKGEpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBsYWJlbFBvc2l0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBiID0gbGFiZWxQb3NpdGlvbnNbal07XG4gICAgICAgIGlmICghdGhpcy5sYWJlbFZpc2libGUoYikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB0aGV5J3JlIG9uIHRoZSBzYW1lIHNpZGVcbiAgICAgICAgaWYgKGIucG9zWzBdICogYS5wb3NbMF0gPiAwKSB7XG4gICAgICAgICAgLy8gaWYgdGhleSdyZSBvdmVybGFwcGluZ1xuICAgICAgICAgIGNvbnN0IG8gPSBtaW5EaXN0YW5jZSAtIE1hdGguYWJzKGIucG9zWzFdIC0gYS5wb3NbMV0pO1xuICAgICAgICAgIGlmIChvID4gMCkge1xuICAgICAgICAgICAgLy8gcHVzaCB0aGUgc2Vjb25kIHVwIG9yIGRvd25cbiAgICAgICAgICAgIGIucG9zWzFdICs9IE1hdGguc2lnbihiLnBvc1swXSkgKiBvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsYWJlbFBvc2l0aW9ucztcbiAgfVxuXG4gIGxhYmVsVmlzaWJsZShteUFyYyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNob3dMYWJlbHMgJiYgbXlBcmMuZW5kQW5nbGUgLSBteUFyYy5zdGFydEFuZ2xlID4gTWF0aC5QSSAvIDMwO1xuICB9XG5cbiAgZ2V0VG9vbHRpcFRpdGxlKGEpIHtcbiAgICByZXR1cm4gdGhpcy50b29sdGlwVGVtcGxhdGUgPyB1bmRlZmluZWQgOiB0aGlzLnRvb2x0aXBUZXh0KGEpO1xuICB9XG5cbiAgbGFiZWxUZXh0KG15QXJjKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5sYWJlbEZvcm1hdHRpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmxhYmVsRm9ybWF0dGluZyhteUFyYy5kYXRhLm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sYWJlbChteUFyYyk7XG4gIH1cblxuICBsYWJlbChteUFyYyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGZvcm1hdExhYmVsKG15QXJjLmRhdGEubmFtZSk7XG4gIH1cblxuICBkZWZhdWx0VG9vbHRpcFRleHQobXlBcmMpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxhYmVsID0gdGhpcy5sYWJlbChteUFyYyk7XG4gICAgY29uc3QgdmFsID0gZm9ybWF0TGFiZWwobXlBcmMuZGF0YS52YWx1ZSk7XG5cbiAgICByZXR1cm4gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sdGlwLWxhYmVsXCI+JHtlc2NhcGVMYWJlbChsYWJlbCl9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sdGlwLXZhbFwiPiR7dmFsfTwvc3Bhbj5cbiAgICBgO1xuICB9XG5cbiAgY29sb3IobXlBcmMpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmNvbG9ycy5nZXRDb2xvcih0aGlzLmxhYmVsKG15QXJjKSk7XG4gIH1cblxuICB0cmFja0J5KGluZGV4LCBpdGVtKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaXRlbS5kYXRhLm5hbWU7XG4gIH1cblxuICBvbkNsaWNrKGRhdGEpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdC5lbWl0KGRhdGEpO1xuICB9XG5cbiAgaXNBY3RpdmUoZW50cnkpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlRW50cmllcykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmFjdGl2ZUVudHJpZXMuZmluZChkID0+IHtcbiAgICAgIHJldHVybiBlbnRyeS5uYW1lID09PSBkLm5hbWUgJiYgZW50cnkuc2VyaWVzID09PSBkLnNlcmllcztcbiAgICB9KTtcbiAgICByZXR1cm4gaXRlbSAhPT0gdW5kZWZpbmVkO1xuICB9XG59XG4iXX0=