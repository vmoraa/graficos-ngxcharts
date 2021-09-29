import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { BarOrientation } from './types/bar-orientation.enum';
export class SvgLinearGradientComponent {
    constructor() {
        this.orientation = BarOrientation.Vertical;
    }
    ngOnChanges(changes) {
        this.x1 = '0%';
        this.x2 = '0%';
        this.y1 = '0%';
        this.y2 = '0%';
        if (this.orientation === BarOrientation.Horizontal) {
            this.x2 = '100%';
        }
        else if (this.orientation === BarOrientation.Vertical) {
            this.y1 = '100%';
        }
    }
}
SvgLinearGradientComponent.decorators = [
    { type: Component, args: [{
                selector: 'g[ngx-charts-svg-linear-gradient]',
                template: `
    <svg:linearGradient [id]="name" [attr.x1]="x1" [attr.y1]="y1" [attr.x2]="x2" [attr.y2]="y2">
      <svg:stop
        *ngFor="let stop of stops"
        [attr.offset]="stop.offset + '%'"
        [style.stop-color]="stop.color"
        [style.stop-opacity]="stop.opacity"
      />
    </svg:linearGradient>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
SvgLinearGradientComponent.propDecorators = {
    orientation: [{ type: Input }],
    name: [{ type: Input }],
    stops: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ZnLWxpbmVhci1ncmFkaWVudC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtY2hhcnRzL3NyYy9saWIvY29tbW9uL3N2Zy1saW5lYXItZ3JhZGllbnQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUE0Qix1QkFBdUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNwRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFpQjlELE1BQU0sT0FBTywwQkFBMEI7SUFkdkM7UUFlVyxnQkFBVyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUM7SUFxQmpELENBQUM7SUFaQyxXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFZixJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssY0FBYyxDQUFDLFVBQVUsRUFBRTtZQUNsRCxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztTQUNsQjthQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxjQUFjLENBQUMsUUFBUSxFQUFFO1lBQ3ZELElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO1NBQ2xCO0lBQ0gsQ0FBQzs7O1lBbkNGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsbUNBQW1DO2dCQUM3QyxRQUFRLEVBQUU7Ozs7Ozs7OztHQVNUO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2FBQ2hEOzs7MEJBRUUsS0FBSzttQkFDTCxLQUFLO29CQUNMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZXMsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCYXJPcmllbnRhdGlvbiB9IGZyb20gJy4vdHlwZXMvYmFyLW9yaWVudGF0aW9uLmVudW0nO1xuaW1wb3J0IHsgR3JhZGllbnQgfSBmcm9tICcuL3R5cGVzL2dyYWRpZW50LmludGVyZmFjZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dbbmd4LWNoYXJ0cy1zdmctbGluZWFyLWdyYWRpZW50XScsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHN2ZzpsaW5lYXJHcmFkaWVudCBbaWRdPVwibmFtZVwiIFthdHRyLngxXT1cIngxXCIgW2F0dHIueTFdPVwieTFcIiBbYXR0ci54Ml09XCJ4MlwiIFthdHRyLnkyXT1cInkyXCI+XG4gICAgICA8c3ZnOnN0b3BcbiAgICAgICAgKm5nRm9yPVwibGV0IHN0b3Agb2Ygc3RvcHNcIlxuICAgICAgICBbYXR0ci5vZmZzZXRdPVwic3RvcC5vZmZzZXQgKyAnJSdcIlxuICAgICAgICBbc3R5bGUuc3RvcC1jb2xvcl09XCJzdG9wLmNvbG9yXCJcbiAgICAgICAgW3N0eWxlLnN0b3Atb3BhY2l0eV09XCJzdG9wLm9wYWNpdHlcIlxuICAgICAgLz5cbiAgICA8L3N2ZzpsaW5lYXJHcmFkaWVudD5cbiAgYCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgU3ZnTGluZWFyR3JhZGllbnRDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBASW5wdXQoKSBvcmllbnRhdGlvbiA9IEJhck9yaWVudGF0aW9uLlZlcnRpY2FsO1xuICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHN0b3BzOiBHcmFkaWVudFtdO1xuXG4gIHgxOiBzdHJpbmc7XG4gIHgyOiBzdHJpbmc7XG4gIHkxOiBzdHJpbmc7XG4gIHkyOiBzdHJpbmc7XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIHRoaXMueDEgPSAnMCUnO1xuICAgIHRoaXMueDIgPSAnMCUnO1xuICAgIHRoaXMueTEgPSAnMCUnO1xuICAgIHRoaXMueTIgPSAnMCUnO1xuXG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09IEJhck9yaWVudGF0aW9uLkhvcml6b250YWwpIHtcbiAgICAgIHRoaXMueDIgPSAnMTAwJSc7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSBCYXJPcmllbnRhdGlvbi5WZXJ0aWNhbCkge1xuICAgICAgdGhpcy55MSA9ICcxMDAlJztcbiAgICB9XG4gIH1cbn1cbiJdfQ==