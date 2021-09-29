import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { formatLabel, escapeLabel } from '../common/label.helper';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
export class HeatCellSeriesComponent {
    constructor() {
        this.tooltipDisabled = false;
        this.animations = true;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.placementTypes = PlacementTypes;
        this.styleTypes = StyleTypes;
    }
    ngOnInit() {
        if (!this.tooltipText) {
            this.tooltipText = this.getTooltipText;
        }
    }
    ngOnChanges(changes) {
        this.update();
    }
    update() {
        this.cells = this.getCells();
    }
    getCells() {
        const cells = [];
        this.data.map(row => {
            row.series.map(cell => {
                const value = cell.value;
                cell.series = row.name;
                cells.push({
                    row,
                    cell,
                    x: this.xScale(row.name),
                    y: this.yScale(cell.name),
                    width: this.xScale.bandwidth(),
                    height: this.yScale.bandwidth(),
                    fill: this.colors.getColor(value),
                    data: value,
                    label: formatLabel(cell.name),
                    series: row.name
                });
            });
        });
        return cells;
    }
    getTooltipText({ label, data, series }) {
        return `
      <span class="tooltip-label">${escapeLabel(series)} • ${escapeLabel(label)}</span>
      <span class="tooltip-val">${data.toLocaleString()}</span>
    `;
    }
    trackBy(index, item) {
        return item.label;
    }
    onClick(data) {
        this.select.emit(data);
    }
}
HeatCellSeriesComponent.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-heat-map-cell-series]',
                template: `
    <svg:g
      ngx-charts-heat-map-cell
      *ngFor="let c of cells; trackBy: trackBy"
      [x]="c.x"
      [y]="c.y"
      [width]="c.width"
      [height]="c.height"
      [fill]="c.fill"
      [data]="c.data"
      (select)="onClick(c.cell)"
      (activate)="activate.emit(c.cell)"
      (deactivate)="deactivate.emit(c.cell)"
      [gradient]="gradient"
      [animations]="animations"
      ngx-tooltip
      [tooltipDisabled]="tooltipDisabled"
      [tooltipPlacement]="placementTypes.Top"
      [tooltipType]="styleTypes.tooltip"
      [tooltipTitle]="tooltipTemplate ? undefined : tooltipText(c)"
      [tooltipTemplate]="tooltipTemplate"
      [tooltipContext]="{ series: c.series, name: c.label, value: c.data }"
    ></svg:g>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
HeatCellSeriesComponent.propDecorators = {
    data: [{ type: Input }],
    colors: [{ type: Input }],
    xScale: [{ type: Input }],
    yScale: [{ type: Input }],
    gradient: [{ type: Input }],
    tooltipDisabled: [{ type: Input }],
    tooltipText: [{ type: Input }],
    tooltipTemplate: [{ type: Input }],
    animations: [{ type: Input }],
    select: [{ type: Output }],
    activate: [{ type: Output }],
    deactivate: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhdC1tYXAtY2VsbC1zZXJpZXMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvc3dpbWxhbmUvbmd4LWNoYXJ0cy9zcmMvbGliL2hlYXQtbWFwL2hlYXQtbWFwLWNlbGwtc2VyaWVzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFFTCxNQUFNLEVBQ04sWUFBWSxFQUdaLHVCQUF1QixFQUV4QixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUEwQzFELE1BQU0sT0FBTyx1QkFBdUI7SUE1QnBDO1FBa0NXLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBR2pDLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFFMUIsV0FBTSxHQUEyQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3BELGFBQVEsR0FBMkIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN0RCxlQUFVLEdBQTJCLElBQUksWUFBWSxFQUFFLENBQUM7UUFJbEUsbUJBQWMsR0FBRyxjQUFjLENBQUM7UUFDaEMsZUFBVSxHQUFHLFVBQVUsQ0FBQztJQXdEMUIsQ0FBQztJQXREQyxRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1NBQ3hDO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQsUUFBUTtRQUNOLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUVqQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNsQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUV2QixLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNULEdBQUc7b0JBQ0gsSUFBSTtvQkFDSixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUN4QixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7b0JBQzlCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtvQkFDL0IsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztvQkFDakMsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsS0FBSyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUM3QixNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUk7aUJBQ2pCLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxjQUFjLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBbUQ7UUFDckYsT0FBTztvQ0FDeUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUM7a0NBQzdDLElBQUksQ0FBQyxjQUFjLEVBQUU7S0FDbEQsQ0FBQztJQUNKLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBYSxFQUFFLElBQUk7UUFDekIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7OztZQXJHRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG9DQUFvQztnQkFDOUMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCVDtnQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTthQUNoRDs7O21CQUVFLEtBQUs7cUJBQ0wsS0FBSztxQkFDTCxLQUFLO3FCQUNMLEtBQUs7dUJBQ0wsS0FBSzs4QkFDTCxLQUFLOzBCQUNMLEtBQUs7OEJBQ0wsS0FBSzt5QkFDTCxLQUFLO3FCQUVMLE1BQU07dUJBQ04sTUFBTTt5QkFDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uQ2hhbmdlcyxcbiAgT25Jbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVGVtcGxhdGVSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBmb3JtYXRMYWJlbCwgZXNjYXBlTGFiZWwgfSBmcm9tICcuLi9jb21tb24vbGFiZWwuaGVscGVyJztcbmltcG9ydCB7IERhdGFJdGVtLCBTZXJpZXMgfSBmcm9tICcuLi9tb2RlbHMvY2hhcnQtZGF0YS5tb2RlbCc7XG5pbXBvcnQgeyBQbGFjZW1lbnRUeXBlcyB9IGZyb20gJy4uL2NvbW1vbi90b29sdGlwL3Bvc2l0aW9uJztcbmltcG9ydCB7IFN0eWxlVHlwZXMgfSBmcm9tICcuLi9jb21tb24vdG9vbHRpcC9zdHlsZS50eXBlJztcblxuaW50ZXJmYWNlIENlbGwge1xuICBjZWxsOiBEYXRhSXRlbTtcbiAgZGF0YTogbnVtYmVyO1xuICBmaWxsOiBzdHJpbmc7XG4gIGhlaWdodDogbnVtYmVyO1xuICBsYWJlbDogc3RyaW5nO1xuICByb3c6IFNlcmllcztcbiAgc2VyaWVzOiBzdHJpbmc7XG4gIHdpZHRoOiBudW1iZXI7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZ1tuZ3gtY2hhcnRzLWhlYXQtbWFwLWNlbGwtc2VyaWVzXScsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHN2ZzpnXG4gICAgICBuZ3gtY2hhcnRzLWhlYXQtbWFwLWNlbGxcbiAgICAgICpuZ0Zvcj1cImxldCBjIG9mIGNlbGxzOyB0cmFja0J5OiB0cmFja0J5XCJcbiAgICAgIFt4XT1cImMueFwiXG4gICAgICBbeV09XCJjLnlcIlxuICAgICAgW3dpZHRoXT1cImMud2lkdGhcIlxuICAgICAgW2hlaWdodF09XCJjLmhlaWdodFwiXG4gICAgICBbZmlsbF09XCJjLmZpbGxcIlxuICAgICAgW2RhdGFdPVwiYy5kYXRhXCJcbiAgICAgIChzZWxlY3QpPVwib25DbGljayhjLmNlbGwpXCJcbiAgICAgIChhY3RpdmF0ZSk9XCJhY3RpdmF0ZS5lbWl0KGMuY2VsbClcIlxuICAgICAgKGRlYWN0aXZhdGUpPVwiZGVhY3RpdmF0ZS5lbWl0KGMuY2VsbClcIlxuICAgICAgW2dyYWRpZW50XT1cImdyYWRpZW50XCJcbiAgICAgIFthbmltYXRpb25zXT1cImFuaW1hdGlvbnNcIlxuICAgICAgbmd4LXRvb2x0aXBcbiAgICAgIFt0b29sdGlwRGlzYWJsZWRdPVwidG9vbHRpcERpc2FibGVkXCJcbiAgICAgIFt0b29sdGlwUGxhY2VtZW50XT1cInBsYWNlbWVudFR5cGVzLlRvcFwiXG4gICAgICBbdG9vbHRpcFR5cGVdPVwic3R5bGVUeXBlcy50b29sdGlwXCJcbiAgICAgIFt0b29sdGlwVGl0bGVdPVwidG9vbHRpcFRlbXBsYXRlID8gdW5kZWZpbmVkIDogdG9vbHRpcFRleHQoYylcIlxuICAgICAgW3Rvb2x0aXBUZW1wbGF0ZV09XCJ0b29sdGlwVGVtcGxhdGVcIlxuICAgICAgW3Rvb2x0aXBDb250ZXh0XT1cInsgc2VyaWVzOiBjLnNlcmllcywgbmFtZTogYy5sYWJlbCwgdmFsdWU6IGMuZGF0YSB9XCJcbiAgICA+PC9zdmc6Zz5cbiAgYCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgSGVhdENlbGxTZXJpZXNDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGRhdGE7XG4gIEBJbnB1dCgpIGNvbG9ycztcbiAgQElucHV0KCkgeFNjYWxlO1xuICBASW5wdXQoKSB5U2NhbGU7XG4gIEBJbnB1dCgpIGdyYWRpZW50OiBib29sZWFuO1xuICBASW5wdXQoKSB0b29sdGlwRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgdG9vbHRpcFRleHQ6IGFueTtcbiAgQElucHV0KCkgdG9vbHRpcFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBASW5wdXQoKSBhbmltYXRpb25zOiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCkgc2VsZWN0OiBFdmVudEVtaXR0ZXI8RGF0YUl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgYWN0aXZhdGU6IEV2ZW50RW1pdHRlcjxEYXRhSXRlbT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlOiBFdmVudEVtaXR0ZXI8RGF0YUl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNlbGxzOiBDZWxsW107XG5cbiAgcGxhY2VtZW50VHlwZXMgPSBQbGFjZW1lbnRUeXBlcztcbiAgc3R5bGVUeXBlcyA9IFN0eWxlVHlwZXM7XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCF0aGlzLnRvb2x0aXBUZXh0KSB7XG4gICAgICB0aGlzLnRvb2x0aXBUZXh0ID0gdGhpcy5nZXRUb29sdGlwVGV4dDtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNlbGxzID0gdGhpcy5nZXRDZWxscygpO1xuICB9XG5cbiAgZ2V0Q2VsbHMoKTogQ2VsbFtdIHtcbiAgICBjb25zdCBjZWxscyA9IFtdO1xuXG4gICAgdGhpcy5kYXRhLm1hcChyb3cgPT4ge1xuICAgICAgcm93LnNlcmllcy5tYXAoY2VsbCA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gY2VsbC52YWx1ZTtcbiAgICAgICAgY2VsbC5zZXJpZXMgPSByb3cubmFtZTtcblxuICAgICAgICBjZWxscy5wdXNoKHtcbiAgICAgICAgICByb3csXG4gICAgICAgICAgY2VsbCxcbiAgICAgICAgICB4OiB0aGlzLnhTY2FsZShyb3cubmFtZSksXG4gICAgICAgICAgeTogdGhpcy55U2NhbGUoY2VsbC5uYW1lKSxcbiAgICAgICAgICB3aWR0aDogdGhpcy54U2NhbGUuYmFuZHdpZHRoKCksXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLnlTY2FsZS5iYW5kd2lkdGgoKSxcbiAgICAgICAgICBmaWxsOiB0aGlzLmNvbG9ycy5nZXRDb2xvcih2YWx1ZSksXG4gICAgICAgICAgZGF0YTogdmFsdWUsXG4gICAgICAgICAgbGFiZWw6IGZvcm1hdExhYmVsKGNlbGwubmFtZSksXG4gICAgICAgICAgc2VyaWVzOiByb3cubmFtZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNlbGxzO1xuICB9XG5cbiAgZ2V0VG9vbHRpcFRleHQoeyBsYWJlbCwgZGF0YSwgc2VyaWVzIH06IHsgbGFiZWw6IHN0cmluZzsgZGF0YTogbnVtYmVyOyBzZXJpZXM6IHN0cmluZyB9KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sdGlwLWxhYmVsXCI+JHtlc2NhcGVMYWJlbChzZXJpZXMpfSDigKIgJHtlc2NhcGVMYWJlbChsYWJlbCl9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sdGlwLXZhbFwiPiR7ZGF0YS50b0xvY2FsZVN0cmluZygpfTwvc3Bhbj5cbiAgICBgO1xuICB9XG5cbiAgdHJhY2tCeShpbmRleDogbnVtYmVyLCBpdGVtKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgfVxuXG4gIG9uQ2xpY2soZGF0YSk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0LmVtaXQoZGF0YSk7XG4gIH1cbn1cbiJdfQ==