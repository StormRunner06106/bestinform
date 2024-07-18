import {Data, Route} from "@angular/router";
import {UserRole} from "./user.model";

interface RouteData extends Data{
    allowedRoles?: UserRole[];
}

interface RouteWithGuard extends Route {
    data?: RouteData;
    children?: RoutesWithGuard;
}

export type RoutesWithGuard = RouteWithGuard[];
