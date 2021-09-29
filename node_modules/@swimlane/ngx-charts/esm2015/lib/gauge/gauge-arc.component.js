import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { formatLabel, escapeLabel } from '../common/label.helper';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
export class GaugeArcComponent {
    constructor() {
        this.isActive = false;
        this.tooltipDisabled = false;
        this.animations = true;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.placementTypes = PlacementTypes;
        this.styleTypes = StyleTypes;
    }
    tooltipText(arc) {
        const label = formatLabel(arc.data.name);
        let val;
        if (this.valueFormatting) {
            val = this.valueFormatting(arc.data.value);
        }
        else {
            val = formatLabel(arc.data.value);
        }
        return `
      <span class="tooltip-label">${escapeLabel(label)}</span>
      <span class="tooltip-val">${val}</span>
    `;
    }
}
GaugeArcComponent.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-gauge-arc]',
                template: `
    <svg:g
      ngx-charts-pie-arc
      class="background-arc"
      [startAngle]="0"
      [endAngle]="backgroundArc.endAngle"
      [innerRadius]="backgroundArc.innerRadius"
      [outerRadius]="backgroundArc.outerRadius"
      [cornerRadius]="cornerRadius"
      [data]="backgroundArc.data"
      [animate]="false"
      [pointerEvents]="false"
    ></svg:g>
    <svg:g
      ngx-charts-pie-arc
      [startAngle]="0"
      [endAngle]="valueArc.endAngle"
      [innerRadius]="valueArc.innerRadius"
      [outerRadius]="valueArc.outerRadius"
      [cornerRadius]="cornerRadius"
      [fill]="colors.getColor(valueArc.data.name)"
      [data]="valueArc.data"
      [animate]="animations"
      [isActive]="isActive"
      (select)="select.emit($event)"
      (activate)="activate.emit($event)"
      (deactivate)="deactivate.emit($event)"
      ngx-tooltip
      [tooltipDisabled]="tooltipDisabled"
      [tooltipPlacement]="placementTypes.Top"
      [tooltipType]="styleTypes.tooltip"
      [tooltipTitle]="tooltipTemplate ? undefined : tooltipText(valueArc)"
      [tooltipTemplate]="tooltipTemplate"
      [tooltipContext]="valueArc.data"
    ></svg:g>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
GaugeArcComponent.propDecorators = {
    backgroundArc: [{ type: Input }],
    valueArc: [{ type: Input }],
    cornerRadius: [{ type: Input }],
    colors: [{ type: Input }],
    isActive: [{ type: Input }],
    tooltipDisabled: [{ type: Input }],
    valueFormatting: [{ type: Input }],
    tooltipTemplate: [{ type: Input }],
    animations: [{ type: Input }],
    select: [{ type: Output }],
    activate: [{ type: Output }],
    deactivate: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F1Z2UtYXJjLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1jaGFydHMvc3JjL2xpYi9nYXVnZS9nYXVnZS1hcmMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsdUJBQXVCLEVBQWUsTUFBTSxlQUFlLENBQUM7QUFDN0csT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUdsRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBaUQxRCxNQUFNLE9BQU8saUJBQWlCO0lBeEM5QjtRQTZDVyxhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBR2pDLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFFMUIsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDNUIsYUFBUSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDOUIsZUFBVSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFFMUMsbUJBQWMsR0FBRyxjQUFjLENBQUM7UUFDaEMsZUFBVSxHQUFHLFVBQVUsQ0FBQztJQWlCMUIsQ0FBQztJQWZDLFdBQVcsQ0FBQyxHQUFZO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQUksR0FBRyxDQUFDO1FBRVIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUM7YUFBTTtZQUNMLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuQztRQUVELE9BQU87b0NBQ3lCLFdBQVcsQ0FBQyxLQUFLLENBQUM7a0NBQ3BCLEdBQUc7S0FDaEMsQ0FBQztJQUNKLENBQUM7OztZQXhFRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1DVDtnQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTthQUNoRDs7OzRCQUVFLEtBQUs7dUJBQ0wsS0FBSzsyQkFDTCxLQUFLO3FCQUNMLEtBQUs7dUJBQ0wsS0FBSzs4QkFDTCxLQUFLOzhCQUNMLEtBQUs7OEJBQ0wsS0FBSzt5QkFDTCxLQUFLO3FCQUVMLE1BQU07dUJBQ04sTUFBTTt5QkFDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgZm9ybWF0TGFiZWwsIGVzY2FwZUxhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2xhYmVsLmhlbHBlcic7XG5pbXBvcnQgeyBDb2xvckhlbHBlciB9IGZyb20gJy4uL2NvbW1vbi9jb2xvci5oZWxwZXInO1xuaW1wb3J0IHsgRGF0YUl0ZW0gfSBmcm9tICcuLi9tb2RlbHMvY2hhcnQtZGF0YS5tb2RlbCc7XG5pbXBvcnQgeyBQbGFjZW1lbnRUeXBlcyB9IGZyb20gJy4uL2NvbW1vbi90b29sdGlwL3Bvc2l0aW9uJztcbmltcG9ydCB7IFN0eWxlVHlwZXMgfSBmcm9tICcuLi9jb21tb24vdG9vbHRpcC9zdHlsZS50eXBlJztcblxuZXhwb3J0IGludGVyZmFjZSBBcmNJdGVtIHtcbiAgZGF0YTogRGF0YUl0ZW07XG4gIGVuZEFuZ2xlOiBudW1iZXI7XG4gIGlubmVyUmFkaXVzOiBudW1iZXI7XG4gIG91dGVyUmFkaXVzOiBudW1iZXI7XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dbbmd4LWNoYXJ0cy1nYXVnZS1hcmNdJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c3ZnOmdcbiAgICAgIG5neC1jaGFydHMtcGllLWFyY1xuICAgICAgY2xhc3M9XCJiYWNrZ3JvdW5kLWFyY1wiXG4gICAgICBbc3RhcnRBbmdsZV09XCIwXCJcbiAgICAgIFtlbmRBbmdsZV09XCJiYWNrZ3JvdW5kQXJjLmVuZEFuZ2xlXCJcbiAgICAgIFtpbm5lclJhZGl1c109XCJiYWNrZ3JvdW5kQXJjLmlubmVyUmFkaXVzXCJcbiAgICAgIFtvdXRlclJhZGl1c109XCJiYWNrZ3JvdW5kQXJjLm91dGVyUmFkaXVzXCJcbiAgICAgIFtjb3JuZXJSYWRpdXNdPVwiY29ybmVyUmFkaXVzXCJcbiAgICAgIFtkYXRhXT1cImJhY2tncm91bmRBcmMuZGF0YVwiXG4gICAgICBbYW5pbWF0ZV09XCJmYWxzZVwiXG4gICAgICBbcG9pbnRlckV2ZW50c109XCJmYWxzZVwiXG4gICAgPjwvc3ZnOmc+XG4gICAgPHN2ZzpnXG4gICAgICBuZ3gtY2hhcnRzLXBpZS1hcmNcbiAgICAgIFtzdGFydEFuZ2xlXT1cIjBcIlxuICAgICAgW2VuZEFuZ2xlXT1cInZhbHVlQXJjLmVuZEFuZ2xlXCJcbiAgICAgIFtpbm5lclJhZGl1c109XCJ2YWx1ZUFyYy5pbm5lclJhZGl1c1wiXG4gICAgICBbb3V0ZXJSYWRpdXNdPVwidmFsdWVBcmMub3V0ZXJSYWRpdXNcIlxuICAgICAgW2Nvcm5lclJhZGl1c109XCJjb3JuZXJSYWRpdXNcIlxuICAgICAgW2ZpbGxdPVwiY29sb3JzLmdldENvbG9yKHZhbHVlQXJjLmRhdGEubmFtZSlcIlxuICAgICAgW2RhdGFdPVwidmFsdWVBcmMuZGF0YVwiXG4gICAgICBbYW5pbWF0ZV09XCJhbmltYXRpb25zXCJcbiAgICAgIFtpc0FjdGl2ZV09XCJpc0FjdGl2ZVwiXG4gICAgICAoc2VsZWN0KT1cInNlbGVjdC5lbWl0KCRldmVudClcIlxuICAgICAgKGFjdGl2YXRlKT1cImFjdGl2YXRlLmVtaXQoJGV2ZW50KVwiXG4gICAgICAoZGVhY3RpdmF0ZSk9XCJkZWFjdGl2YXRlLmVtaXQoJGV2ZW50KVwiXG4gICAgICBuZ3gtdG9vbHRpcFxuICAgICAgW3Rvb2x0aXBEaXNhYmxlZF09XCJ0b29sdGlwRGlzYWJsZWRcIlxuICAgICAgW3Rvb2x0aXBQbGFjZW1lbnRdPVwicGxhY2VtZW50VHlwZXMuVG9wXCJcbiAgICAgIFt0b29sdGlwVHlwZV09XCJzdHlsZVR5cGVzLnRvb2x0aXBcIlxuICAgICAgW3Rvb2x0aXBUaXRsZV09XCJ0b29sdGlwVGVtcGxhdGUgPyB1bmRlZmluZWQgOiB0b29sdGlwVGV4dCh2YWx1ZUFyYylcIlxuICAgICAgW3Rvb2x0aXBUZW1wbGF0ZV09XCJ0b29sdGlwVGVtcGxhdGVcIlxuICAgICAgW3Rvb2x0aXBDb250ZXh0XT1cInZhbHVlQXJjLmRhdGFcIlxuICAgID48L3N2ZzpnPlxuICBgLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBHYXVnZUFyY0NvbXBvbmVudCB7XG4gIEBJbnB1dCgpIGJhY2tncm91bmRBcmM6IEFyY0l0ZW07XG4gIEBJbnB1dCgpIHZhbHVlQXJjOiBBcmNJdGVtO1xuICBASW5wdXQoKSBjb3JuZXJSYWRpdXM6IG51bWJlcjtcbiAgQElucHV0KCkgY29sb3JzOiBDb2xvckhlbHBlcjtcbiAgQElucHV0KCkgaXNBY3RpdmU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgdG9vbHRpcERpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHZhbHVlRm9ybWF0dGluZzogKHZhbHVlOiBhbnkpID0+IHN0cmluZztcbiAgQElucHV0KCkgdG9vbHRpcFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBASW5wdXQoKSBhbmltYXRpb25zOiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCkgc2VsZWN0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgYWN0aXZhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIHBsYWNlbWVudFR5cGVzID0gUGxhY2VtZW50VHlwZXM7XG4gIHN0eWxlVHlwZXMgPSBTdHlsZVR5cGVzO1xuXG4gIHRvb2x0aXBUZXh0KGFyYzogQXJjSXRlbSk6IHN0cmluZyB7XG4gICAgY29uc3QgbGFiZWwgPSBmb3JtYXRMYWJlbChhcmMuZGF0YS5uYW1lKTtcbiAgICBsZXQgdmFsO1xuXG4gICAgaWYgKHRoaXMudmFsdWVGb3JtYXR0aW5nKSB7XG4gICAgICB2YWwgPSB0aGlzLnZhbHVlRm9ybWF0dGluZyhhcmMuZGF0YS52YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbCA9IGZvcm1hdExhYmVsKGFyYy5kYXRhLnZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sdGlwLWxhYmVsXCI+JHtlc2NhcGVMYWJlbChsYWJlbCl9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sdGlwLXZhbFwiPiR7dmFsfTwvc3Bhbj5cbiAgICBgO1xuICB9XG59XG4iXX0=