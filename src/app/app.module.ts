import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BarchartComponent } from './componentes/barchart/barchart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Color, colorSets } from '@swimlane/ngx-charts/';
import { formatLabel, escapeLabel } from '@swimlane/ngx-charts/';

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import {  MatIconModule} from "@angular/material/icon";
import {  MatListModule} from "@angular/material/list";
import {  MatButtonModule} from "@angular/material/button";


@NgModule({
  declarations: [
    AppComponent,
    BarchartComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
