import { Component, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserModule } from '@angular/platform-browser';
import { Color, colorSets } from '@swimlane/ngx-charts/';
import { formatLabel, escapeLabel } from '@swimlane/ngx-charts/';
import { ColorHelper } from '@swimlane/ngx-charts/';
import { ScaleType } from '@swimlane/ngx-charts/';



import { single, multi } from './data';
import { data} from './data02';

@Component({
  selector: 'app-barchart',
  
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})


export class BarchartComponent implements OnInit {
  single=[];
  multi=[];
    //view: any; 
  //public view:any;
   // view: number[] = [350,450];
   public view: any[] = [500, 400];
   public datasingle:any;
   public datasingle2:any;
   public datamulti:any;

  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';
  timeline: boolean = true;
  autoScale: boolean=true;
  animations: boolean = true;
  //colorScheme: any;
  //colorScheme = ('cool')
  cardColor: string = '#232837';
 // lineChartSeries: any[] = lineChartSeries;

 public value: any = 50;
 previousValue: number = 70;
 units: string = 'twt';

 showLabels: boolean = true;
 isDoughnut: boolean = false;

 lineChartScheme: Color = {
  name: 'coolthree',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['red', 'blue', 'green', '#00bfa5']
};
piechart: Color = {
  name: 'coolthree',
  selectable: true,
  group: ScaleType.Ordinal,
domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
};
 
 
  
  constructor() {
     

 //  Object.assign(this, { single,multi,data });
   //Object.assign(this, { ob1 });
  // this.data = [...this.data];
  this.datasingle =data
  this.datamulti=multi
  this.datasingle2=data;
  // Object.assign(this, {data: [...single]});

   
    // Object.assign(this, { multi });
    
   }
   

  ngOnInit(): void {

    

     let id = setInterval(() => {
      this.updatedata()
    }, 5000);

    

  }
  updatedata() {

    
   //this.value+=5
   this.value=[...this.value]
    this.datasingle = [... this.datasingle]
  this.datamulti=multi
  this.datasingle2=[...this.datasingle2]
  
  }
    onSelect(event: any) {
    console.log(event);
  }
  

}
