import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from '@angular/core';
import { DomPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
function isViewContainerRef(x) {
    return x.element;
}
/**
 * Injection service is a helper to append components
 * dynamically to a known location in the DOM, most
 * noteably for dialogs/tooltips appending to body.
 *
 * @export
 */
export class InjectionService {
    constructor(applicationRef, componentFactoryResolver, injector) {
        this.applicationRef = applicationRef;
        this.componentFactoryResolver = componentFactoryResolver;
        this.injector = injector;
    }
    /**
     * Sets a default global root view container. This is useful for
     * things like ngUpgrade that doesn't have a ApplicationRef root.
     *
     * @param container
     */
    static setGlobalRootViewContainer(container) {
        InjectionService.globalRootViewContainer = container;
    }
    /**
     * Gets the root view container to inject the component to.
     *
     * @memberOf InjectionService
     */
    getRootViewContainer() {
        if (this._container)
            return this._container;
        if (InjectionService.globalRootViewContainer)
            return InjectionService.globalRootViewContainer;
        if (this.applicationRef.components.length)
            return this.applicationRef.components[0];
        throw new Error('View Container not found! ngUpgrade needs to manually set this via setRootViewContainer or setGlobalRootViewContainer.');
    }
    /**
     * Overrides the default root view container. This is useful for
     * things like ngUpgrade that doesn't have a ApplicationRef root.
     *
     * @param container
     *
     * @memberOf InjectionService
     */
    setRootViewContainer(container) {
        this._container = container;
    }
    /**
     * Gets the html element for a component ref.
     *
     * @param componentRef
     *
     * @memberOf InjectionService
     */
    getComponentRootNode(component) {
        if (isViewContainerRef(component)) {
            return component.element.nativeElement;
        }
        if (component.hostView && component.hostView.rootNodes.length > 0) {
            return component.hostView.rootNodes[0];
        }
        // the top most component root node has no `hostView`
        return component.location.nativeElement;
    }
    /**
     * Gets the root component container html element.
     *
     * @memberOf InjectionService
     */
    getRootViewContainerNode(component) {
        return this.getComponentRootNode(component);
    }
    /**
     * Projects the bindings onto the component
     *
     * @param component
     * @param options
     *
     * @memberOf InjectionService
     */
    projectComponentBindings(component, bindings) {
        if (bindings) {
            if (bindings.inputs !== undefined) {
                const bindingKeys = Object.getOwnPropertyNames(bindings.inputs);
                for (const bindingName of bindingKeys) {
                    component.instance[bindingName] = bindings.inputs[bindingName];
                }
            }
            if (bindings.outputs !== undefined) {
                const eventKeys = Object.getOwnPropertyNames(bindings.outputs);
                for (const eventName of eventKeys) {
                    component.instance[eventName] = bindings.outputs[eventName];
                }
            }
        }
        return component;
    }
    /**
     * Appends a component to a adjacent location
     *
     * @param componentClass
     * @param [options={}]
     * @param [location]
     *
     * @memberOf InjectionService
     */
    appendComponent(componentClass, bindings = {}, location) {
        if (!location)
            location = this.getRootViewContainer();
        const appendLocation = this.getComponentRootNode(location);
        const portalHost = new DomPortalOutlet(appendLocation, this.componentFactoryResolver, this.applicationRef, this.injector);
        const portal = new ComponentPortal(componentClass);
        const componentRef = portalHost.attach(portal);
        this.projectComponentBindings(componentRef, bindings);
        return componentRef;
    }
}
InjectionService.globalRootViewContainer = null;
InjectionService.decorators = [
    { type: Injectable }
];
InjectionService.ctorParameters = () => [
    { type: ApplicationRef },
    { type: ComponentFactoryResolver },
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0aW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtY2hhcnRzL3NyYy9saWIvY29tbW9uL3Rvb2x0aXAvaW5qZWN0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGNBQWMsRUFDZCx3QkFBd0IsRUFFeEIsVUFBVSxFQUNWLFFBQVEsRUFJVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXZFLFNBQVMsa0JBQWtCLENBQUMsQ0FBTTtJQUNoQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyxnQkFBZ0I7SUFlM0IsWUFDVSxjQUE4QixFQUM5Qix3QkFBa0QsRUFDbEQsUUFBa0I7UUFGbEIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzlCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsYUFBUSxHQUFSLFFBQVEsQ0FBVTtJQUN6QixDQUFDO0lBaEJKOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLDBCQUEwQixDQUFDLFNBQTJCO1FBQzNELGdCQUFnQixDQUFDLHVCQUF1QixHQUFHLFNBQVMsQ0FBQztJQUN2RCxDQUFDO0lBVUQ7Ozs7T0FJRztJQUNILG9CQUFvQjtRQUNsQixJQUFJLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzVDLElBQUksZ0JBQWdCLENBQUMsdUJBQXVCO1lBQUUsT0FBTyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQztRQUU5RixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU07WUFBRSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBGLE1BQU0sSUFBSSxLQUFLLENBQ2Isd0hBQXdILENBQ3pILENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILG9CQUFvQixDQUFDLFNBQTJCO1FBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxvQkFBb0IsQ0FBQyxTQUErQztRQUNsRSxJQUFJLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7U0FDeEM7UUFDRCxJQUFJLFNBQVMsQ0FBQyxRQUFRLElBQUssU0FBUyxDQUFDLFFBQWlDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDM0YsT0FBUSxTQUFTLENBQUMsUUFBaUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFnQixDQUFDO1NBQ2pGO1FBRUQscURBQXFEO1FBQ3JELE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCx3QkFBd0IsQ0FBQyxTQUErQztRQUN0RSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILHdCQUF3QixDQUFDLFNBQTRCLEVBQUUsUUFBYTtRQUNsRSxJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ2pDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hFLEtBQUssTUFBTSxXQUFXLElBQUksV0FBVyxFQUFFO29CQUNyQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ2hFO2FBQ0Y7WUFFRCxJQUFJLFFBQVEsQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUNsQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFNBQVMsRUFBRTtvQkFDakMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUM3RDthQUNGO1NBQ0Y7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxlQUFlLENBQUksY0FBdUIsRUFBRSxXQUFnQixFQUFFLEVBQUUsUUFBYztRQUM1RSxJQUFJLENBQUMsUUFBUTtZQUFFLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUN0RCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFM0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFlLENBQ3BDLGNBQWMsRUFDZCxJQUFJLENBQUMsd0JBQXdCLEVBQzdCLElBQUksQ0FBQyxjQUFjLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQ2QsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRW5ELE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0RCxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDOztBQWpJTSx3Q0FBdUIsR0FBcUIsSUFBSSxDQUFDOztZQUZ6RCxVQUFVOzs7WUF0QlQsY0FBYztZQUNkLHdCQUF3QjtZQUd4QixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQXBwbGljYXRpb25SZWYsXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgQ29tcG9uZW50UmVmLFxuICBJbmplY3RhYmxlLFxuICBJbmplY3RvcixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBUeXBlXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tUG9ydGFsT3V0bGV0LCBDb21wb25lbnRQb3J0YWwgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcblxuZnVuY3Rpb24gaXNWaWV3Q29udGFpbmVyUmVmKHg6IGFueSk6IHggaXMgVmlld0NvbnRhaW5lclJlZiB7XG4gIHJldHVybiB4LmVsZW1lbnQ7XG59XG5cbi8qKlxuICogSW5qZWN0aW9uIHNlcnZpY2UgaXMgYSBoZWxwZXIgdG8gYXBwZW5kIGNvbXBvbmVudHNcbiAqIGR5bmFtaWNhbGx5IHRvIGEga25vd24gbG9jYXRpb24gaW4gdGhlIERPTSwgbW9zdFxuICogbm90ZWFibHkgZm9yIGRpYWxvZ3MvdG9vbHRpcHMgYXBwZW5kaW5nIHRvIGJvZHkuXG4gKlxuICogQGV4cG9ydFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSW5qZWN0aW9uU2VydmljZSB7XG4gIHN0YXRpYyBnbG9iYWxSb290Vmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFNldHMgYSBkZWZhdWx0IGdsb2JhbCByb290IHZpZXcgY29udGFpbmVyLiBUaGlzIGlzIHVzZWZ1bCBmb3JcbiAgICogdGhpbmdzIGxpa2UgbmdVcGdyYWRlIHRoYXQgZG9lc24ndCBoYXZlIGEgQXBwbGljYXRpb25SZWYgcm9vdC5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRhaW5lclxuICAgKi9cbiAgc3RhdGljIHNldEdsb2JhbFJvb3RWaWV3Q29udGFpbmVyKGNvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZik6IHZvaWQge1xuICAgIEluamVjdGlvblNlcnZpY2UuZ2xvYmFsUm9vdFZpZXdDb250YWluZXIgPSBjb250YWluZXI7XG4gIH1cblxuICBwcml2YXRlIF9jb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBhcHBsaWNhdGlvblJlZjogQXBwbGljYXRpb25SZWYsXG4gICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvclxuICApIHt9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJvb3QgdmlldyBjb250YWluZXIgdG8gaW5qZWN0IHRoZSBjb21wb25lbnQgdG8uXG4gICAqXG4gICAqIEBtZW1iZXJPZiBJbmplY3Rpb25TZXJ2aWNlXG4gICAqL1xuICBnZXRSb290Vmlld0NvbnRhaW5lcigpOiBWaWV3Q29udGFpbmVyUmVmIHwgQ29tcG9uZW50UmVmPGFueT4ge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHJldHVybiB0aGlzLl9jb250YWluZXI7XG4gICAgaWYgKEluamVjdGlvblNlcnZpY2UuZ2xvYmFsUm9vdFZpZXdDb250YWluZXIpIHJldHVybiBJbmplY3Rpb25TZXJ2aWNlLmdsb2JhbFJvb3RWaWV3Q29udGFpbmVyO1xuXG4gICAgaWYgKHRoaXMuYXBwbGljYXRpb25SZWYuY29tcG9uZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmFwcGxpY2F0aW9uUmVmLmNvbXBvbmVudHNbMF07XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnVmlldyBDb250YWluZXIgbm90IGZvdW5kISBuZ1VwZ3JhZGUgbmVlZHMgdG8gbWFudWFsbHkgc2V0IHRoaXMgdmlhIHNldFJvb3RWaWV3Q29udGFpbmVyIG9yIHNldEdsb2JhbFJvb3RWaWV3Q29udGFpbmVyLidcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUgZGVmYXVsdCByb290IHZpZXcgY29udGFpbmVyLiBUaGlzIGlzIHVzZWZ1bCBmb3JcbiAgICogdGhpbmdzIGxpa2UgbmdVcGdyYWRlIHRoYXQgZG9lc24ndCBoYXZlIGEgQXBwbGljYXRpb25SZWYgcm9vdC5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRhaW5lclxuICAgKlxuICAgKiBAbWVtYmVyT2YgSW5qZWN0aW9uU2VydmljZVxuICAgKi9cbiAgc2V0Um9vdFZpZXdDb250YWluZXIoY29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmKTogdm9pZCB7XG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGh0bWwgZWxlbWVudCBmb3IgYSBjb21wb25lbnQgcmVmLlxuICAgKlxuICAgKiBAcGFyYW0gY29tcG9uZW50UmVmXG4gICAqXG4gICAqIEBtZW1iZXJPZiBJbmplY3Rpb25TZXJ2aWNlXG4gICAqL1xuICBnZXRDb21wb25lbnRSb290Tm9kZShjb21wb25lbnQ6IFZpZXdDb250YWluZXJSZWYgfCBDb21wb25lbnRSZWY8YW55Pik6IEhUTUxFbGVtZW50IHtcbiAgICBpZiAoaXNWaWV3Q29udGFpbmVyUmVmKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiBjb21wb25lbnQuZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIH1cbiAgICBpZiAoY29tcG9uZW50Lmhvc3RWaWV3ICYmIChjb21wb25lbnQuaG9zdFZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pLnJvb3ROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gKGNvbXBvbmVudC5ob3N0VmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8YW55Pikucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50O1xuICAgIH1cblxuICAgIC8vIHRoZSB0b3AgbW9zdCBjb21wb25lbnQgcm9vdCBub2RlIGhhcyBubyBgaG9zdFZpZXdgXG4gICAgcmV0dXJuIGNvbXBvbmVudC5sb2NhdGlvbi5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJvb3QgY29tcG9uZW50IGNvbnRhaW5lciBodG1sIGVsZW1lbnQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBJbmplY3Rpb25TZXJ2aWNlXG4gICAqL1xuICBnZXRSb290Vmlld0NvbnRhaW5lck5vZGUoY29tcG9uZW50OiBWaWV3Q29udGFpbmVyUmVmIHwgQ29tcG9uZW50UmVmPGFueT4pOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29tcG9uZW50Um9vdE5vZGUoY29tcG9uZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9qZWN0cyB0aGUgYmluZGluZ3Mgb250byB0aGUgY29tcG9uZW50XG4gICAqXG4gICAqIEBwYXJhbSBjb21wb25lbnRcbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICpcbiAgICogQG1lbWJlck9mIEluamVjdGlvblNlcnZpY2VcbiAgICovXG4gIHByb2plY3RDb21wb25lbnRCaW5kaW5ncyhjb21wb25lbnQ6IENvbXBvbmVudFJlZjxhbnk+LCBiaW5kaW5nczogYW55KTogQ29tcG9uZW50UmVmPGFueT4ge1xuICAgIGlmIChiaW5kaW5ncykge1xuICAgICAgaWYgKGJpbmRpbmdzLmlucHV0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYmluZGluZ3MuaW5wdXRzKTtcbiAgICAgICAgZm9yIChjb25zdCBiaW5kaW5nTmFtZSBvZiBiaW5kaW5nS2V5cykge1xuICAgICAgICAgIGNvbXBvbmVudC5pbnN0YW5jZVtiaW5kaW5nTmFtZV0gPSBiaW5kaW5ncy5pbnB1dHNbYmluZGluZ05hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChiaW5kaW5ncy5vdXRwdXRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgZXZlbnRLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYmluZGluZ3Mub3V0cHV0cyk7XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnROYW1lIG9mIGV2ZW50S2V5cykge1xuICAgICAgICAgIGNvbXBvbmVudC5pbnN0YW5jZVtldmVudE5hbWVdID0gYmluZGluZ3Mub3V0cHV0c1tldmVudE5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgY29tcG9uZW50IHRvIGEgYWRqYWNlbnQgbG9jYXRpb25cbiAgICpcbiAgICogQHBhcmFtIGNvbXBvbmVudENsYXNzXG4gICAqIEBwYXJhbSBbb3B0aW9ucz17fV1cbiAgICogQHBhcmFtIFtsb2NhdGlvbl1cbiAgICpcbiAgICogQG1lbWJlck9mIEluamVjdGlvblNlcnZpY2VcbiAgICovXG4gIGFwcGVuZENvbXBvbmVudDxUPihjb21wb25lbnRDbGFzczogVHlwZTxUPiwgYmluZGluZ3M6IGFueSA9IHt9LCBsb2NhdGlvbj86IGFueSk6IENvbXBvbmVudFJlZjxhbnk+IHtcbiAgICBpZiAoIWxvY2F0aW9uKSBsb2NhdGlvbiA9IHRoaXMuZ2V0Um9vdFZpZXdDb250YWluZXIoKTtcbiAgICBjb25zdCBhcHBlbmRMb2NhdGlvbiA9IHRoaXMuZ2V0Q29tcG9uZW50Um9vdE5vZGUobG9jYXRpb24pO1xuXG4gICAgY29uc3QgcG9ydGFsSG9zdCA9IG5ldyBEb21Qb3J0YWxPdXRsZXQoXG4gICAgICBhcHBlbmRMb2NhdGlvbixcbiAgICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgdGhpcy5hcHBsaWNhdGlvblJlZixcbiAgICAgIHRoaXMuaW5qZWN0b3JcbiAgICApO1xuXG4gICAgY29uc3QgcG9ydGFsID0gbmV3IENvbXBvbmVudFBvcnRhbChjb21wb25lbnRDbGFzcyk7XG5cbiAgICBjb25zdCBjb21wb25lbnRSZWYgPSBwb3J0YWxIb3N0LmF0dGFjaChwb3J0YWwpO1xuICAgIHRoaXMucHJvamVjdENvbXBvbmVudEJpbmRpbmdzKGNvbXBvbmVudFJlZiwgYmluZGluZ3MpO1xuICAgIHJldHVybiBjb21wb25lbnRSZWY7XG4gIH1cbn1cbiJdfQ==