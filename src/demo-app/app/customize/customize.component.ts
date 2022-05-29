import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent implements OnInit {
  min:number = 0;
  max: number = 100;
  from: number = 0;
  to: number = 80;


  step: number = 1;
  values:any[] =[];



  type: 'double' | 'single' = 'single';
  gridNum: number=10;
  showGrid: boolean = true;
  skin: string = 'flat';

  newValueValues: string;
  grid_margin: boolean;
  grid_snap: boolean;
  drag_interval: boolean;
  min_interval: number;
  max_interval: number;
  from_fixed: boolean;
  from_min: number | null;
  from_max: number | null;
  from_shadow: boolean;
  to_fixed: boolean;
  to_min: number | null;
  to_max: number | null;
  to_shadow: boolean;
  hide_min_max: boolean;
  hide_from_to: boolean;
  force_edges: boolean;
  prettify_enabled: boolean;
  prettify_separator: string;
  prefix: string | undefined;
  postfix: string | undefined;
  max_postfix: string | undefined;
  decorate_both: boolean;
  values_separator: string = ' - ';


  constructor() { }

  ngOnInit(): void {
  }


  onAddValue() {
    this.values = [...this.values, this.newValueValues ];
    this.newValueValues = '';
  }

  onRemoveValue(value: string) {
    this.values = this.values.filter(v => v !== value);
  }

  onSetMonthsValues() {
    this.values = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    this.postfix = '';
  }
}
