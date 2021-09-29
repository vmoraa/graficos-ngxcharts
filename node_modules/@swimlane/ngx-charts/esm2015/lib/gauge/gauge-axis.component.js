import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { line } from 'd3-shape';
import { TextAnchor } from '../common/types/text-anchor.enum';
export class GaugeAxisComponent {
    constructor() {
        this.rotate = '';
    }
    ngOnChanges(changes) {
        this.update();
    }
    update() {
        this.rotationAngle = -90 + this.startAngle;
        this.rotate = `rotate(${this.rotationAngle})`;
        this.ticks = this.getTicks();
    }
    getTicks() {
        const bigTickSegment = this.angleSpan / this.bigSegments;
        const smallTickSegment = bigTickSegment / this.smallSegments;
        const tickLength = 20;
        const ticks = {
            big: [],
            small: []
        };
        const startDistance = this.radius + 10;
        const textDist = startDistance + tickLength + 10;
        for (let i = 0; i <= this.bigSegments; i++) {
            const angleDeg = i * bigTickSegment;
            const angle = (angleDeg * Math.PI) / 180;
            const textAnchor = this.getTextAnchor(angleDeg);
            let skip = false;
            if (i === 0 && this.angleSpan === 360) {
                skip = true;
            }
            if (!skip) {
                let text = Number.parseFloat(this.valueScale.invert(angleDeg).toString()).toLocaleString();
                if (this.tickFormatting) {
                    text = this.tickFormatting(text);
                }
                ticks.big.push({
                    line: this.getTickPath(startDistance, tickLength, angle),
                    textAnchor,
                    text,
                    textTransform: `
            translate(${textDist * Math.cos(angle)}, ${textDist * Math.sin(angle)}) rotate(${-this.rotationAngle})
          `
                });
            }
            if (i === this.bigSegments) {
                continue;
            }
            for (let j = 1; j <= this.smallSegments; j++) {
                const smallAngleDeg = angleDeg + j * smallTickSegment;
                const smallAngle = (smallAngleDeg * Math.PI) / 180;
                ticks.small.push({
                    line: this.getTickPath(startDistance, tickLength / 2, smallAngle)
                });
            }
        }
        return ticks;
    }
    getTextAnchor(angle) {
        // [0, 45] = 'middle';
        // [46, 135] = 'start';
        // [136, 225] = 'middle';
        // [226, 315] = 'end';
        angle = (this.startAngle + angle) % 360;
        let textAnchor = TextAnchor.Middle;
        if (angle > 45 && angle <= 135) {
            textAnchor = TextAnchor.Start;
        }
        else if (angle > 225 && angle <= 315) {
            textAnchor = TextAnchor.End;
        }
        return textAnchor;
    }
    getTickPath(startDistance, tickLength, angle) {
        const y1 = startDistance * Math.sin(angle);
        const y2 = (startDistance + tickLength) * Math.sin(angle);
        const x1 = startDistance * Math.cos(angle);
        const x2 = (startDistance + tickLength) * Math.cos(angle);
        const points = [
            { x: x1, y: y1 },
            { x: x2, y: y2 }
        ];
        const lineGenerator = line()
            .x(d => d.x)
            .y(d => d.y);
        return lineGenerator(points);
    }
}
GaugeAxisComponent.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-gauge-axis]',
                template: `
    <svg:g [attr.transform]="rotate">
      <svg:g *ngFor="let tick of ticks.big" class="gauge-tick gauge-tick-large">
        <svg:path [attr.d]="tick.line" />
      </svg:g>
      <svg:g *ngFor="let tick of ticks.big" class="gauge-tick gauge-tick-large">
        <svg:text
          [style.textAnchor]="tick.textAnchor"
          [attr.transform]="tick.textTransform"
          alignment-baseline="central"
        >
          {{ tick.text }}
        </svg:text>
      </svg:g>
      <svg:g *ngFor="let tick of ticks.small" class="gauge-tick gauge-tick-small">
        <svg:path [attr.d]="tick.line" />
      </svg:g>
    </svg:g>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
GaugeAxisComponent.propDecorators = {
    bigSegments: [{ type: Input }],
    smallSegments: [{ type: Input }],
    min: [{ type: Input }],
    max: [{ type: Input }],
    angleSpan: [{ type: Input }],
    startAngle: [{ type: Input }],
    radius: [{ type: Input }],
    valueScale: [{ type: Input }],
    tickFormatting: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F1Z2UtYXhpcy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtY2hhcnRzL3NyYy9saWIvZ2F1Z2UvZ2F1Z2UtYXhpcy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQTRCLHVCQUF1QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3BHLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBcUM5RCxNQUFNLE9BQU8sa0JBQWtCO0lBdkIvQjtRQW9DRSxXQUFNLEdBQVcsRUFBRSxDQUFDO0lBa0d0QixDQUFDO0lBaEdDLFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQztRQUM5QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQsUUFBUTtRQUNOLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6RCxNQUFNLGdCQUFnQixHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzdELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLEtBQUssR0FBRztZQUNaLEdBQUcsRUFBRSxFQUFFO1lBQ1AsS0FBSyxFQUFFLEVBQUU7U0FDVixDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQUcsSUFB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c0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2VzLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgbGluZSB9IGZyb20gJ2QzLXNoYXBlJztcbmltcG9ydCB7IFRleHRBbmNob3IgfSBmcm9tICcuLi9jb21tb24vdHlwZXMvdGV4dC1hbmNob3IuZW51bSc7XG5cbmludGVyZmFjZSBCaWcge1xuICBsaW5lOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgdGV4dEFuY2hvcjogc3RyaW5nO1xuICB0ZXh0VHJhbnNmb3JtOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBUaWNrcyB7XG4gIGJpZzogQmlnW107XG4gIHNtYWxsOiBBcnJheTx7IGxpbmU6IHN0cmluZyB9Pjtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZ1tuZ3gtY2hhcnRzLWdhdWdlLWF4aXNdJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c3ZnOmcgW2F0dHIudHJhbnNmb3JtXT1cInJvdGF0ZVwiPlxuICAgICAgPHN2ZzpnICpuZ0Zvcj1cImxldCB0aWNrIG9mIHRpY2tzLmJpZ1wiIGNsYXNzPVwiZ2F1Z2UtdGljayBnYXVnZS10aWNrLWxhcmdlXCI+XG4gICAgICAgIDxzdmc6cGF0aCBbYXR0ci5kXT1cInRpY2subGluZVwiIC8+XG4gICAgICA8L3N2ZzpnPlxuICAgICAgPHN2ZzpnICpuZ0Zvcj1cImxldCB0aWNrIG9mIHRpY2tzLmJpZ1wiIGNsYXNzPVwiZ2F1Z2UtdGljayBnYXVnZS10aWNrLWxhcmdlXCI+XG4gICAgICAgIDxzdmc6dGV4dFxuICAgICAgICAgIFtzdHlsZS50ZXh0QW5jaG9yXT1cInRpY2sudGV4dEFuY2hvclwiXG4gICAgICAgICAgW2F0dHIudHJhbnNmb3JtXT1cInRpY2sudGV4dFRyYW5zZm9ybVwiXG4gICAgICAgICAgYWxpZ25tZW50LWJhc2VsaW5lPVwiY2VudHJhbFwiXG4gICAgICAgID5cbiAgICAgICAgICB7eyB0aWNrLnRleHQgfX1cbiAgICAgICAgPC9zdmc6dGV4dD5cbiAgICAgIDwvc3ZnOmc+XG4gICAgICA8c3ZnOmcgKm5nRm9yPVwibGV0IHRpY2sgb2YgdGlja3Muc21hbGxcIiBjbGFzcz1cImdhdWdlLXRpY2sgZ2F1Z2UtdGljay1zbWFsbFwiPlxuICAgICAgICA8c3ZnOnBhdGggW2F0dHIuZF09XCJ0aWNrLmxpbmVcIiAvPlxuICAgICAgPC9zdmc6Zz5cbiAgICA8L3N2ZzpnPlxuICBgLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBHYXVnZUF4aXNDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBASW5wdXQoKSBiaWdTZWdtZW50czogbnVtYmVyO1xuICBASW5wdXQoKSBzbWFsbFNlZ21lbnRzOiBudW1iZXI7XG4gIEBJbnB1dCgpIG1pbjogbnVtYmVyO1xuICBASW5wdXQoKSBtYXg6IG51bWJlcjtcbiAgQElucHV0KCkgYW5nbGVTcGFuOiBudW1iZXI7XG4gIEBJbnB1dCgpIHN0YXJ0QW5nbGU6IG51bWJlcjtcbiAgQElucHV0KCkgcmFkaXVzOiBudW1iZXI7XG4gIEBJbnB1dCgpIHZhbHVlU2NhbGU6IGFueTtcbiAgQElucHV0KCkgdGlja0Zvcm1hdHRpbmc6IGFueTtcblxuICB0aWNrczogVGlja3M7XG4gIHJvdGF0aW9uQW5nbGU6IG51bWJlcjtcbiAgcm90YXRlOiBzdHJpbmcgPSAnJztcblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJvdGF0aW9uQW5nbGUgPSAtOTAgKyB0aGlzLnN0YXJ0QW5nbGU7XG4gICAgdGhpcy5yb3RhdGUgPSBgcm90YXRlKCR7dGhpcy5yb3RhdGlvbkFuZ2xlfSlgO1xuICAgIHRoaXMudGlja3MgPSB0aGlzLmdldFRpY2tzKCk7XG4gIH1cblxuICBnZXRUaWNrcygpOiBUaWNrcyB7XG4gICAgY29uc3QgYmlnVGlja1NlZ21lbnQgPSB0aGlzLmFuZ2xlU3BhbiAvIHRoaXMuYmlnU2VnbWVudHM7XG4gICAgY29uc3Qgc21hbGxUaWNrU2VnbWVudCA9IGJpZ1RpY2tTZWdtZW50IC8gdGhpcy5zbWFsbFNlZ21lbnRzO1xuICAgIGNvbnN0IHRpY2tMZW5ndGggPSAyMDtcbiAgICBjb25zdCB0aWNrcyA9IHtcbiAgICAgIGJpZzogW10sXG4gICAgICBzbWFsbDogW11cbiAgICB9O1xuXG4gICAgY29uc3Qgc3RhcnREaXN0YW5jZSA9IHRoaXMucmFkaXVzICsgMTA7XG4gICAgY29uc3QgdGV4dERpc3QgPSBzdGFydERpc3RhbmNlICsgdGlja0xlbmd0aCArIDEwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gdGhpcy5iaWdTZWdtZW50czsgaSsrKSB7XG4gICAgICBjb25zdCBhbmdsZURlZyA9IGkgKiBiaWdUaWNrU2VnbWVudDtcbiAgICAgIGNvbnN0IGFuZ2xlID0gKGFuZ2xlRGVnICogTWF0aC5QSSkgLyAxODA7XG5cbiAgICAgIGNvbnN0IHRleHRBbmNob3IgPSB0aGlzLmdldFRleHRBbmNob3IoYW5nbGVEZWcpO1xuXG4gICAgICBsZXQgc2tpcCA9IGZhbHNlO1xuICAgICAgaWYgKGkgPT09IDAgJiYgdGhpcy5hbmdsZVNwYW4gPT09IDM2MCkge1xuICAgICAgICBza2lwID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgIGxldCB0ZXh0ID0gTnVtYmVyLnBhcnNlRmxvYXQodGhpcy52YWx1ZVNjYWxlLmludmVydChhbmdsZURlZykudG9TdHJpbmcoKSkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgaWYgKHRoaXMudGlja0Zvcm1hdHRpbmcpIHtcbiAgICAgICAgICB0ZXh0ID0gdGhpcy50aWNrRm9ybWF0dGluZyh0ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICB0aWNrcy5iaWcucHVzaCh7XG4gICAgICAgICAgbGluZTogdGhpcy5nZXRUaWNrUGF0aChzdGFydERpc3RhbmNlLCB0aWNrTGVuZ3RoLCBhbmdsZSksXG4gICAgICAgICAgdGV4dEFuY2hvcixcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIHRleHRUcmFuc2Zvcm06IGBcbiAgICAgICAgICAgIHRyYW5zbGF0ZSgke3RleHREaXN0ICogTWF0aC5jb3MoYW5nbGUpfSwgJHt0ZXh0RGlzdCAqIE1hdGguc2luKGFuZ2xlKX0pIHJvdGF0ZSgkey10aGlzLnJvdGF0aW9uQW5nbGV9KVxuICAgICAgICAgIGBcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpID09PSB0aGlzLmJpZ1NlZ21lbnRzKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBqID0gMTsgaiA8PSB0aGlzLnNtYWxsU2VnbWVudHM7IGorKykge1xuICAgICAgICBjb25zdCBzbWFsbEFuZ2xlRGVnID0gYW5nbGVEZWcgKyBqICogc21hbGxUaWNrU2VnbWVudDtcbiAgICAgICAgY29uc3Qgc21hbGxBbmdsZSA9IChzbWFsbEFuZ2xlRGVnICogTWF0aC5QSSkgLyAxODA7XG5cbiAgICAgICAgdGlja3Muc21hbGwucHVzaCh7XG4gICAgICAgICAgbGluZTogdGhpcy5nZXRUaWNrUGF0aChzdGFydERpc3RhbmNlLCB0aWNrTGVuZ3RoIC8gMiwgc21hbGxBbmdsZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRpY2tzO1xuICB9XG5cbiAgZ2V0VGV4dEFuY2hvcihhbmdsZTogbnVtYmVyKTogVGV4dEFuY2hvciB7XG4gICAgLy8gWzAsIDQ1XSA9ICdtaWRkbGUnO1xuICAgIC8vIFs0NiwgMTM1XSA9ICdzdGFydCc7XG4gICAgLy8gWzEzNiwgMjI1XSA9ICdtaWRkbGUnO1xuICAgIC8vIFsyMjYsIDMxNV0gPSAnZW5kJztcblxuICAgIGFuZ2xlID0gKHRoaXMuc3RhcnRBbmdsZSArIGFuZ2xlKSAlIDM2MDtcbiAgICBsZXQgdGV4dEFuY2hvciA9IFRleHRBbmNob3IuTWlkZGxlO1xuICAgIGlmIChhbmdsZSA+IDQ1ICYmIGFuZ2xlIDw9IDEzNSkge1xuICAgICAgdGV4dEFuY2hvciA9IFRleHRBbmNob3IuU3RhcnQ7XG4gICAgfSBlbHNlIGlmIChhbmdsZSA+IDIyNSAmJiBhbmdsZSA8PSAzMTUpIHtcbiAgICAgIHRleHRBbmNob3IgPSBUZXh0QW5jaG9yLkVuZDtcbiAgICB9XG4gICAgcmV0dXJuIHRleHRBbmNob3I7XG4gIH1cblxuICBnZXRUaWNrUGF0aChzdGFydERpc3RhbmNlOiBudW1iZXIsIHRpY2tMZW5ndGg6IG51bWJlciwgYW5nbGU6IG51bWJlcik6IGFueSB7XG4gICAgY29uc3QgeTEgPSBzdGFydERpc3RhbmNlICogTWF0aC5zaW4oYW5nbGUpO1xuICAgIGNvbnN0IHkyID0gKHN0YXJ0RGlzdGFuY2UgKyB0aWNrTGVuZ3RoKSAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICBjb25zdCB4MSA9IHN0YXJ0RGlzdGFuY2UgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgY29uc3QgeDIgPSAoc3RhcnREaXN0YW5jZSArIHRpY2tMZW5ndGgpICogTWF0aC5jb3MoYW5nbGUpO1xuXG4gICAgY29uc3QgcG9pbnRzID0gW1xuICAgICAgeyB4OiB4MSwgeTogeTEgfSxcbiAgICAgIHsgeDogeDIsIHk6IHkyIH1cbiAgICBdO1xuICAgIGNvbnN0IGxpbmVHZW5lcmF0b3IgPSBsaW5lPGFueT4oKVxuICAgICAgLngoZCA9PiBkLngpXG4gICAgICAueShkID0+IGQueSk7XG4gICAgcmV0dXJuIGxpbmVHZW5lcmF0b3IocG9pbnRzKTtcbiAgfVxufVxuIl19