import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { area, line } from 'd3-shape';
import { id } from '../utils/id';
import { sortLinear, sortByTime, sortByDomain } from '../utils/sort';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { ScaleType } from '../common/types/scale-type.enum';
export class LineSeriesComponent {
    constructor() {
        this.animations = true;
        this.barOrientation = BarOrientation;
    }
    ngOnChanges(changes) {
        this.update();
    }
    update() {
        this.updateGradients();
        const data = this.sortData(this.data.series);
        const lineGen = this.getLineGenerator();
        this.path = lineGen(data) || '';
        const areaGen = this.getAreaGenerator();
        this.areaPath = areaGen(data) || '';
        if (this.hasRange) {
            const range = this.getRangeGenerator();
            this.outerPath = range(data) || '';
        }
        if (this.hasGradient) {
            this.stroke = this.gradientUrl;
            const values = this.data.series.map(d => d.value);
            const max = Math.max(...values);
            const min = Math.min(...values);
            if (max === min) {
                this.stroke = this.colors.getColor(max);
            }
        }
        else {
            this.stroke = this.colors.getColor(this.data.name);
        }
    }
    getLineGenerator() {
        return line()
            .x(d => {
            const label = d.name;
            let value;
            if (this.scaleType === ScaleType.Time) {
                value = this.xScale(label);
            }
            else if (this.scaleType === ScaleType.Linear) {
                value = this.xScale(Number(label));
            }
            else {
                value = this.xScale(label);
            }
            return value;
        })
            .y(d => this.yScale(d.value))
            .curve(this.curve);
    }
    getRangeGenerator() {
        return area()
            .x(d => {
            const label = d.name;
            let value;
            if (this.scaleType === ScaleType.Time) {
                value = this.xScale(label);
            }
            else if (this.scaleType === ScaleType.Linear) {
                value = this.xScale(Number(label));
            }
            else {
                value = this.xScale(label);
            }
            return value;
        })
            .y0(d => this.yScale(typeof d.min === 'number' ? d.min : d.value))
            .y1(d => this.yScale(typeof d.max === 'number' ? d.max : d.value))
            .curve(this.curve);
    }
    getAreaGenerator() {
        const xProperty = d => {
            const label = d.name;
            return this.xScale(label);
        };
        return area()
            .x(xProperty)
            .y0(() => this.yScale.range()[0])
            .y1(d => this.yScale(d.value))
            .curve(this.curve);
    }
    sortData(data) {
        if (this.scaleType === ScaleType.Linear) {
            data = sortLinear(data, 'name');
        }
        else if (this.scaleType === ScaleType.Time) {
            data = sortByTime(data, 'name');
        }
        else {
            data = sortByDomain(data, 'name', 'asc', this.xScale.domain());
        }
        return data;
    }
    updateGradients() {
        if (this.colors.scaleType === ScaleType.Linear) {
            this.hasGradient = true;
            this.gradientId = 'grad' + id().toString();
            this.gradientUrl = `url(#${this.gradientId})`;
            const values = this.data.series.map(d => d.value);
            const max = Math.max(...values);
            const min = Math.min(...values);
            this.gradientStops = this.colors.getLinearGradientStops(max, min);
            this.areaGradientStops = this.colors.getLinearGradientStops(max);
        }
        else {
            this.hasGradient = false;
            this.gradientStops = undefined;
            this.areaGradientStops = undefined;
        }
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
}
LineSeriesComponent.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-line-series]',
                template: `
    <svg:g>
      <defs>
        <svg:g
          ngx-charts-svg-linear-gradient
          *ngIf="hasGradient"
          [orientation]="barOrientation.Vertical"
          [name]="gradientId"
          [stops]="gradientStops"
        />
      </defs>
      <svg:g
        ngx-charts-area
        class="line-highlight"
        [data]="data"
        [path]="areaPath"
        [fill]="hasGradient ? gradientUrl : colors.getColor(data.name)"
        [opacity]="0.25"
        [startOpacity]="0"
        [gradient]="true"
        [stops]="areaGradientStops"
        [class.active]="isActive(data)"
        [class.inactive]="isInactive(data)"
        [animations]="animations"
      />
      <svg:g
        ngx-charts-line
        class="line-series"
        [data]="data"
        [path]="path"
        [stroke]="stroke"
        [animations]="animations"
        [class.active]="isActive(data)"
        [class.inactive]="isInactive(data)"
      />
      <svg:g
        ngx-charts-area
        *ngIf="hasRange"
        class="line-series-range"
        [data]="data"
        [path]="outerPath"
        [fill]="hasGradient ? gradientUrl : colors.getColor(data.name)"
        [class.active]="isActive(data)"
        [class.inactive]="isInactive(data)"
        [opacity]="rangeFillOpacity"
        [animations]="animations"
      />
    </svg:g>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
LineSeriesComponent.propDecorators = {
    data: [{ type: Input }],
    xScale: [{ type: Input }],
    yScale: [{ type: Input }],
    colors: [{ type: Input }],
    scaleType: [{ type: Input }],
    curve: [{ type: Input }],
    activeEntries: [{ type: Input }],
    rangeFillOpacity: [{ type: Input }],
    hasRange: [{ type: Input }],
    animations: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS1zZXJpZXMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvc3dpbWxhbmUvbmd4LWNoYXJ0cy9zcmMvbGliL2xpbmUtY2hhcnQvbGluZS1zZXJpZXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUE0Qix1QkFBdUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNwRyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV0QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUdyRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDdEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBd0Q1RCxNQUFNLE9BQU8sbUJBQW1CO0lBckRoQztRQStEVyxlQUFVLEdBQVksSUFBSSxDQUFDO1FBWXBDLG1CQUFjLEdBQUcsY0FBYyxDQUFDO0lBaUlsQyxDQUFDO0lBL0hDLFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVoQyxNQUFNLE9BQU8sR0FBRyxJ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b250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlcywgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGFyZWEsIGxpbmUgfSBmcm9tICdkMy1zaGFwZSc7XG5cbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vdXRpbHMvaWQnO1xuaW1wb3J0IHsgc29ydExpbmVhciwgc29ydEJ5VGltZSwgc29ydEJ5RG9tYWluIH0gZnJvbSAnLi4vdXRpbHMvc29ydCc7XG5pbXBvcnQgeyBDb2xvckhlbHBlciB9IGZyb20gJy4uL2NvbW1vbi9jb2xvci5oZWxwZXInO1xuaW1wb3J0IHsgU2VyaWVzIH0gZnJvbSAnLi4vbW9kZWxzL2NoYXJ0LWRhdGEubW9kZWwnO1xuaW1wb3J0IHsgQmFyT3JpZW50YXRpb24gfSBmcm9tICcuLi9jb21tb24vdHlwZXMvYmFyLW9yaWVudGF0aW9uLmVudW0nO1xuaW1wb3J0IHsgU2NhbGVUeXBlIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL3NjYWxlLXR5cGUuZW51bSc7XG5pbXBvcnQgeyBHcmFkaWVudCB9IGZyb20gJy4uL2NvbW1vbi90eXBlcy9ncmFkaWVudC5pbnRlcmZhY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdnW25neC1jaGFydHMtbGluZS1zZXJpZXNdJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c3ZnOmc+XG4gICAgICA8ZGVmcz5cbiAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgbmd4LWNoYXJ0cy1zdmctbGluZWFyLWdyYWRpZW50XG4gICAgICAgICAgKm5nSWY9XCJoYXNHcmFkaWVudFwiXG4gICAgICAgICAgW29yaWVudGF0aW9uXT1cImJhck9yaWVudGF0aW9uLlZlcnRpY2FsXCJcbiAgICAgICAgICBbbmFtZV09XCJncmFkaWVudElkXCJcbiAgICAgICAgICBbc3RvcHNdPVwiZ3JhZGllbnRTdG9wc1wiXG4gICAgICAgIC8+XG4gICAgICA8L2RlZnM+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgbmd4LWNoYXJ0cy1hcmVhXG4gICAgICAgIGNsYXNzPVwibGluZS1oaWdobGlnaHRcIlxuICAgICAgICBbZGF0YV09XCJkYXRhXCJcbiAgICAgICAgW3BhdGhdPVwiYXJlYVBhdGhcIlxuICAgICAgICBbZmlsbF09XCJoYXNHcmFkaWVudCA/IGdyYWRpZW50VXJsIDogY29sb3JzLmdldENvbG9yKGRhdGEubmFtZSlcIlxuICAgICAgICBbb3BhY2l0eV09XCIwLjI1XCJcbiAgICAgICAgW3N0YXJ0T3BhY2l0eV09XCIwXCJcbiAgICAgICAgW2dyYWRpZW50XT1cInRydWVcIlxuICAgICAgICBbc3RvcHNdPVwiYXJlYUdyYWRpZW50U3RvcHNcIlxuICAgICAgICBbY2xhc3MuYWN0aXZlXT1cImlzQWN0aXZlKGRhdGEpXCJcbiAgICAgICAgW2NsYXNzLmluYWN0aXZlXT1cImlzSW5hY3RpdmUoZGF0YSlcIlxuICAgICAgICBbYW5pbWF0aW9uc109XCJhbmltYXRpb25zXCJcbiAgICAgIC8+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgbmd4LWNoYXJ0cy1saW5lXG4gICAgICAgIGNsYXNzPVwibGluZS1zZXJpZXNcIlxuICAgICAgICBbZGF0YV09XCJkYXRhXCJcbiAgICAgICAgW3BhdGhdPVwicGF0aFwiXG4gICAgICAgIFtzdHJva2VdPVwic3Ryb2tlXCJcbiAgICAgICAgW2FuaW1hdGlvbnNdPVwiYW5pbWF0aW9uc1wiXG4gICAgICAgIFtjbGFzcy5hY3RpdmVdPVwiaXNBY3RpdmUoZGF0YSlcIlxuICAgICAgICBbY2xhc3MuaW5hY3RpdmVdPVwiaXNJbmFjdGl2ZShkYXRhKVwiXG4gICAgICAvPlxuICAgICAgPHN2ZzpnXG4gICAgICAgIG5neC1jaGFydHMtYXJlYVxuICAgICAgICAqbmdJZj1cImhhc1JhbmdlXCJcbiAgICAgICAgY2xhc3M9XCJsaW5lLXNlcmllcy1yYW5nZVwiXG4gICAgICAgIFtkYXRhXT1cImRhdGFcIlxuICAgICAgICBbcGF0aF09XCJvdXRlclBhdGhcIlxuICAgICAgICBbZmlsbF09XCJoYXNHcmFkaWVudCA/IGdyYWRpZW50VXJsIDogY29sb3JzLmdldENvbG9yKGRhdGEubmFtZSlcIlxuICAgICAgICBbY2xhc3MuYWN0aXZlXT1cImlzQWN0aXZlKGRhdGEpXCJcbiAgICAgICAgW2NsYXNzLmluYWN0aXZlXT1cImlzSW5hY3RpdmUoZGF0YSlcIlxuICAgICAgICBbb3BhY2l0eV09XCJyYW5nZUZpbGxPcGFjaXR5XCJcbiAgICAgICAgW2FuaW1hdGlvbnNdPVwiYW5pbWF0aW9uc1wiXG4gICAgICAvPlxuICAgIDwvc3ZnOmc+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIExpbmVTZXJpZXNDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBASW5wdXQoKSBkYXRhOiBTZXJpZXM7XG4gIEBJbnB1dCgpIHhTY2FsZTtcbiAgQElucHV0KCkgeVNjYWxlO1xuICBASW5wdXQoKSBjb2xvcnM6IENvbG9ySGVscGVyO1xuICBASW5wdXQoKSBzY2FsZVR5cGU6IFNjYWxlVHlwZTtcbiAgQElucHV0KCkgY3VydmU6IGFueTtcbiAgQElucHV0KCkgYWN0aXZlRW50cmllczogYW55W107XG4gIEBJbnB1dCgpIHJhbmdlRmlsbE9wYWNpdHk6IG51bWJlcjtcbiAgQElucHV0KCkgaGFzUmFuZ2U6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGFuaW1hdGlvbnM6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIHBhdGg6IHN0cmluZztcbiAgb3V0ZXJQYXRoOiBzdHJpbmc7XG4gIGFyZWFQYXRoOiBzdHJpbmc7XG4gIGdyYWRpZW50SWQ6IHN0cmluZztcbiAgZ3JhZGllbnRVcmw6IHN0cmluZztcbiAgaGFzR3JhZGllbnQ6IGJvb2xlYW47XG4gIGdyYWRpZW50U3RvcHM6IEdyYWRpZW50W107XG4gIGFyZWFHcmFkaWVudFN0b3BzOiBHcmFkaWVudFtdO1xuICBzdHJva2U6IHN0cmluZztcblxuICBiYXJPcmllbnRhdGlvbiA9IEJhck9yaWVudGF0aW9uO1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlR3JhZGllbnRzKCk7XG5cbiAgICBjb25zdCBkYXRhID0gdGhpcy5zb3J0RGF0YSh0aGlzLmRhdGEuc2VyaWVzKTtcblxuICAgIGNvbnN0IGxpbmVHZW4gPSB0aGlzLmdldExpbmVHZW5lcmF0b3IoKTtcbiAgICB0aGlzLnBhdGggPSBsaW5lR2VuKGRhdGEpIHx8ICcnO1xuXG4gICAgY29uc3QgYXJlYUdlbiA9IHRoaXMuZ2V0QXJlYUdlbmVyYXRvcigpO1xuICAgIHRoaXMuYXJlYVBhdGggPSBhcmVhR2VuKGRhdGEpIHx8ICcnO1xuXG4gICAgaWYgKHRoaXMuaGFzUmFuZ2UpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZUdlbmVyYXRvcigpO1xuICAgICAgdGhpcy5vdXRlclBhdGggPSByYW5nZShkYXRhKSB8fCAnJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5oYXNHcmFkaWVudCkge1xuICAgICAgdGhpcy5zdHJva2UgPSB0aGlzLmdyYWRpZW50VXJsO1xuICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy5kYXRhLnNlcmllcy5tYXAoZCA9PiBkLnZhbHVlKTtcbiAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLnZhbHVlcyk7XG4gICAgICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi52YWx1ZXMpO1xuICAgICAgaWYgKG1heCA9PT0gbWluKSB7XG4gICAgICAgIHRoaXMuc3Ryb2tlID0gdGhpcy5jb2xvcnMuZ2V0Q29sb3IobWF4KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHJva2UgPSB0aGlzLmNvbG9ycy5nZXRDb2xvcih0aGlzLmRhdGEubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TGluZUdlbmVyYXRvcigpOiBhbnkge1xuICAgIHJldHVybiBsaW5lPGFueT4oKVxuICAgICAgLngoZCA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gZC5uYW1lO1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLlRpbWUpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMueFNjYWxlKGxhYmVsKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLkxpbmVhcikge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy54U2NhbGUoTnVtYmVyKGxhYmVsKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLnhTY2FsZShsYWJlbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSlcbiAgICAgIC55KGQgPT4gdGhpcy55U2NhbGUoZC52YWx1ZSkpXG4gICAgICAuY3VydmUodGhpcy5jdXJ2ZSk7XG4gIH1cblxuICBnZXRSYW5nZUdlbmVyYXRvcigpOiBhbnkge1xuICAgIHJldHVybiBhcmVhPGFueT4oKVxuICAgICAgLngoZCA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gZC5uYW1lO1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLlRpbWUpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMueFNjYWxlKGxhYmVsKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLkxpbmVhcikge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy54U2NhbGUoTnVtYmVyKGxhYmVsKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLnhTY2FsZShsYWJlbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSlcbiAgICAgIC55MChkID0+IHRoaXMueVNjYWxlKHR5cGVvZiBkLm1pbiA9PT0gJ251bWJlcicgPyBkLm1pbiA6IGQudmFsdWUpKVxuICAgICAgLnkxKGQgPT4gdGhpcy55U2NhbGUodHlwZW9mIGQubWF4ID09PSAnbnVtYmVyJyA/IGQubWF4IDogZC52YWx1ZSkpXG4gICAgICAuY3VydmUodGhpcy5jdXJ2ZSk7XG4gIH1cblxuICBnZXRBcmVhR2VuZXJhdG9yKCk6IGFueSB7XG4gICAgY29uc3QgeFByb3BlcnR5ID0gZCA9PiB7XG4gICAgICBjb25zdCBsYWJlbCA9IGQubmFtZTtcbiAgICAgIHJldHVybiB0aGlzLnhTY2FsZShsYWJlbCk7XG4gICAgfTtcblxuICAgIHJldHVybiBhcmVhPGFueT4oKVxuICAgICAgLngoeFByb3BlcnR5KVxuICAgICAgLnkwKCgpID0+IHRoaXMueVNjYWxlLnJhbmdlKClbMF0pXG4gICAgICAueTEoZCA9PiB0aGlzLnlTY2FsZShkLnZhbHVlKSlcbiAgICAgIC5jdXJ2ZSh0aGlzLmN1cnZlKTtcbiAgfVxuXG4gIHNvcnREYXRhKGRhdGEpIHtcbiAgICBpZiAodGhpcy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5MaW5lYXIpIHtcbiAgICAgIGRhdGEgPSBzb3J0TGluZWFyKGRhdGEsICduYW1lJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLlRpbWUpIHtcbiAgICAgIGRhdGEgPSBzb3J0QnlUaW1lKGRhdGEsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEgPSBzb3J0QnlEb21haW4oZGF0YSwgJ25hbWUnLCAnYXNjJywgdGhpcy54U2NhbGUuZG9tYWluKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgdXBkYXRlR3JhZGllbnRzKCkge1xuICAgIGlmICh0aGlzLmNvbG9ycy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5MaW5lYXIpIHtcbiAgICAgIHRoaXMuaGFzR3JhZGllbnQgPSB0cnVlO1xuICAgICAgdGhpcy5ncmFkaWVudElkID0gJ2dyYWQnICsgaWQoKS50b1N0cmluZygpO1xuICAgICAgdGhpcy5ncmFkaWVudFVybCA9IGB1cmwoIyR7dGhpcy5ncmFkaWVudElkfSlgO1xuICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy5kYXRhLnNlcmllcy5tYXAoZCA9PiBkLnZhbHVlKTtcbiAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLnZhbHVlcyk7XG4gICAgICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi52YWx1ZXMpO1xuICAgICAgdGhpcy5ncmFkaWVudFN0b3BzID0gdGhpcy5jb2xvcnMuZ2V0TGluZWFyR3JhZGllbnRTdG9wcyhtYXgsIG1pbik7XG4gICAgICB0aGlzLmFyZWFHcmFkaWVudFN0b3BzID0gdGhpcy5jb2xvcnMuZ2V0TGluZWFyR3JhZGllbnRTdG9wcyhtYXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhc0dyYWRpZW50ID0gZmFsc2U7XG4gICAgICB0aGlzLmdyYWRpZW50U3RvcHMgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmFyZWFHcmFkaWVudFN0b3BzID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGlzQWN0aXZlKGVudHJ5KTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZUVudHJpZXMpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBpdGVtID0gdGhpcy5hY3RpdmVFbnRyaWVzLmZpbmQoZCA9PiB7XG4gICAgICByZXR1cm4gZW50cnkubmFtZSA9PT0gZC5uYW1lO1xuICAgIH0pO1xuICAgIHJldHVybiBpdGVtICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBpc0luYWN0aXZlKGVudHJ5KTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZUVudHJpZXMgfHwgdGhpcy5hY3RpdmVFbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmFjdGl2ZUVudHJpZXMuZmluZChkID0+IHtcbiAgICAgIHJldHVybiBlbnRyeS5uYW1lID09PSBkLm5hbWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZW0gPT09IHVuZGVmaW5lZDtcbiAgfVxufVxuIl19