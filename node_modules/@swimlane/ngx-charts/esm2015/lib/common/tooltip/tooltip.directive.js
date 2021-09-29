import { Directive, Input, Output, EventEmitter, HostListener, ViewContainerRef, Renderer2 } from '@angular/core';
import { PlacementTypes } from './position';
import { StyleTypes } from './style.type';
import { ShowTypes } from './show.type';
import { TooltipService } from './tooltip.service';
export class TooltipDirective {
    constructor(tooltipService, viewContainerRef, renderer) {
        this.tooltipService = tooltipService;
        this.viewContainerRef = viewContainerRef;
        this.renderer = renderer;
        this.tooltipCssClass = '';
        this.tooltipAppendToBody = true;
        this.tooltipSpacing = 10;
        this.tooltipDisabled = false;
        this.tooltipShowCaret = true;
        this.tooltipPlacement = PlacementTypes.Top;
        this.tooltipAlignment = PlacementTypes.Center;
        this.tooltipType = StyleTypes.popover;
        this.tooltipCloseOnClickOutside = true;
        this.tooltipCloseOnMouseLeave = true;
        this.tooltipHideTimeout = 300;
        this.tooltipShowTimeout = 100;
        this.tooltipShowEvent = ShowTypes.all;
        this.tooltipImmediateExit = false;
        this.show = new EventEmitter();
        this.hide = new EventEmitter();
    }
    get listensForFocus() {
        return this.tooltipShowEvent === ShowTypes.all || this.tooltipShowEvent === ShowTypes.focus;
    }
    get listensForHover() {
        return this.tooltipShowEvent === ShowTypes.all || this.tooltipShowEvent === ShowTypes.mouseover;
    }
    ngOnDestroy() {
        this.hideTooltip(true);
    }
    onFocus() {
        if (this.listensForFocus) {
            this.showTooltip();
        }
    }
    onBlur() {
        if (this.listensForFocus) {
            this.hideTooltip(true);
        }
    }
    onMouseEnter() {
        if (this.listensForHover) {
            this.showTooltip();
        }
    }
    onMouseLeave(target) {
        if (this.listensForHover && this.tooltipCloseOnMouseLeave) {
            clearTimeout(this.timeout);
            if (this.component) {
                const contentDom = this.component.instance.element.nativeElement;
                const contains = contentDom.contains(target);
                if (contains)
                    return;
            }
            this.hideTooltip(this.tooltipImmediateExit);
        }
    }
    onMouseClick() {
        if (this.listensForHover) {
            this.hideTooltip(true);
        }
    }
    showTooltip(immediate) {
        if (this.component || this.tooltipDisabled)
            return;
        const time = immediate
            ? 0
            : this.tooltipShowTimeout + (navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ? 300 : 0);
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.tooltipService.destroyAll();
            const options = this.createBoundOptions();
            this.component = this.tooltipService.create(options);
            // add a tiny timeout to avoid event re-triggers
            setTimeout(() => {
                if (this.component) {
                    this.addHideListeners(this.component.instance.element.nativeElement);
                }
            }, 10);
            this.show.emit(true);
        }, time);
    }
    addHideListeners(tooltip) {
        // on mouse enter, cancel the hide triggered by the leave
        this.mouseEnterContentEvent = this.renderer.listen(tooltip, 'mouseenter', () => {
            clearTimeout(this.timeout);
        });
        // content mouse leave listener
        if (this.tooltipCloseOnMouseLeave) {
            this.mouseLeaveContentEvent = this.renderer.listen(tooltip, 'mouseleave', () => {
                this.hideTooltip(this.tooltipImmediateExit);
            });
        }
        // content close on click outside
        if (this.tooltipCloseOnClickOutside) {
            this.documentClickEvent = this.renderer.listen('window', 'click', event => {
                const contains = tooltip.contains(event.target);
                if (!contains)
                    this.hideTooltip();
            });
        }
    }
    hideTooltip(immediate = false) {
        if (!this.component)
            return;
        const destroyFn = () => {
            // remove events
            if (this.mouseLeaveContentEvent)
                this.mouseLeaveContentEvent();
            if (this.mouseEnterContentEvent)
                this.mouseEnterContentEvent();
            if (this.documentClickEvent)
                this.documentClickEvent();
            // emit events
            this.hide.emit(true);
            // destroy component
            this.tooltipService.destroy(this.component);
            this.component = undefined;
        };
        clearTimeout(this.timeout);
        if (!immediate) {
            this.timeout = setTimeout(destroyFn, this.tooltipHideTimeout);
        }
        else {
            destroyFn();
        }
    }
    createBoundOptions() {
        return {
            title: this.tooltipTitle,
            template: this.tooltipTemplate,
            host: this.viewContainerRef.element,
            placement: this.tooltipPlacement,
            alignment: this.tooltipAlignment,
            type: this.tooltipType,
            showCaret: this.tooltipShowCaret,
            cssClass: this.tooltipCssClass,
            spacing: this.tooltipSpacing,
            context: this.tooltipContext
        };
    }
}
TooltipDirective.decorators = [
    { type: Directive, args: [{ selector: '[ngx-tooltip]' },] }
];
TooltipDirective.ctorParameters = () => [
    { type: TooltipService },
    { type: ViewContainerRef },
    { type: Renderer2 }
];
TooltipDirective.propDecorators = {
    tooltipCssClass: [{ type: Input }],
    tooltipTitle: [{ type: Input }],
    tooltipAppendToBody: [{ type: Input }],
    tooltipSpacing: [{ type: Input }],
    tooltipDisabled: [{ type: Input }],
    tooltipShowCaret: [{ type: Input }],
    tooltipPlacement: [{ type: Input }],
    tooltipAlignment: [{ type: Input }],
    tooltipType: [{ type: Input }],
    tooltipCloseOnClickOutside: [{ type: Input }],
    tooltipCloseOnMouseLeave: [{ type: Input }],
    tooltipHideTimeout: [{ type: Input }],
    tooltipShowTimeout: [{ type: Input }],
    tooltipTemplate: [{ type: Input }],
    tooltipShowEvent: [{ type: Input }],
    tooltipContext: [{ type: Input }],
    tooltipImmediateExit: [{ type: Input }],
    show: [{ type: Output }],
    hide: [{ type: Output }],
    onFocus: [{ type: HostListener, args: ['focusin',] }],
    onBlur: [{ type: HostListener, args: ['blur',] }],
    onMouseEnter: [{ type: HostListener, args: ['mouseenter',] }],
    onMouseLeave: [{ type: HostListener, args: ['mouseleave', ['$event.target'],] }],
    onMouseClick: [{ type: HostListener, args: ['click',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtY2hhcnRzL3NyYy9saWIvY29tbW9uL3Rvb2x0aXAvdG9vbHRpcC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixZQUFZLEVBQ1osZ0JBQWdCLEVBQ2hCLFNBQVMsRUFJVixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV4QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHbkQsTUFBTSxPQUFPLGdCQUFnQjtJQW9DM0IsWUFDVSxjQUE4QixFQUM5QixnQkFBa0MsRUFDbEMsUUFBbUI7UUFGbkIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzlCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQXRDcEIsb0JBQWUsR0FBVyxFQUFFLENBQUM7UUFFN0Isd0JBQW1CLEdBQVksSUFBSSxDQUFDO1FBQ3BDLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBQzVCLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBQ2pDLHFCQUFnQixHQUFZLElBQUksQ0FBQztRQUNqQyxxQkFBZ0IsR0FBbUIsY0FBYyxDQUFDLEdBQUcsQ0FBQztRQUN0RCxxQkFBZ0IsR0FBbUIsY0FBYyxDQUFDLE1BQU0sQ0FBQztRQUN6RCxnQkFBVyxHQUFlLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDN0MsK0JBQTBCLEdBQVksSUFBSSxDQUFDO1FBQzNDLDZC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SSxDQUFDLGdCQUFnQjtZQUNoQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7WUFDaEMsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYztZQUM1QixPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWM7U0FDN0IsQ0FBQztJQUNKLENBQUM7OztZQS9LRixTQUFTLFNBQUMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFOzs7WUFGL0IsY0FBYztZQVhyQixnQkFBZ0I7WUFDaEIsU0FBUzs7OzhCQWNSLEtBQUs7MkJBQ0wsS0FBSztrQ0FDTCxLQUFLOzZCQUNMLEtBQUs7OEJBQ0wsS0FBSzsrQkFDTCxLQUFLOytCQUNMLEtBQUs7K0JBQ0wsS0FBSzswQkFDTCxLQUFLO3lDQUNMLEtBQUs7dUNBQ0wsS0FBSztpQ0FDTCxLQUFLO2lDQUNMLEtBQUs7OEJBQ0wsS0FBSzsrQkFDTCxLQUFLOzZCQUNMLEtBQUs7bUNBQ0wsS0FBSzttQkFFTCxNQUFNO21CQUNOLE1BQU07c0JBMEJOLFlBQVksU0FBQyxTQUFTO3FCQU90QixZQUFZLFNBQUMsTUFBTTsyQkFPbkIsWUFBWSxTQUFDLFlBQVk7MkJBT3pCLFlBQVksU0FBQyxZQUFZLEVBQUUsQ0FBQyxlQUFlLENBQUM7MkJBZTVDLFlBQVksU0FBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIEhvc3RMaXN0ZW5lcixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgUmVuZGVyZXIyLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBDb21wb25lbnRSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFBsYWNlbWVudFR5cGVzIH0gZnJvbSAnLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBTdHlsZVR5cGVzIH0gZnJvbSAnLi9zdHlsZS50eXBlJztcbmltcG9ydCB7IFNob3dUeXBlcyB9IGZyb20gJy4vc2hvdy50eXBlJztcblxuaW1wb3J0IHsgVG9vbHRpcFNlcnZpY2UgfSBmcm9tICcuL3Rvb2x0aXAuc2VydmljZSc7XG5cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tuZ3gtdG9vbHRpcF0nIH0pXG5leHBvcnQgY2xhc3MgVG9vbHRpcERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIHRvb2x0aXBDc3NDbGFzczogc3RyaW5nID0gJyc7XG4gIEBJbnB1dCgpIHRvb2x0aXBUaXRsZT86IHN0cmluZztcbiAgQElucHV0KCkgdG9vbHRpcEFwcGVuZFRvQm9keTogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHRvb2x0aXBTcGFjaW5nOiBudW1iZXIgPSAxMDtcbiAgQElucHV0KCkgdG9vbHRpcERpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHRvb2x0aXBTaG93Q2FyZXQ6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSB0b29sdGlwUGxhY2VtZW50OiBQbGFjZW1lbnRUeXBlcyA9IFBsYWNlbWVudFR5cGVzLlRvcDtcbiAgQElucHV0KCkgdG9vbHRpcEFsaWdubWVudDogUGxhY2VtZW50VHlwZXMgPSBQbGFjZW1lbnRUeXBlcy5DZW50ZXI7XG4gIEBJbnB1dCgpIHRvb2x0aXBUeXBlOiBTdHlsZVR5cGVzID0gU3R5bGVUeXBlcy5wb3BvdmVyO1xuICBASW5wdXQoKSB0b29sdGlwQ2xvc2VPbkNsaWNrT3V0c2lkZTogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHRvb2x0aXBDbG9zZU9uTW91c2VMZWF2ZTogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHRvb2x0aXBIaWRlVGltZW91dDogbnVtYmVyID0gMzAwO1xuICBASW5wdXQoKSB0b29sdGlwU2hvd1RpbWVvdXQ6IG51bWJlciA9IDEwMDtcbiAgQElucHV0KCkgdG9vbHRpcFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBASW5wdXQoKSB0b29sdGlwU2hvd0V2ZW50OiBTaG93VHlwZXMgPSBTaG93VHlwZXMuYWxsO1xuICBASW5wdXQoKSB0b29sdGlwQ29udGV4dDogYW55O1xuICBASW5wdXQoKSB0b29sdGlwSW1tZWRpYXRlRXhpdDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIEBPdXRwdXQoKSBzaG93OiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBoaWRlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgcHJpdmF0ZSBnZXQgbGlzdGVuc0ZvckZvY3VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRvb2x0aXBTaG93RXZlbnQgPT09IFNob3dUeXBlcy5hbGwgfHwgdGhpcy50b29sdGlwU2hvd0V2ZW50ID09PSBTaG93VHlwZXMuZm9jdXM7XG4gIH1cblxuICBwcml2YXRlIGdldCBsaXN0ZW5zRm9ySG92ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudG9vbHRpcFNob3dFdmVudCA9PT0gU2hvd1R5cGVzLmFsbCB8fCB0aGlzLnRvb2x0aXBTaG93RXZlbnQgPT09IFNob3dUeXBlcy5tb3VzZW92ZXI7XG4gIH1cblxuICBwcml2YXRlIGNvbXBvbmVudDogQ29tcG9uZW50UmVmPGFueT47XG4gIHByaXZhdGUgdGltZW91dDogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD47XG4gIHByaXZhdGUgbW91c2VMZWF2ZUNvbnRlbnRFdmVudDogYW55O1xuICBwcml2YXRlIG1vdXNlRW50ZXJDb250ZW50RXZlbnQ6IGFueTtcbiAgcHJpdmF0ZSBkb2N1bWVudENsaWNrRXZlbnQ6IGFueTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHRvb2x0aXBTZXJ2aWNlOiBUb29sdGlwU2VydmljZSxcbiAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyXG4gICkge31cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmhpZGVUb29sdGlwKHRydWUpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignZm9jdXNpbicpXG4gIG9uRm9jdXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubGlzdGVuc0ZvckZvY3VzKSB7XG4gICAgICB0aGlzLnNob3dUb29sdGlwKCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignYmx1cicpXG4gIG9uQmx1cigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5saXN0ZW5zRm9yRm9jdXMpIHtcbiAgICAgIHRoaXMuaGlkZVRvb2x0aXAodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignbW91c2VlbnRlcicpXG4gIG9uTW91c2VFbnRlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5saXN0ZW5zRm9ySG92ZXIpIHtcbiAgICAgIHRoaXMuc2hvd1Rvb2x0aXAoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdtb3VzZWxlYXZlJywgWyckZXZlbnQudGFyZ2V0J10pXG4gIG9uTW91c2VMZWF2ZSh0YXJnZXQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5saXN0ZW5zRm9ySG92ZXIgJiYgdGhpcy50b29sdGlwQ2xvc2VPbk1vdXNlTGVhdmUpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuXG4gICAgICBpZiAodGhpcy5jb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgY29udGVudERvbSA9IHRoaXMuY29tcG9uZW50Lmluc3RhbmNlLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgY29udGFpbnMgPSBjb250ZW50RG9tLmNvbnRhaW5zKHRhcmdldCk7XG4gICAgICAgIGlmIChjb250YWlucykgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhpZGVUb29sdGlwKHRoaXMudG9vbHRpcEltbWVkaWF0ZUV4aXQpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJylcbiAgb25Nb3VzZUNsaWNrKCkge1xuICAgIGlmICh0aGlzLmxpc3RlbnNGb3JIb3Zlcikge1xuICAgICAgdGhpcy5oaWRlVG9vbHRpcCh0cnVlKTtcbiAgICB9XG4gIH1cblxuICBzaG93VG9vbHRpcChpbW1lZGlhdGU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY29tcG9uZW50IHx8IHRoaXMudG9vbHRpcERpc2FibGVkKSByZXR1cm47XG5cbiAgICBjb25zdCB0aW1lID0gaW1tZWRpYXRlXG4gICAgICA/IDBcbiAgICAgIDogdGhpcy50b29sdGlwU2hvd1RpbWVvdXQgKyAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvXFwoaVteO10rOyggVTspPyBDUFUuK01hYyBPUyBYLykgPyAzMDAgOiAwKTtcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy50b29sdGlwU2VydmljZS5kZXN0cm95QWxsKCk7XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmNyZWF0ZUJvdW5kT3B0aW9ucygpO1xuICAgICAgdGhpcy5jb21wb25lbnQgPSB0aGlzLnRvb2x0aXBTZXJ2aWNlLmNyZWF0ZShvcHRpb25zKTtcblxuICAgICAgLy8gYWRkIGEgdGlueSB0aW1lb3V0IHRvIGF2b2lkIGV2ZW50IHJlLXRyaWdnZXJzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50KSB7XG4gICAgICAgICAgdGhpcy5hZGRIaWRlTGlzdGVuZXJzKHRoaXMuY29tcG9uZW50Lmluc3RhbmNlLmVsZW1lbnQubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwKTtcblxuICAgICAgdGhpcy5zaG93LmVtaXQodHJ1ZSk7XG4gICAgfSwgdGltZSk7XG4gIH1cblxuICBhZGRIaWRlTGlzdGVuZXJzKHRvb2x0aXA6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgLy8gb24gbW91c2UgZW50ZXIsIGNhbmNlbCB0aGUgaGlkZSB0cmlnZ2VyZWQgYnkgdGhlIGxlYXZlXG4gICAgdGhpcy5tb3VzZUVudGVyQ29udGVudEV2ZW50ID0gdGhpcy5yZW5kZXJlci5saXN0ZW4odG9vbHRpcCwgJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICB9KTtcblxuICAgIC8vIGNvbnRlbnQgbW91c2UgbGVhdmUgbGlzdGVuZXJcbiAgICBpZiAodGhpcy50b29sdGlwQ2xvc2VPbk1vdXNlTGVhdmUpIHtcbiAgICAgIHRoaXMubW91c2VMZWF2ZUNvbnRlbnRFdmVudCA9IHRoaXMucmVuZGVyZXIubGlzdGVuKHRvb2x0aXAsICdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmhpZGVUb29sdGlwKHRoaXMudG9vbHRpcEltbWVkaWF0ZUV4aXQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gY29udGVudCBjbG9zZSBvbiBjbGljayBvdXRzaWRlXG4gICAgaWYgKHRoaXMudG9vbHRpcENsb3NlT25DbGlja091dHNpZGUpIHtcbiAgICAgIHRoaXMuZG9jdW1lbnRDbGlja0V2ZW50ID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oJ3dpbmRvdycsICdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgY29udGFpbnMgPSB0b29sdGlwLmNvbnRhaW5zKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmICghY29udGFpbnMpIHRoaXMuaGlkZVRvb2x0aXAoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGhpZGVUb29sdGlwKGltbWVkaWF0ZTogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNvbXBvbmVudCkgcmV0dXJuO1xuXG4gICAgY29uc3QgZGVzdHJveUZuID0gKCkgPT4ge1xuICAgICAgLy8gcmVtb3ZlIGV2ZW50c1xuICAgICAgaWYgKHRoaXMubW91c2VMZWF2ZUNvbnRlbnRFdmVudCkgdGhpcy5tb3VzZUxlYXZlQ29udGVudEV2ZW50KCk7XG4gICAgICBpZiAodGhpcy5tb3VzZUVudGVyQ29udGVudEV2ZW50KSB0aGlzLm1vdXNlRW50ZXJDb250ZW50RXZlbnQoKTtcbiAgICAgIGlmICh0aGlzLmRvY3VtZW50Q2xpY2tFdmVudCkgdGhpcy5kb2N1bWVudENsaWNrRXZlbnQoKTtcblxuICAgICAgLy8gZW1pdCBldmVudHNcbiAgICAgIHRoaXMuaGlkZS5lbWl0KHRydWUpO1xuXG4gICAgICAvLyBkZXN0cm95IGNvbXBvbmVudFxuICAgICAgdGhpcy50b29sdGlwU2VydmljZS5kZXN0cm95KHRoaXMuY29tcG9uZW50KTtcbiAgICAgIHRoaXMuY29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChkZXN0cm95Rm4sIHRoaXMudG9vbHRpcEhpZGVUaW1lb3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVzdHJveUZuKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVCb3VuZE9wdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGU6IHRoaXMudG9vbHRpcFRpdGxlLFxuICAgICAgdGVtcGxhdGU6IHRoaXMudG9vbHRpcFRlbXBsYXRlLFxuICAgICAgaG9zdDogdGhpcy52aWV3Q29udGFpbmVyUmVmLmVsZW1lbnQsXG4gICAgICBwbGFjZW1lbnQ6IHRoaXMudG9vbHRpcFBsYWNlbWVudCxcbiAgICAgIGFsaWdubWVudDogdGhpcy50b29sdGlwQWxpZ25tZW50LFxuICAgICAgdHlwZTogdGhpcy50b29sdGlwVHlwZSxcbiAgICAgIHNob3dDYXJldDogdGhpcy50b29sdGlwU2hvd0NhcmV0LFxuICAgICAgY3NzQ2xhc3M6IHRoaXMudG9vbHRpcENzc0NsYXNzLFxuICAgICAgc3BhY2luZzogdGhpcy50b29sdGlwU3BhY2luZyxcbiAgICAgIGNvbnRleHQ6IHRoaXMudG9vbHRpcENvbnRleHRcbiAgICB9O1xuICB9XG59XG4iXX0=