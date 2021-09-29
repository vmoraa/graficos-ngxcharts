import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { formatLabel, escapeLabel } from '../common/label.helper';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
import { BarChartType } from './types/bar-chart-type.enum';
import { D0Types } from './types/d0-type.enum';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { ScaleType } from '../common/types/scale-type.enum';
export class SeriesHorizontal {
    constructor() {
        this.type = BarChartType.Standard;
        this.tooltipDisabled = false;
        this.animations = true;
        this.showDataLabel = false;
        this.noBarWhenZero = true;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.dataLabelWidthChanged = new EventEmitter();
        this.barsForDataLabels = [];
        this.barOrientation = BarOrientation;
    }
    ngOnChanges(changes) {
        this.update();
    }
    update() {
        this.updateTooltipSettings();
        const d0 = {
            [D0Types.positive]: 0,
            [D0Types.negative]: 0
        };
        let d0Type;
        d0Type = D0Types.positive;
        let total;
        if (this.type === BarChartType.Normalized) {
            total = this.series.map(d => d.value).reduce((sum, d) => sum + d, 0);
        }
        const xScaleMin = Math.max(this.xScale.domain()[0], 0);
        this.bars = this.series.map(d => {
            let value = d.value;
            const label = this.getLabel(d);
            const formattedLabel = formatLabel(label);
            const roundEdges = this.roundEdges;
            d0Type = value > 0 ? D0Types.positive : D0Types.negative;
            const bar = {
                value,
                label,
                roundEdges,
                data: d,
                formattedLabel
            };
            bar.height = this.yScale.bandwidth();
            if (this.type === BarChartType.Standard) {
                bar.width = Math.abs(this.xScale(value) - this.xScale(xScaleMin));
                if (value < 0) {
                    bar.x = this.xScale(value);
                }
                else {
                    bar.x = this.xScale(xScaleMin);
                }
                bar.y = this.yScale(label);
            }
            else if (this.type === BarChartType.Stacked) {
                const offset0 = d0[d0Type];
                const offset1 = offset0 + value;
                d0[d0Type] += value;
                bar.width = this.xScale(offset1) - this.xScale(offset0);
                bar.x = this.xScale(offset0);
                bar.y = 0;
                bar.offset0 = offset0;
                bar.offset1 = offset1;
            }
            else if (this.type === BarChartType.Normalized) {
                let offset0 = d0[d0Type];
                let offset1 = offset0 + value;
                d0[d0Type] += value;
                if (total > 0) {
                    offset0 = (offset0 * 100) / total;
                    offset1 = (offset1 * 100) / total;
                }
                else {
                    offset0 = 0;
                    offset1 = 0;
                }
                bar.width = this.xScale(offset1) - this.xScale(offset0);
                bar.x = this.xScale(offset0);
                bar.y = 0;
                bar.offset0 = offset0;
                bar.offset1 = offset1;
                value = (offset1 - offset0).toFixed(2) + '%';
            }
            if (this.colors.scaleType === ScaleType.Ordinal) {
                bar.color = this.colors.getColor(label);
            }
            else {
                if (this.type === BarChartType.Standard) {
                    bar.color = this.colors.getColor(value);
                    bar.gradientStops = this.colors.getLinearGradientStops(value);
                }
                else {
                    bar.color = this.colors.getColor(bar.offset1);
                    bar.gradientStops = this.colors.getLinearGradientStops(bar.offset1, bar.offset0);
                }
            }
            let tooltipLabel = formattedLabel;
            bar.ariaLabel = formattedLabel + ' ' + value.toLocaleString();
            if (this.seriesName !== null && this.seriesName !== undefined) {
                tooltipLabel = `${this.seriesName} • ${formattedLabel}`;
                bar.data.series = this.seriesName;
                bar.ariaLabel = this.seriesName + ' ' + bar.ariaLabel;
            }
            bar.tooltipText = this.tooltipDisabled
                ? undefined
                : `
        <span class="tooltip-label">${escapeLabel(tooltipLabel)}</span>
        <span class="tooltip-val">${this.dataLabelFormatting ? this.dataLabelFormatting(value) : value.toLocaleString()}</span>
      `;
            return bar;
        });
        this.updateDataLabels();
    }
    updateDataLabels() {
        if (this.type === BarChartType.Stacked) {
            this.barsForDataLabels = [];
            const section = {};
            section.series = this.seriesName;
            const totalPositive = this.series.map(d => d.value).reduce((sum, d) => (d > 0 ? sum + d : sum), 0);
            const totalNegative = this.series.map(d => d.value).reduce((sum, d) => (d < 0 ? sum + d : sum), 0);
            section.total = totalPositive + totalNegative;
            section.x = 0;
            section.y = 0;
            // if total is positive then we show it on the right, otherwise on the left
            if (section.total > 0) {
                section.width = this.xScale(totalPositive);
            }
            else {
                section.width = this.xScale(totalNegative);
            }
            section.height = this.yScale.bandwidth();
            this.barsForDataLabels.push(section);
        }
        else {
            this.barsForDataLabels = this.series.map(d => {
                var _a;
                const section = {};
                section.series = (_a = this.seriesName) !== null && _a !== void 0 ? _a : d.label;
                section.total = d.value;
                section.x = this.xScale(0);
                section.y = this.yScale(d.label);
                section.width = this.xScale(section.total) - this.xScale(0);
                section.height = this.yScale.bandwidth();
                return section;
            });
        }
    }
    updateTooltipSettings() {
        this.tooltipPlacement = this.tooltipDisabled ? undefined : PlacementTypes.Top;
        this.tooltipType = this.tooltipDisabled ? undefined : StyleTypes.tooltip;
    }
    isActive(entry) {
        if (!this.activeEntries)
            return false;
        const item = this.activeEntries.find(active => {
            return entry.name === active.name && entry.value === active.value;
        });
        return item !== undefined;
    }
    getLabel(dataItem) {
        if (dataItem.label) {
            return dataItem.label;
        }
        return dataItem.name;
    }
    trackBy(index, bar) {
        return bar.label;
    }
    trackDataLabelBy(index, barLabel) {
        return index + '#' + barLabel.series + '#' + barLabel.total;
    }
    click(data) {
        this.select.emit(data);
    }
}
SeriesHorizontal.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-series-horizontal]',
                template: `
    <svg:g
      ngx-charts-bar
      *ngFor="let bar of bars; trackBy: trackBy"
      [@animationState]="'active'"
      [width]="bar.width"
      [height]="bar.height"
      [x]="bar.x"
      [y]="bar.y"
      [fill]="bar.color"
      [stops]="bar.gradientStops"
      [data]="bar.data"
      [orientation]="barOrientation.Horizontal"
      [roundEdges]="bar.roundEdges"
      (select)="click($event)"
      [gradient]="gradient"
      [isActive]="isActive(bar.data)"
      [ariaLabel]="bar.ariaLabel"
      [animations]="animations"
      (activate)="activate.emit($event)"
      (deactivate)="deactivate.emit($event)"
      ngx-tooltip
      [tooltipDisabled]="tooltipDisabled"
      [tooltipPlacement]="tooltipPlacement"
      [tooltipType]="tooltipType"
      [tooltipTitle]="tooltipTemplate ? undefined : bar.tooltipText"
      [tooltipTemplate]="tooltipTemplate"
      [tooltipContext]="bar.data"
      [noBarWhenZero]="noBarWhenZero"
    ></svg:g>
    <svg:g *ngIf="showDataLabel">
      <svg:g
        ngx-charts-bar-label
        *ngFor="let b of barsForDataLabels; let i = index; trackBy: trackDataLabelBy"
        [barX]="b.x"
        [barY]="b.y"
        [barWidth]="b.width"
        [barHeight]="b.height"
        [value]="b.total"
        [valueFormatting]="dataLabelFormatting"
        [orientation]="barOrientation.Horizontal"
        (dimensionsChanged)="dataLabelWidthChanged.emit({ size: $event, index: i })"
      />
    </svg:g>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                animations: [
                    trigger('animationState', [
                        transition(':leave', [
                            style({
                                opacity: 1
                            }),
                            animate(500, style({ opacity: 0 }))
                        ])
                    ])
                ]
            },] }
];
SeriesHorizontal.propDecorators = {
    dims: [{ type: Input }],
    type: [{ type: Input }],
    series: [{ type: Input }],
    xScale: [{ type: Input }],
    yScale: [{ type: Input }],
    colors: [{ type: Input }],
    tooltipDisabled: [{ type: Input }],
    gradient: [{ type: Input }],
    activeEntries: [{ type: Input }],
    seriesName: [{ type: Input }],
    tooltipTemplate: [{ type: Input }],
    roundEdges: [{ type: Input }],
    animations: [{ type: Input }],
    showDataLabel: [{ type: Input }],
    dataLabelFormatting: [{ type: Input }],
    noBarWhenZero: [{ type: Input }],
    select: [{ type: Output }],
    activate: [{ type: Output }],
    deactivate: [{ type: Output }],
    dataLabelWidthChanged: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzLWhvcml6b250YWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvc3dpbWxhbmUvbmd4LWNoYXJ0cy9zcmMvbGliL2Jhci1jaGFydC9zZXJpZXMtaG9yaXpvbnRhbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWix1QkFBdUIsRUFFeEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFHbEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFM0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRS9DLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUE2RDVELE1BQU0sT0FBTyxnQkFBZ0I7SUEzRDdCO1FBNkRXLFNBQUksR0FBaUIsWUFBWSxDQUFDLFFBQVEsQ0FBQztRQUszQyxvQkFBZSxHQUFZLEtBQUssQ0FBQztRQU1qQyxlQUFVLEdBQVksSUFBSSxDQUFDO1FBQzNCLGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBRS9CLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBRTdCLFdBQU0sR0FBMkIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNwRCxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM5QixlQUFVLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNoQywwQkFBcUIsR0FBRyxJQUFJLFlBQVksRUFBa0MsQ0FBQztRQUtyRixzQkFBaUIsR0FBa0csRUFBRSxDQUFDO1FBRXRILG1CQUFjLEdBQUcsY0FBYyxDQUFDO0lBZ0xsQyxDQUFDO0lBOUtDLFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM3QixNQUFNLEVBQUUsR0FBRztZQUNULENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDckIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztTQUN0QixDQUFDO1FBQ0YsSUFBSSxNQUFlLENBQUM7UUFDcEIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDMUIsSUFBSSxLQUFLLENBQUM7UUFDVixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLFVBQVUsRUFBRTtZQUN6QyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUUsR0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMvRTtRQUNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzlCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFZLENBQUM7WUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNuQyxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUV6RCxNQUFNLEdBQUcsR0FBUTtnQkFDZixLQUFLO2dCQUNMLEtBQUs7Z0JBQ0wsVUFBVTtnQkFDVixJQUFJLEVBQUUsQ0FBQztnQkFDUCxjQUFjO2FBQ2YsQ0FBQztZQUVGLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVyQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLFFBQVEsRUFBRTtnQkFDdkMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7b0JBQ2IsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM1QjtxQkFBTTtvQkFDTCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ2hDO2dCQUNELEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1QjtpQkFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLE9BQU8sRUFBRTtnQkFDN0MsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQixNQUFNLE9BQU8sR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNoQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUVwQixHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEQsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDVixHQUFHLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDdEIsR0FBRyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7YUFDdkI7aUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekIsSUFBSSxPQUFPLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDOUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQztnQkFFcEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO29CQUNiLE9BQU8sR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7b0JBQ2xDLE9BQU8sR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ25DO3FCQUFNO29CQUNMLE9BQU8sR0FBRyxDQUFDLENBQUM7b0JBQ1osT0FBTyxHQUFHLENBQUMsQ0FBQztpQkFDYjtnQkFFRCxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEQsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDVixHQUFHLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDdEIsR0FBRyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQ3RCLEtBQUssR0FBRyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQzlDO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUMsT0FBTyxFQUFFO2dCQUMvQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3pDO2lCQUFNO2dCQUNMLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsUUFBUSxFQUFFO29CQUN2QyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN4QyxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQy9EO3FCQUFNO29CQUNMLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QyxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ2xGO2FBQ0Y7WUFFRCxJQUFJLFlBQVksR0FBRyxjQUFjLENBQUM7WUFDbEMsR0FBRyxDQUFDLFNBQVMsR0FBRyxjQUFjLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM5RCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUM3RCxZQUFZLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxNQUFNLGNBQWMsRUFBRSxDQUFDO2dCQUN4RCxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUNsQyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7YUFDdkQ7WUFFRCxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlO2dCQUNwQyxDQUFDLENBQUMsU0FBUztnQkFDWCxDQUFDLENBQUM7c0NBQzRCLFdBQVcsQ0FBQyxZQUFZLENBQUM7b0NBRXJELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUNuRjtPQUNELENBQUM7WUFFRixPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELGdCQUFnQjtRQUNkLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFDNUIsTUFBTSxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNqQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25HLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkcsT0FBTyxDQUFDLEtBQUssR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCwyRUFBMkU7WUFDM0UsSUFBSSxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtnQkFDckIsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUM1QztZQUNELE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3RDO2FBQU07WUFDTCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7O2dCQUMzQyxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBQSxJQUFJLENBQUMsVUFBVSxtQ0FBSSxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3pDLE9BQU8sT0FBTyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQscUJBQXFCO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7UUFDOUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFDM0UsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFlO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRXRDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVDLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQztJQUM1QixDQUFDO0lBRUQsUUFBUSxDQUFDLFFBQWtCO1FBQ3pCLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtZQUNsQixPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUM7U0FDdkI7UUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFhLEVBQUUsR0FBUTtRQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDbkIsQ0FBQztJQUVELGdCQUFnQixDQUFDLEtBQWEsRUFBRSxRQUFhO1FBQzNDLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQzlELENBQUM7SUFFRCxLQUFLLENBQUMsSUFBYztRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDOzs7WUF0UUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxpQ0FBaUM7Z0JBQzNDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Q1Q7Z0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLFVBQVUsRUFBRTtvQkFDVixPQUFPLENBQUMsZ0JBQWdCLEVBQUU7d0JBQ3hCLFVBQVUsQ0FBQyxRQUFRLEVBQUU7NEJBQ25CLEtBQUssQ0FBQztnQ0FDSixPQUFPLEVBQUUsQ0FBQzs2QkFDWCxDQUFDOzRCQUNGLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQ3BDLENBQUM7cUJBQ0gsQ0FBQztpQkFDSDthQUNGOzs7bUJBRUUsS0FBSzttQkFDTCxLQUFLO3FCQUNMLEtBQUs7cUJBQ0wsS0FBSztxQkFDTCxLQUFLO3FCQUNMLEtBQUs7OEJBQ0wsS0FBSzt1QkFDTCxLQUFLOzRCQUNMLEtBQUs7eUJBQ0wsS0FBSzs4QkFDTCxLQUFLO3lCQUNMLEtBQUs7eUJBQ0wsS0FBSzs0QkFDTCxLQUFLO2tDQUNMLEtBQUs7NEJBQ0wsS0FBSztxQkFFTCxNQUFNO3VCQUNOLE1BQU07eUJBQ04sTUFBTTtvQ0FDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIFRlbXBsYXRlUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgdHJpZ2dlciwgc3R5bGUsIGFuaW1hdGUsIHRyYW5zaXRpb24gfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7IGZvcm1hdExhYmVsLCBlc2NhcGVMYWJlbCB9IGZyb20gJy4uL2NvbW1vbi9sYWJlbC5oZWxwZXInO1xuaW1wb3J0IHsgRGF0YUl0ZW0sIFN0cmluZ09yTnVtYmVyT3JEYXRlIH0gZnJvbSAnLi4vbW9kZWxzL2NoYXJ0LWRhdGEubW9kZWwnO1xuaW1wb3J0IHsgQ29sb3JIZWxwZXIgfSBmcm9tICcuLi9jb21tb24vY29sb3IuaGVscGVyJztcbmltcG9ydCB7IFBsYWNlbWVudFR5cGVzIH0gZnJvbSAnLi4vY29tbW9uL3Rvb2x0aXAvcG9zaXRpb24nO1xuaW1wb3J0IHsgU3R5bGVUeXBlcyB9IGZyb20gJy4uL2NvbW1vbi90b29sdGlwL3N0eWxlLnR5cGUnO1xuaW1wb3J0IHsgQmFyQ2hhcnRUeXBlIH0gZnJvbSAnLi90eXBlcy9iYXItY2hhcnQtdHlwZS5lbnVtJztcbmltcG9ydCB7IEJhciB9IGZyb20gJy4vdHlwZXMvYmFyLm1vZGVsJztcbmltcG9ydCB7IEQwVHlwZXMgfSBmcm9tICcuL3R5cGVzL2QwLXR5cGUuZW51bSc7XG5pbXBvcnQgeyBWaWV3RGltZW5zaW9ucyB9IGZyb20gJy4uL2NvbW1vbi90eXBlcy92aWV3LWRpbWVuc2lvbi5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgQmFyT3JpZW50YXRpb24gfSBmcm9tICcuLi9jb21tb24vdHlwZXMvYmFyLW9yaWVudGF0aW9uLmVudW0nO1xuaW1wb3J0IHsgU2NhbGVUeXBlIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL3NjYWxlLXR5cGUuZW51bSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dbbmd4LWNoYXJ0cy1zZXJpZXMtaG9yaXpvbnRhbF0nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxzdmc6Z1xuICAgICAgbmd4LWNoYXJ0cy1iYXJcbiAgICAgICpuZ0Zvcj1cImxldCBiYXIgb2YgYmFyczsgdHJhY2tCeTogdHJhY2tCeVwiXG4gICAgICBbQGFuaW1hdGlvblN0YXRlXT1cIidhY3RpdmUnXCJcbiAgICAgIFt3aWR0aF09XCJiYXIud2lkdGhcIlxuICAgICAgW2hlaWdodF09XCJiYXIuaGVpZ2h0XCJcbiAgICAgIFt4XT1cImJhci54XCJcbiAgICAgIFt5XT1cImJhci55XCJcbiAgICAgIFtmaWxsXT1cImJhci5jb2xvclwiXG4gICAgICBbc3RvcHNdPVwiYmFyLmdyYWRpZW50U3RvcHNcIlxuICAgICAgW2RhdGFdPVwiYmFyLmRhdGFcIlxuICAgICAgW29yaWVudGF0aW9uXT1cImJhck9yaWVudGF0aW9uLkhvcml6b250YWxcIlxuICAgICAgW3JvdW5kRWRnZXNdPVwiYmFyLnJvdW5kRWRnZXNcIlxuICAgICAgKHNlbGVjdCk9XCJjbGljaygkZXZlbnQpXCJcbiAgICAgIFtncmFkaWVudF09XCJncmFkaWVudFwiXG4gICAgICBbaXNBY3RpdmVdPVwiaXNBY3RpdmUoYmFyLmRhdGEpXCJcbiAgICAgIFthcmlhTGFiZWxdPVwiYmFyLmFyaWFMYWJlbFwiXG4gICAgICBbYW5pbWF0aW9uc109XCJhbmltYXRpb25zXCJcbiAgICAgIChhY3RpdmF0ZSk9XCJhY3RpdmF0ZS5lbWl0KCRldmVudClcIlxuICAgICAgKGRlYWN0aXZhdGUpPVwiZGVhY3RpdmF0ZS5lbWl0KCRldmVudClcIlxuICAgICAgbmd4LXRvb2x0aXBcbiAgICAgIFt0b29sdGlwRGlzYWJsZWRdPVwidG9vbHRpcERpc2FibGVkXCJcbiAgICAgIFt0b29sdGlwUGxhY2VtZW50XT1cInRvb2x0aXBQbGFjZW1lbnRcIlxuICAgICAgW3Rvb2x0aXBUeXBlXT1cInRvb2x0aXBUeXBlXCJcbiAgICAgIFt0b29sdGlwVGl0bGVdPVwidG9vbHRpcFRlbXBsYXRlID8gdW5kZWZpbmVkIDogYmFyLnRvb2x0aXBUZXh0XCJcbiAgICAgIFt0b29sdGlwVGVtcGxhdGVdPVwidG9vbHRpcFRlbXBsYXRlXCJcbiAgICAgIFt0b29sdGlwQ29udGV4dF09XCJiYXIuZGF0YVwiXG4gICAgICBbbm9CYXJXaGVuWmVyb109XCJub0JhcldoZW5aZXJvXCJcbiAgICA+PC9zdmc6Zz5cbiAgICA8c3ZnOmcgKm5nSWY9XCJzaG93RGF0YUxhYmVsXCI+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgbmd4LWNoYXJ0cy1iYXItbGFiZWxcbiAgICAgICAgKm5nRm9yPVwibGV0IGIgb2YgYmFyc0ZvckRhdGFMYWJlbHM7IGxldCBpID0gaW5kZXg7IHRyYWNrQnk6IHRyYWNrRGF0YUxhYmVsQnlcIlxuICAgICAgICBbYmFyWF09XCJiLnhcIlxuICAgICAgICBbYmFyWV09XCJiLnlcIlxuICAgICAgICBbYmFyV2lkdGhdPVwiYi53aWR0aFwiXG4gICAgICAgIFtiYXJIZWlnaHRdPVwiYi5oZWlnaHRcIlxuICAgICAgICBbdmFsdWVdPVwiYi50b3RhbFwiXG4gICAgICAgIFt2YWx1ZUZvcm1hdHRpbmddPVwiZGF0YUxhYmVsRm9ybWF0dGluZ1wiXG4gICAgICAgIFtvcmllbnRhdGlvbl09XCJiYXJPcmllbnRhdGlvbi5Ib3Jpem9udGFsXCJcbiAgICAgICAgKGRpbWVuc2lvbnNDaGFuZ2VkKT1cImRhdGFMYWJlbFdpZHRoQ2hhbmdlZC5lbWl0KHsgc2l6ZTogJGV2ZW50LCBpbmRleDogaSB9KVwiXG4gICAgICAvPlxuICAgIDwvc3ZnOmc+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBhbmltYXRpb25zOiBbXG4gICAgdHJpZ2dlcignYW5pbWF0aW9uU3RhdGUnLCBbXG4gICAgICB0cmFuc2l0aW9uKCc6bGVhdmUnLCBbXG4gICAgICAgIHN0eWxlKHtcbiAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0pLFxuICAgICAgICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKVxuICAgICAgXSlcbiAgICBdKVxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFNlcmllc0hvcml6b250YWwgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBASW5wdXQoKSBkaW1zOiBWaWV3RGltZW5zaW9ucztcbiAgQElucHV0KCkgdHlwZTogQmFyQ2hhcnRUeXBlID0gQmFyQ2hhcnRUeXBlLlN0YW5kYXJkO1xuICBASW5wdXQoKSBzZXJpZXM6IERhdGFJdGVtW107XG4gIEBJbnB1dCgpIHhTY2FsZTtcbiAgQElucHV0KCkgeVNjYWxlO1xuICBASW5wdXQoKSBjb2xvcnM6IENvbG9ySGVscGVyO1xuICBASW5wdXQoKSB0b29sdGlwRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgZ3JhZGllbnQ6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGFjdGl2ZUVudHJpZXM6IERhdGFJdGVtW107XG4gIEBJbnB1dCgpIHNlcmllc05hbWU6IFN0cmluZ09yTnVtYmVyT3JEYXRlO1xuICBASW5wdXQoKSB0b29sdGlwVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gIEBJbnB1dCgpIHJvdW5kRWRnZXM6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGFuaW1hdGlvbnM6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBzaG93RGF0YUxhYmVsOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGRhdGFMYWJlbEZvcm1hdHRpbmc6IGFueTtcbiAgQElucHV0KCkgbm9CYXJXaGVuWmVybzogYm9vbGVhbiA9IHRydWU7XG5cbiAgQE91dHB1dCgpIHNlbGVjdDogRXZlbnRFbWl0dGVyPERhdGFJdGVtPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGFjdGl2YXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZGVhY3RpdmF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGRhdGFMYWJlbFdpZHRoQ2hhbmdlZCA9IG5ldyBFdmVudEVtaXR0ZXI8eyBzaXplOiBFdmVudDsgaW5kZXg6IG51bWJlciB9PigpO1xuXG4gIHRvb2x0aXBQbGFjZW1lbnQ6IFBsYWNlbWVudFR5cGVzO1xuICB0b29sdGlwVHlwZTogU3R5bGVUeXBlcztcbiAgYmFyczogQmFyW107XG4gIGJhcnNGb3JEYXRhTGFiZWxzOiBBcnJheTx7IHg6IG51bWJlcjsgeTogbnVtYmVyOyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlcjsgdG90YWw6IG51bWJlcjsgc2VyaWVzOiBzdHJpbmcgfT4gPSBbXTtcblxuICBiYXJPcmllbnRhdGlvbiA9IEJhck9yaWVudGF0aW9uO1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlVG9vbHRpcFNldHRpbmdzKCk7XG4gICAgY29uc3QgZDAgPSB7XG4gICAgICBbRDBUeXBlcy5wb3NpdGl2ZV06IDAsXG4gICAgICBbRDBUeXBlcy5uZWdhdGl2ZV06IDBcbiAgICB9O1xuICAgIGxldCBkMFR5cGU6IEQwVHlwZXM7XG4gICAgZDBUeXBlID0gRDBUeXBlcy5wb3NpdGl2ZTtcbiAgICBsZXQgdG90YWw7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gQmFyQ2hhcnRUeXBlLk5vcm1hbGl6ZWQpIHtcbiAgICAgIHRvdGFsID0gdGhpcy5zZXJpZXMubWFwKGQgPT4gZC52YWx1ZSkucmVkdWNlKChzdW0sIGQpID0+IChzdW0gYXMgYW55KSArIGQsIDApO1xuICAgIH1cbiAgICBjb25zdCB4U2NhbGVNaW4gPSBNYXRoLm1heCh0aGlzLnhTY2FsZS5kb21haW4oKVswXSwgMCk7XG5cbiAgICB0aGlzLmJhcnMgPSB0aGlzLnNlcmllcy5tYXAoZCA9PiB7XG4gICAgICBsZXQgdmFsdWUgPSBkLnZhbHVlIGFzIGFueTtcbiAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRMYWJlbChkKTtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZExhYmVsID0gZm9ybWF0TGFiZWwobGFiZWwpO1xuICAgICAgY29uc3Qgcm91bmRFZGdlcyA9IHRoaXMucm91bmRFZGdlcztcbiAgICAgIGQwVHlwZSA9IHZhbHVlID4gMCA/IEQwVHlwZXMucG9zaXRpdmUgOiBEMFR5cGVzLm5lZ2F0aXZlO1xuXG4gICAgICBjb25zdCBiYXI6IGFueSA9IHtcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGxhYmVsLFxuICAgICAgICByb3VuZEVkZ2VzLFxuICAgICAgICBkYXRhOiBkLFxuICAgICAgICBmb3JtYXR0ZWRMYWJlbFxuICAgICAgfTtcblxuICAgICAgYmFyLmhlaWdodCA9IHRoaXMueVNjYWxlLmJhbmR3aWR0aCgpO1xuXG4gICAgICBpZiAodGhpcy50eXBlID09PSBCYXJDaGFydFR5cGUuU3RhbmRhcmQpIHtcbiAgICAgICAgYmFyLndpZHRoID0gTWF0aC5hYnModGhpcy54U2NhbGUodmFsdWUpIC0gdGhpcy54U2NhbGUoeFNjYWxlTWluKSk7XG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICBiYXIueCA9IHRoaXMueFNjYWxlKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYXIueCA9IHRoaXMueFNjYWxlKHhTY2FsZU1pbik7XG4gICAgICAgIH1cbiAgICAgICAgYmFyLnkgPSB0aGlzLnlTY2FsZShsYWJlbCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gQmFyQ2hhcnRUeXBlLlN0YWNrZWQpIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0MCA9IGQwW2QwVHlwZV07XG4gICAgICAgIGNvbnN0IG9mZnNldDEgPSBvZmZzZXQwICsgdmFsdWU7XG4gICAgICAgIGQwW2QwVHlwZV0gKz0gdmFsdWU7XG5cbiAgICAgICAgYmFyLndpZHRoID0gdGhpcy54U2NhbGUob2Zmc2V0MSkgLSB0aGlzLnhTY2FsZShvZmZzZXQwKTtcbiAgICAgICAgYmFyLnggPSB0aGlzLnhTY2FsZShvZmZzZXQwKTtcbiAgICAgICAgYmFyLnkgPSAwO1xuICAgICAgICBiYXIub2Zmc2V0MCA9IG9mZnNldDA7XG4gICAgICAgIGJhci5vZmZzZXQxID0gb2Zmc2V0MTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSBCYXJDaGFydFR5cGUuTm9ybWFsaXplZCkge1xuICAgICAgICBsZXQgb2Zmc2V0MCA9IGQwW2QwVHlwZV07XG4gICAgICAgIGxldCBvZmZzZXQxID0gb2Zmc2V0MCArIHZhbHVlO1xuICAgICAgICBkMFtkMFR5cGVdICs9IHZhbHVlO1xuXG4gICAgICAgIGlmICh0b3RhbCA+IDApIHtcbiAgICAgICAgICBvZmZzZXQwID0gKG9mZnNldDAgKiAxMDApIC8gdG90YWw7XG4gICAgICAgICAgb2Zmc2V0MSA9IChvZmZzZXQxICogMTAwKSAvIHRvdGFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZnNldDAgPSAwO1xuICAgICAgICAgIG9mZnNldDEgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgYmFyLndpZHRoID0gdGhpcy54U2NhbGUob2Zmc2V0MSkgLSB0aGlzLnhTY2FsZShvZmZzZXQwKTtcbiAgICAgICAgYmFyLnggPSB0aGlzLnhTY2FsZShvZmZzZXQwKTtcbiAgICAgICAgYmFyLnkgPSAwO1xuICAgICAgICBiYXIub2Zmc2V0MCA9IG9mZnNldDA7XG4gICAgICAgIGJhci5vZmZzZXQxID0gb2Zmc2V0MTtcbiAgICAgICAgdmFsdWUgPSAob2Zmc2V0MSAtIG9mZnNldDApLnRvRml4ZWQoMikgKyAnJSc7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbG9ycy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5PcmRpbmFsKSB7XG4gICAgICAgIGJhci5jb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKGxhYmVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09IEJhckNoYXJ0VHlwZS5TdGFuZGFyZCkge1xuICAgICAgICAgIGJhci5jb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKHZhbHVlKTtcbiAgICAgICAgICBiYXIuZ3JhZGllbnRTdG9wcyA9IHRoaXMuY29sb3JzLmdldExpbmVhckdyYWRpZW50U3RvcHModmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhci5jb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKGJhci5vZmZzZXQxKTtcbiAgICAgICAgICBiYXIuZ3JhZGllbnRTdG9wcyA9IHRoaXMuY29sb3JzLmdldExpbmVhckdyYWRpZW50U3RvcHMoYmFyLm9mZnNldDEsIGJhci5vZmZzZXQwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgdG9vbHRpcExhYmVsID0gZm9ybWF0dGVkTGFiZWw7XG4gICAgICBiYXIuYXJpYUxhYmVsID0gZm9ybWF0dGVkTGFiZWwgKyAnICcgKyB2YWx1ZS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgaWYgKHRoaXMuc2VyaWVzTmFtZSAhPT0gbnVsbCAmJiB0aGlzLnNlcmllc05hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0b29sdGlwTGFiZWwgPSBgJHt0aGlzLnNlcmllc05hbWV9IOKAoiAke2Zvcm1hdHRlZExhYmVsfWA7XG4gICAgICAgIGJhci5kYXRhLnNlcmllcyA9IHRoaXMuc2VyaWVzTmFtZTtcbiAgICAgICAgYmFyLmFyaWFMYWJlbCA9IHRoaXMuc2VyaWVzTmFtZSArICcgJyArIGJhci5hcmlhTGFiZWw7XG4gICAgICB9XG5cbiAgICAgIGJhci50b29sdGlwVGV4dCA9IHRoaXMudG9vbHRpcERpc2FibGVkXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogYFxuICAgICAgICA8c3BhbiBjbGFzcz1cInRvb2x0aXAtbGFiZWxcIj4ke2VzY2FwZUxhYmVsKHRvb2x0aXBMYWJlbCl9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInRvb2x0aXAtdmFsXCI+JHtcbiAgICAgICAgICB0aGlzLmRhdGFMYWJlbEZvcm1hdHRpbmcgPyB0aGlzLmRhdGFMYWJlbEZvcm1hdHRpbmcodmFsdWUpIDogdmFsdWUudG9Mb2NhbGVTdHJpbmcoKVxuICAgICAgICB9PC9zcGFuPlxuICAgICAgYDtcblxuICAgICAgcmV0dXJuIGJhcjtcbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlRGF0YUxhYmVscygpO1xuICB9XG5cbiAgdXBkYXRlRGF0YUxhYmVscygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy50eXBlID09PSBCYXJDaGFydFR5cGUuU3RhY2tlZCkge1xuICAgICAgdGhpcy5iYXJzRm9yRGF0YUxhYmVscyA9IFtdO1xuICAgICAgY29uc3Qgc2VjdGlvbjogYW55ID0ge307XG4gICAgICBzZWN0aW9uLnNlcmllcyA9IHRoaXMuc2VyaWVzTmFtZTtcbiAgICAgIGNvbnN0IHRvdGFsUG9zaXRpdmUgPSB0aGlzLnNlcmllcy5tYXAoZCA9PiBkLnZhbHVlKS5yZWR1Y2UoKHN1bSwgZCkgPT4gKGQgPiAwID8gc3VtICsgZCA6IHN1bSksIDApO1xuICAgICAgY29uc3QgdG90YWxOZWdhdGl2ZSA9IHRoaXMuc2VyaWVzLm1hcChkID0+IGQudmFsdWUpLnJlZHVjZSgoc3VtLCBkKSA9PiAoZCA8IDAgPyBzdW0gKyBkIDogc3VtKSwgMCk7XG4gICAgICBzZWN0aW9uLnRvdGFsID0gdG90YWxQb3NpdGl2ZSArIHRvdGFsTmVnYXRpdmU7XG4gICAgICBzZWN0aW9uLnggPSAwO1xuICAgICAgc2VjdGlvbi55ID0gMDtcbiAgICAgIC8vIGlmIHRvdGFsIGlzIHBvc2l0aXZlIHRoZW4gd2Ugc2hvdyBpdCBvbiB0aGUgcmlnaHQsIG90aGVyd2lzZSBvbiB0aGUgbGVmdFxuICAgICAgaWYgKHNlY3Rpb24udG90YWwgPiAwKSB7XG4gICAgICAgIHNlY3Rpb24ud2lkdGggPSB0aGlzLnhTY2FsZSh0b3RhbFBvc2l0aXZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlY3Rpb24ud2lkdGggPSB0aGlzLnhTY2FsZSh0b3RhbE5lZ2F0aXZlKTtcbiAgICAgIH1cbiAgICAgIHNlY3Rpb24uaGVpZ2h0ID0gdGhpcy55U2NhbGUuYmFuZHdpZHRoKCk7XG4gICAgICB0aGlzLmJhcnNGb3JEYXRhTGFiZWxzLnB1c2goc2VjdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYmFyc0ZvckRhdGFMYWJlbHMgPSB0aGlzLnNlcmllcy5tYXAoZCA9PiB7XG4gICAgICAgIGNvbnN0IHNlY3Rpb246IGFueSA9IHt9O1xuICAgICAgICBzZWN0aW9uLnNlcmllcyA9IHRoaXMuc2VyaWVzTmFtZSA/PyBkLmxhYmVsO1xuICAgICAgICBzZWN0aW9uLnRvdGFsID0gZC52YWx1ZTtcbiAgICAgICAgc2VjdGlvbi54ID0gdGhpcy54U2NhbGUoMCk7XG4gICAgICAgIHNlY3Rpb24ueSA9IHRoaXMueVNjYWxlKGQubGFiZWwpO1xuICAgICAgICBzZWN0aW9uLndpZHRoID0gdGhpcy54U2NhbGUoc2VjdGlvbi50b3RhbCkgLSB0aGlzLnhTY2FsZSgwKTtcbiAgICAgICAgc2VjdGlvbi5oZWlnaHQgPSB0aGlzLnlTY2FsZS5iYW5kd2lkdGgoKTtcbiAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVUb29sdGlwU2V0dGluZ3MoKTogdm9pZCB7XG4gICAgdGhpcy50b29sdGlwUGxhY2VtZW50ID0gdGhpcy50b29sdGlwRGlzYWJsZWQgPyB1bmRlZmluZWQgOiBQbGFjZW1lbnRUeXBlcy5Ub3A7XG4gICAgdGhpcy50b29sdGlwVHlwZSA9IHRoaXMudG9vbHRpcERpc2FibGVkID8gdW5kZWZpbmVkIDogU3R5bGVUeXBlcy50b29sdGlwO1xuICB9XG5cbiAgaXNBY3RpdmUoZW50cnk6IERhdGFJdGVtKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZUVudHJpZXMpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmFjdGl2ZUVudHJpZXMuZmluZChhY3RpdmUgPT4ge1xuICAgICAgcmV0dXJuIGVudHJ5Lm5hbWUgPT09IGFjdGl2ZS5uYW1lICYmIGVudHJ5LnZhbHVlID09PSBhY3RpdmUudmFsdWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaXRlbSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0TGFiZWwoZGF0YUl0ZW06IERhdGFJdGVtKTogU3RyaW5nT3JOdW1iZXJPckRhdGUge1xuICAgIGlmIChkYXRhSXRlbS5sYWJlbCkge1xuICAgICAgcmV0dXJuIGRhdGFJdGVtLmxhYmVsO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YUl0ZW0ubmFtZTtcbiAgfVxuXG4gIHRyYWNrQnkoaW5kZXg6IG51bWJlciwgYmFyOiBCYXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBiYXIubGFiZWw7XG4gIH1cblxuICB0cmFja0RhdGFMYWJlbEJ5KGluZGV4OiBudW1iZXIsIGJhckxhYmVsOiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiBpbmRleCArICcjJyArIGJhckxhYmVsLnNlcmllcyArICcjJyArIGJhckxhYmVsLnRvdGFsO1xuICB9XG5cbiAgY2xpY2soZGF0YTogRGF0YUl0ZW0pOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdC5lbWl0KGRhdGEpO1xuICB9XG59XG4iXX0=