import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter, HostListener,
  Input,
  OnChanges,
  OnInit, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Cache} from './Cache';
import {gridsnap} from './gridsnap';

@Component({
  selector: 'ngx-ion-range-slider',
  templateUrl: './ngx-ion-range-slider.component.html',
  styleUrls: ['./ngx-ion-range-slider.component.scss'],
})
export class NgxIonRangeSliderComponent implements OnInit, AfterViewInit, OnChanges {
  // @ViewChild('ionRangeSlider', {static: true}) ionRangeSlider!: ElementRef;
  //
  // @ViewChild('.irs-single', {static: false})
  // irsSingle: HTMLSpanElement | undefined;
  @ViewChild('cache_rs') cache_rs: ElementRef<HTMLSpanElement> | undefined; //$cache.rs
  @ViewChild('cache_single') cache_single: ElementRef<HTMLSpanElement> | undefined; //$cache.single
  @ViewChild('cache_s_single') cache_s_single: ElementRef<HTMLSpanElement> | undefined; //$cache.single
  // @ViewChild('cache_bar') cache_bar: ElementRef<HTMLSpanElement> | undefined; //$cache.bar
  @ViewChild('cache_from') cache_from: ElementRef<HTMLSpanElement> | undefined; //$cache.from
  @ViewChild('cache_to') cache_to: ElementRef<HTMLSpanElement> | undefined; //$cache.to
  @ViewChild('cache_min') cache_min: ElementRef<HTMLSpanElement> | undefined; //$cache.min
  @ViewChild('cache_max') cache_max: ElementRef<HTMLSpanElement> | undefined; //$cache.max
  //
  // // @ViewChild('cache_bar') cache_bar: ElementRef<HTMLSpanElement> | undefined; //$cache.max
  @ViewChild('cache_s_from') cache_s_from: ElementRef<HTMLSpanElement> | undefined; //$cache.s_from
  @ViewChild('cache_s_to') cache_s_to: ElementRef<HTMLSpanElement> | undefined; //$cache.s_to
  // @ViewChild('cache_line') cache_line: ElementRef<HTMLSpanElement> | undefined;
  @ViewChild('cache_grid') cache_grid: ElementRef<HTMLSpanElement> | undefined;


  //Basic setup
  @Input() type: 'double' | 'single' = 'single';
  @Input() min: number = 0; //Slider minimum value
  @Input() max: number = 100; //Slider maximum value
  @Input() from: number | null = null; //start position for left handle (or for single handle)
  @Input() to: number | null = null; //Set start position for right handle

  //Advanced setup
  @Input() step: number = 1; //Set sliders step. Always > 0. Could be fractional.
  @Input() values: any[] = []; //Set up your own array of possible slider values. They could be numbers or strings. If the values array is set up, min, max and step param, are no longer can be changed.
  private p_values: any[] = [];
  @Input() keyboard: boolean = true; //Activates keyboard controls. Move left: ←, ↓, A, S. Move right: →, ↑, W, D.

  //Grid Setup
  @Input() grid: boolean = false; //Enables grid of values.
  @Input() grid_margin: boolean = true; //Set left and right grid borders.
  @Input() grid_num: number = 4; //Number of grid units.
  @Input() grid_snap: boolean = false; //Snap grid to sliders step (step param). If activated, grid_num will not be used.

  //Interval control
  @Input() drag_interval: boolean = false; //Allow user to drag whole range. Only in double type
  @Input() min_interval: number | undefined = undefined; //Set minimum diapason between sliders. Only in double type
  @Input() max_interval: number | undefined = undefined; //Set maximum diapason between sliders. Only in double type

  //Handles control
  @Input() from_fixed: boolean = false; //Fix position of left (or single) handle.
  @Input() from_min: number | null = null; //Set the maximum limit for left handle
  @Input() from_max: number | null = null; //Set the maximum limit for left handle
  @Input() from_shadow: boolean = false; //Highlight the limits for left handle
  @Input() to_fixed: boolean = false; //Fix position of right handle.
  @Input() to_min: number | null = null; //Set the minimum limit for right handle
  @Input() to_max: number | null = null; //Set the maximum limit for right handle
  @Input() to_shadow: boolean = false; //Highlight the limits for right handle

  //UI control
  @Input() skin: string = 'flat';
  @Input() hide_min_max: boolean = false; //Hides min and max labels.
  @Input() hide_from_to: boolean = false; //Hides from and to labels.
  @Input() force_edges: boolean = false; //Slider will be always inside it's container.
  // @Input() extra_classes: string = ''; //Traverse extra CSS-classes to slider container
  @Input() block: boolean = false; //Locks slider and makes it inactive (visually). input is NOT disabled. Can still be send with forms.

  //Prettify numbers
  @Input() prettify_enabled: boolean = true; //Enables prettify function.
  @Input() prettify_separator: string = ' '; //Set up your own separator for long numbers. 10 000, 10.000, 10-000 etc.
  //prettify
  @Input() prefix: string | undefined = undefined; //Set prefix for values. Will be set up right before the number: $100
  @Input() postfix: string | undefined = undefined; //Set postfix for values. Will be set up right after the number: 100k
  @Input() max_postfix: string | undefined = undefined; //Special postfix, used only for maximum value. Will be showed after handle will reach maximum right position. For example 0 — 100+
  @Input() decorate_both: boolean = true; //Used for "double" type and only if prefix or postfix was set up. Determine how to decorate close values. For example: $10k — $100k or $10 — 100k
  @Input() values_separator: string = ' - '; //Set your own separator for close values. Used for double type. Default: 10 — 100. Or you may set: 10 to 100, 10 + 100, 10 → 100 etc.

  //Data control
  // @Input() input_values_separator: string = ';'; //Separator for double values in input value property. Default FROM;TO. Only for double type
  // @Input() disable: boolean = false; //Locks slider and makes it inactive. input is disabled too. Invisible to forms.

  @Input() showDebugInfo: boolean = false;

  @HostListener('document:mousemove', ['$event'])
  mouseMoveOutside(event: MouseEvent) {
    this.pointerMove(event);
  }

  @HostListener('window:mouseup', ['$event'])
  mouseUp(event: MouseEvent) {
    this.pointerUp(event);
  }


  @Output() change = new EventEmitter<number | { min: number, max: number }>();
  @Output() changeFinish = new EventEmitter<number | { min: number, max: number }>();

  calc_count = 0;
  update_tm = 0;
  old_from = 0;
  old_to = 0;
  old_min_interval: number | null = null;
  raf_id = null;
  dragging = false;
  force_redraw = false;
  no_diapason = false;
  has_tab_index = true;
  is_key = false;
  is_update = false;
  is_start = true;
  is_finish = false;
  is_active = false;
  is_resize = false;
  is_click = false;
  target: string | null = 'base';

  // storage for measure variables
  coords = {
    // left
    x_gap: 0,
    x_pointer: 0,

    // width
    w_rs: 0,
    w_rs_old: 0,
    w_handle: 0,

    // percents
    p_gap: 0,
    p_gap_left: 0,
    p_gap_right: 0,
    p_step: 0,
    p_pointer: 0,
    p_handle: 0,
    p_single_fake: 0,
    p_single_real: 0,
    p_from_fake: 0,
    p_from_real: 0,
    p_to_fake: 0,
    p_to_real: 0,
    p_bar_x: 0,
    p_bar_w: 0,

    // grid
    grid_gap: 0,
    big_num: 0,
    big: <number[]>[],
    big_w: <number[]>[],
    big_p: <number[]>[],
    big_x: <number[]>[],
  };

  // storage for labels measure variables
  labels = {
    // width
    w_min: 0,
    w_max: 0,
    w_from: 0,
    w_to: 0,
    w_single: 0,

    // percents
    p_min: 0,
    p_max: 0,
    p_from_fake: 0,
    p_from_left: 0,
    p_to_fake: 0,
    p_to_left: 0,
    p_single_fake: 0,
    p_single_left: 0,
  };

  // default result object, returned to callbacks
  result = {
    //  input: this.$cache.input,
    slider: null,

    min: this.min, //  min: this.options.min,
    max: this.max, //  max: this.options.max,

    from: this.from, //from: this.options.from,
    from_percent: 0,
    from_value: null,

    to: this.to, //to: this.options.to,
    to_percent: 0,
    to_value: null,

    from_pretty: null,
    to_pretty: null,

    min_pretty: '',
    max_pretty: '',
  };

  smallGridSnap: gridsnap[] = [];
  bigGridSnap: gridsnap[] = [];

  cache: Cache = {
    bar: {style: {left: '', width: ''}, html: '', isVisible: false},
    from: {style: {left: '', width: ''}, html: '', isVisible: true},
    to: {style: {left: '', width: ''}, html: '', isVisible: true},
    s_from: {style: {left: '', width: ''}, html: '', isVisible: false},
    s_to: {style: {left: '', width: ''}, html: '', isVisible: false},
    min: {style: {left: '', width: ''}, html: '', isVisible: true},
    max: {style: {left: '', width: ''}, html: '', isVisible: true},
    single: {style: {left: '', width: ''}, html: '', isVisible: true},
    grid: {style: {left: '', width: ''}, html: '', isVisible: false},
    s_single: {style: {left: '', width: ''}, html: '', isVisible: false},
    shad_single: {style: {left: '', width: ''}, html: '', isVisible: false},
    shad_from: {style: {left: '', width: ''}, html: '', isVisible: false},
    shad_to: {style: {left: '', width: ''}, html: '', isVisible: false},
  };


  cache_grid_labels: HTMLSpanElement[] = [];

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.validate();
    this.update();
    
    if (!changes.min?.firstChange || !changes.max?.firstChange || !changes.step?.firstChange) {
      this.update();
    }

    if (!changes.from?.firstChange) {
      this.update();
    }
    if (!changes.grid?.firstChange) {

      setTimeout(() => {
        this.init(false)
       this.update();
        this.calculateGrid();
      }, 80);
    }
    if (!changes.values?.firstChange) {
      this.init(false)
      setTimeout(() => {
        if (changes.values && changes.values.currentValue.length === 0){
          this.p_values = [];
          this.validate();
          this.setMinMax();
          this.update();
          this.calculateGrid();
          setTimeout(()=>{
            this.init(true)
            this.update();
          },80)
        }else {
          this.init(false)
          this.update();
          this.calculateGrid();
          this.calcLabels();
        }
      }, 80);
    }

    if (!changes.type?.firstChange) {


      this.init(false);

      setTimeout(() => {
        this.init(true)

      }, 80);

    }
    this.update();
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      //   this.validate();
      this.init(false);
      this.calculateGrid();
    }, 200);
    setTimeout(() => {
      this.init(false);
      this.calculateGrid();
    }, 400);
  }

  ngOnInit(): void {
  }

  validate() {
    let v = this.values;
    let vl = v.length;
    let value;
    let i;

    if (this.max < this.min) {
      this.max = this.min;
    }

    if (vl) {
      this.p_values = [];
      this.min = 0;
      this.max = vl - 1;
      this.step = 1;
      this.grid_num = this.max;
      this.grid_snap = true;

      for (i = 0; i < vl; i++) {
        value = +v[i];

        if (!isNaN(value)) {
          v[i] = value;
          value = this._prettify(value);
        } else {
          value = v[i];
        }

        this.p_values.push(value);
      }
    }

    if (typeof this.from !== 'number' || isNaN(this.from)) {
      this.from = this.min;
    }

    if (typeof this.to !== 'number' || isNaN(this.to)) {
      this.to = this.max;
    }

    if (this.type === 'single') {
      if (this.from < this.min) this.from = this.min;
      if (this.from > this.max) this.from = this.max;
    } else {
      if (this.from < this.min) this.from = this.min;
      if (this.from > this.max) this.from = this.max;

      if (this.to < this.min) this.to = this.min;
      if (this.to > this.max) this.to = this.max;

      // if (this.update_check.from) {
      //
      //   if (this.update_check.from !== o.from) {
      //     if (o.from > o.to) o.from = o.to;
      //   }
      //   if (this.update_check.to !== o.to) {
      //     if (o.to < o.from) o.to = o.from;
      //   }
      //
      // }

      if (this.from > this.to) this.from = this.to;
      if (this.to < this.from) this.to = this.from;
    }

    if (
      typeof this.step !== 'number' ||
      isNaN(this.step) ||
      !this.step ||
      this.step < 0
    ) {
      this.step = 1;
    }

    if (typeof this.from_min === 'number' && this.from < this.from_min) {
      this.from = this.from_min;
    }

    if (typeof this.from_max === 'number' && this.from > this.from_max) {
      this.from = this.from_max;
    }

    if (typeof this.to_min === 'number' && this.to < this.to_min) {
      this.to = this.to_min;
    }

    if (typeof this.to_max === 'number' && this.from > this.to_max) {
      this.to = this.to_max;
    }

    if (this.result) {
      if (this.result.min !== this.min) {
        this.result.min = this.min;
      }

      if (this.result.max !== this.max) {
        this.result.max = this.max;
      }

      // @ts-ignore
      if (
        this.result.from == null ||
        this.result.from < this.result.min ||
        this.result.from > this.result.max
      ) {
        this.result.from = this.from;
      }

      // @ts-ignore
      if (
        this.result.to == null ||
        this.result.to < this.result.min ||
        this.result.to > this.result.max
      ) {
        this.result.to = this.to;
      }
    }

    if (
      typeof this.min_interval !== 'number' ||
      isNaN(this.min_interval) ||
      !this.min_interval ||
      this.min_interval < 0
    ) {
      this.min_interval = 0;
    }

    if (
      typeof this.max_interval !== 'number' ||
      isNaN(this.max_interval) ||
      !this.max_interval ||
      this.max_interval < 0
    ) {
      this.max_interval = 0;
    }

    if (this.min_interval && this.min_interval > this.max - this.min) {
      this.min_interval = this.max - this.min;
    }

    if (this.max_interval && this.max_interval > this.max - this.min) {
      this.max_interval = this.max - this.min;
    }
  }

  init(is_update: boolean = false) {

    this.no_diapason = false;
    this.coords.p_step = this.convertToPercent(this.step, true);

    this.target = 'base';

    // this.toggleInput();

    this.setMinMax();

    if (is_update) {
      this.force_redraw = true;
      this.calc(true);
      //
      // callbacks called
      //   this.callOnUpdate();
    } else {
      this.force_redraw = true;
      this.calc(true);
      //
      //   // callbacks called
      //   this.callOnStart();
    }

    this.updateScene();
  }

  /**
   * Set visibility and content
   * of Min and Max labels
   */
  setMinMax() {
    if (this.hide_min_max) {
      this.cache.min.isVisible = false;
      this.cache.max.isVisible = false;
      return;
    }

    if (this.values.length) {

      this.cache.min.html = (this.decorate(this.p_values[this.min], undefined));
      this.cache.max.html = this.decorate(this.p_values[this.max], undefined)//   this.$cache.max.html(this.decorate(this.options.p_values[this.options.max]));
    } else {
      let min_pretty = this._prettify(this.min);
      let max_pretty = this._prettify(this.max);

      this.result.min_pretty = min_pretty;
      this.result.max_pretty = max_pretty;

      this.cache.min.html = this.decorate(min_pretty, this.min);
      this.cache.max.html = this.decorate(max_pretty, this.max);
    }

    this.labels.w_min = this.outerWidth(this.cache_min);
    this.labels.w_max = this.outerWidth(this.cache_max);
  }

  /**
   * Mousemove or touchmove
   * only for handlers
   *
   * @param e {Object} event object
   */
  pointerMove(
    e: MouseEvent
    //  | TouchEvent
  ) {
    if (!this.dragging) {
      return;
    }

    let x = e.pageX; // || e.originalEvent.touches && e.originalEvent.touches[0].pageX;
    this.coords.x_pointer = x - this.coords.x_gap;
    // console.log('pointerMove', this.coords.x_pointer);
    this.calc();

    this.drawHandles();
  }

  /**
   * Mousedown or touchstart
   * for other slider elements, like diapason line
   *
   * @param target {String}
   * @param e {Object} event object
   */
  pointerClick(target: string, event: MouseEvent): void {

    const x = event.pageX; // || e.originalEvent.touches && e.originalEvent.touches[0].pageX;
    if (event.button === 2) {
      return;
    }

    this.target = target;

    this.is_click = true;
    this.coords.x_gap = this.officeLeft(this.cache_rs);// this.$cache.rs.offset().left;
    this.coords.x_pointer = +(x - this.coords.x_gap).toFixed();

    this.force_redraw = true;
    this.calc();
    this.drawHandles();
    // this.$cache.line.trigger("focus");
  }


  pointerDown(target: string, event: MouseEvent) {
    let x = event.pageX; //||  event.originalEvent.touches && event.originalEvent.touches[0].pageX;
    if (event.button === 2) {
      return;
    }

    if (target === 'both') {
      this.setTempMinInterval();
    }
    //
    if (!target) {
      target = this.target || 'from';
    }

    this.target = target;

    this.is_active = true;
    this.dragging = true;

    this.coords.x_gap = this.officeLeft(this.cache_rs); //this.coords.x_gap = this.$cache.rs.offset().left;

    this.coords.x_pointer = x - this.coords.x_gap;

    this.calcPointerPercent();
    this.changeLevel(target);


    this.updateScene();
  }

  /**
   * Mouseup or touchend
   * only for handlers
   *
   * @param e {Object} event object
   */
  pointerUp(e: any) {
    if (this.is_active) {
      this.is_active = false;
    } else {
      return;
    }
    //
    // this.$cache.cont.find(".state_hover").removeClass("state_hover");
    //
    this.force_redraw = true;
    //
    // if (is_old_ie) {
    //   $("*").prop("unselectable", false);
    // }
    //
    this.updateScene();
    this.restoreOriginalMinInterval();
    //
    // callbacks call
    if (this.dragging){//if ($.contains(this.$cache.cont[0], e.target) || this.dragging) {
      this.callOnFinish();
    }
    //
    this.dragging = false;
  }

  /**
   * Then dragging interval, prevent interval collapsing
   * using min_interval option
   */
  setTempMinInterval() {
    const interval = (this.result.to ?? 0) - (this.result.from ?? 0);

    if (this.old_min_interval === null) {
      this.old_min_interval = this.min_interval ?? 0;
    }

    this.min_interval = interval;
  }

  /**
   * Restore min_interval option to original
   */
  restoreOriginalMinInterval() {
    if (this.old_min_interval !== null) {
      this.min_interval = this.old_min_interval;
      this.old_min_interval = null;
    }
  }

  /**
   * All calculations and measures start here
   *
   * @param update {boolean=}
   */
  calc(update?: boolean) {
    this.calc_count++;

    if (this.calc_count === 10 || update) {
      this.calc_count = 0;
      this.coords.w_rs = this.outerWidth(this.cache_rs);
      this.calcHandlePercent();
    }

    if (!this.coords.w_rs) {
      return;
    }

    this.calcPointerPercent();
    let handle_x = this.getHandleX();

    if (this.target === 'both') {
      this.coords.p_gap = 0;
      handle_x = this.getHandleX();
    }

    if (this.target === 'click') {
      this.coords.p_gap = this.coords.p_handle / 2;
      handle_x = this.getHandleX();

      if (this.drag_interval) {
        this.target = 'both_one';
      } else {
        this.target = this.chooseHandle(handle_x);
      }
    }

    switch (this.target) {
      case 'base':
        let w = (this.max - this.min) / 100;
        // @ts-ignore
        let f = (this.result.from - this.min) / w;
        // @ts-ignore
        let t = (this.result.to - this.min) / w;

        this.coords.p_single_real = this.toFixed(f);
        this.coords.p_from_real = this.toFixed(f);
        this.coords.p_to_real = this.toFixed(t);

        this.coords.p_single_real = this.checkDiapason(
          this.coords.p_single_real,
          this.from_min,
          this.from_max
        );
        this.coords.p_from_real = this.checkDiapason(
          this.coords.p_from_real,
          this.from_min,
          this.from_max
        );
        this.coords.p_to_real = this.checkDiapason(
          this.coords.p_to_real,
          this.to_min,
          this.to_max
        );

        this.coords.p_single_fake = this.convertToFakePercent(
          this.coords.p_single_real
        );
        this.coords.p_from_fake = this.convertToFakePercent(
          this.coords.p_from_real
        );
        this.coords.p_to_fake = this.convertToFakePercent(
          this.coords.p_to_real
        );

        this.target = null;

        break;

      case 'single':
        if (this.from_fixed) {
          break;
        }

        this.coords.p_single_real = this.convertToRealPercent(handle_x);
        this.coords.p_single_real = this.calcWithStep(
          this.coords.p_single_real
        );
        this.coords.p_single_real = this.checkDiapason(
          this.coords.p_single_real,
          this.from_min,
          this.from_max
        );

        this.coords.p_single_fake = this.convertToFakePercent(
          this.coords.p_single_real
        );

        break;

      case 'from':
        if (this.from_fixed) {
          break;
        }

        this.coords.p_from_real = this.convertToRealPercent(handle_x);
        this.coords.p_from_real = this.calcWithStep(this.coords.p_from_real);
        if (this.coords.p_from_real > this.coords.p_to_real) {
          this.coords.p_from_real = this.coords.p_to_real;
        }
        this.coords.p_from_real = this.checkDiapason(
          this.coords.p_from_real,
          this.from_min,
          this.from_max
        );
        this.coords.p_from_real = this.checkMinInterval(
          this.coords.p_from_real,
          this.coords.p_to_real,
          'from'
        );
        this.coords.p_from_real = this.checkMaxInterval(
          this.coords.p_from_real,
          this.coords.p_to_real,
          'from'
        );

        this.coords.p_from_fake = this.convertToFakePercent(
          this.coords.p_from_real
        );

        break;

      case 'to':
        if (this.to_fixed) {
          break;
        }

        this.coords.p_to_real = this.convertToRealPercent(handle_x);
        this.coords.p_to_real = this.calcWithStep(this.coords.p_to_real);
        if (this.coords.p_to_real < this.coords.p_from_real) {
          this.coords.p_to_real = this.coords.p_from_real;
        }
        this.coords.p_to_real = this.checkDiapason(
          this.coords.p_to_real,
          this.to_min,
          this.to_max
        );
        this.coords.p_to_real = this.checkMinInterval(
          this.coords.p_to_real,
          this.coords.p_from_real,
          'to'
        );
        this.coords.p_to_real = this.checkMaxInterval(
          this.coords.p_to_real,
          this.coords.p_from_real,
          'to'
        );

        this.coords.p_to_fake = this.convertToFakePercent(
          this.coords.p_to_real
        );

        break;

      case 'both':
        if (this.from_fixed || this.to_fixed) {
          break;
        }

        handle_x = this.toFixed(handle_x + this.coords.p_handle * 0.001);

        this.coords.p_from_real =
          this.convertToRealPercent(handle_x) - this.coords.p_gap_left;
        this.coords.p_from_real = this.calcWithStep(this.coords.p_from_real);
        this.coords.p_from_real = this.checkDiapason(
          this.coords.p_from_real,
          this.from_min,
          this.from_max
        );
        this.coords.p_from_real = this.checkMinInterval(
          this.coords.p_from_real,
          this.coords.p_to_real,
          'from'
        );
        this.coords.p_from_fake = this.convertToFakePercent(
          this.coords.p_from_real
        );

        this.coords.p_to_real =
          this.convertToRealPercent(handle_x) + this.coords.p_gap_right;
        this.coords.p_to_real = this.calcWithStep(this.coords.p_to_real);
        this.coords.p_to_real = this.checkDiapason(
          this.coords.p_to_real,
          this.to_min,
          this.to_max
        );
        this.coords.p_to_real = this.checkMinInterval(
          this.coords.p_to_real,
          this.coords.p_from_real,
          'to'
        );
        this.coords.p_to_fake = this.convertToFakePercent(
          this.coords.p_to_real
        );

        break;

      case 'both_one':
        if (this.from_fixed || this.to_fixed) {
          break;
        }

        let real_x = this.convertToRealPercent(handle_x);
        let from = this.result.from_percent;
        let to = this.result.to_percent;
        let full = to - from;
        let half = full / 2;
        let new_from = real_x - half;
        let new_to = real_x + half;

        if (new_from < 0) {
          new_from = 0;
          new_to = new_from + full;
        }

        if (new_to > 100) {
          new_to = 100;
          new_from = new_to - full;
        }

        this.coords.p_from_real = this.calcWithStep(new_from);
        this.coords.p_from_real = this.checkDiapason(
          this.coords.p_from_real,
          this.from_min,
          this.from_max
        );
        this.coords.p_from_fake = this.convertToFakePercent(
          this.coords.p_from_real
        );

        this.coords.p_to_real = this.calcWithStep(new_to);
        this.coords.p_to_real = this.checkDiapason(
          this.coords.p_to_real,
          this.to_min,
          this.to_max
        );
        this.coords.p_to_fake = this.convertToFakePercent(
          this.coords.p_to_real
        );

        break;
    }

    if (this.type === 'single') {
      this.coords.p_bar_x = this.coords.p_handle / 2;
      this.coords.p_bar_w = this.coords.p_single_fake;

      this.result.from_percent = this.coords.p_single_real;
      this.result.from = this.convertToValue(this.coords.p_single_real);
      this.result.from_pretty = this._prettify(this.result.from);

      if (this.values.length) {
        this.result.from_value = this.values[this.result.from];
      }
    } else {
      this.coords.p_bar_x = this.toFixed(
        this.coords.p_from_fake + this.coords.p_handle / 2
      );
      this.coords.p_bar_w = this.toFixed(
        this.coords.p_to_fake - this.coords.p_from_fake
      );

      this.result.from_percent = this.coords.p_from_real;
      this.result.from = this.convertToValue(this.coords.p_from_real);
      this.result.from_pretty = this._prettify(this.result.from);
      this.result.to_percent = this.coords.p_to_real;
      this.result.to = this.convertToValue(this.coords.p_to_real);
      this.result.to_pretty = this._prettify(this.result.to);

      if (this.values.length) {
        this.result.from_value = this.values[this.result.from];
        this.result.to_value = this.values[this.result.to];
      }
    }

    this.calcMinMax();
    this.calcLabels();
  }

  /**
   * Measure Min and Max labels width in percent
   */
  calcMinMax() {
    if (!this.coords.w_rs) {
      return;
    }

    this.labels.p_min = (this.labels.w_min / this.coords.w_rs) * 100;
    this.labels.p_max = (this.labels.w_max / this.coords.w_rs) * 100;
  }

  /**
   * Measure labels width and X in percent
   */
  calcLabels() {
    if (!this.coords.w_rs || this.hide_from_to) {
      return;
    }

    if (this.type === 'single') {
      this.labels.w_single = this.outerWidth(this.cache_single);
      this.labels.p_single_fake =
        (this.labels.w_single / this.coords.w_rs) * 100;
      this.labels.p_single_left =
        this.coords.p_single_fake +
        this.coords.p_handle / 2 -
        this.labels.p_single_fake / 2;
      this.labels.p_single_left = this.checkEdges(
        this.labels.p_single_left,
        this.labels.p_single_fake
      );
    } else {
      this.labels.w_from = this.outerWidth(this.cache_from);
      //console.log('calculated w_from', this.labels.w_from, ' w_rs', this.coords.w_rs);

      this.labels.p_from_fake = (this.labels.w_from / this.coords.w_rs) * 100;
      this.labels.p_from_left =
        this.coords.p_from_fake +
        this.coords.p_handle / 2 -
        this.labels.p_from_fake / 2;
      this.labels.p_from_left = this.toFixed(this.labels.p_from_left);
      this.labels.p_from_left = this.checkEdges(
        this.labels.p_from_left,
        this.labels.p_from_fake
      );

      this.labels.w_to = this.outerWidth(this.cache_to);
      this.labels.p_to_fake = (this.labels.w_to / this.coords.w_rs) * 100;
      this.labels.p_to_left =
        this.coords.p_to_fake +
        this.coords.p_handle / 2 -
        this.labels.p_to_fake / 2;
      this.labels.p_to_left = this.toFixed(this.labels.p_to_left);
      this.labels.p_to_left = this.checkEdges(
        this.labels.p_to_left,
        this.labels.p_to_fake
      );

      this.labels.w_single = this.outerWidth(this.cache_single); //   this.labels.w_single = this.$cache.single.outerWidth(false);
      
      this.labels.p_single_fake =
        (this.labels.w_single / this.coords.w_rs) * 100;
      this.labels.p_single_left =
        (this.labels.p_from_left +
          this.labels.p_to_left +
          this.labels.p_to_fake) /
        2 -
        this.labels.p_single_fake / 2;
      this.labels.p_single_left = this.toFixed(this.labels.p_single_left);
      this.labels.p_single_left = this.checkEdges(
        this.labels.p_single_left,
        this.labels.p_single_fake
      );
    }
  }

  convertToRealPercent(fake: any) {
    const full = 100 - this.coords.p_handle;
    return (fake / full) * 100;
  }

  convertToFakePercent(real: any) {
    const full = 100 - this.coords.p_handle;
    return (real / 100) * full;
  }

  checkEdges(left: number, width: number) {
    if (!this.force_edges) {
      return this.toFixed(left);
    }

    if (left < 0) {
      left = 0;
    } else if (left > 100 - width) {
      left = 100 - width;
    }

    return this.toFixed(left);
  }

  getHandleX() {
    let max = 100 - this.coords.p_handle,
      x = this.toFixed(this.coords.p_pointer - this.coords.p_gap);

    if (x < 0) {
      x = 0;
    } else if (x > max) {
      x = max;
    }

    return x;
  }

  toFixed(num: number): number {
    num = +num.toFixed(20);
    return num;
  }

  calcHandlePercent() {
    if (this.type === 'single') {
      this.coords.w_handle = this.outerWidth(this.cache_s_single);
    } else {
      this.coords.w_handle = this.outerWidth(this.cache_s_from);
    }

    this.coords.p_handle = this.toFixed(
      (this.coords.w_handle / this.coords.w_rs) * 100
    );
  }

  /**
   * calculates pointer X in percent
   */
  calcPointerPercent() {
    if (!this.coords.w_rs) {
      this.coords.p_pointer = 0;
      return;
    }

    if (this.coords.x_pointer < 0 || isNaN(this.coords.x_pointer)) {
      this.coords.x_pointer = 0;
    }
    //This check is not needed in angular!
    //else if (this.coords.x_pointer > this.coords.w_rs) {
    //this.coords.x_pointer = this.coords.w_rs;
    //}

    this.coords.p_pointer = this.toFixed(
      (this.coords.x_pointer / this.coords.w_rs) * 100
    );
  }

  /**
   * Round percent value with step
   *
   * @param percent {Number}
   * @returns percent {Number} rounded
   */
  calcWithStep(percent: number): number {
    let rounded = Math.round(percent / this.coords.p_step) * this.coords.p_step;

    if (rounded > 100) {
      rounded = 100;
    }
    if (percent === 100) {
      rounded = 100;
    }

    return this.toFixed(rounded);
  }

  /**
   * Draw labels
   * measure labels collisions
   * collapse close labels
   */
  drawLabels() {
    const values_num = this.values.length;
    const p_values = this.p_values;
    let text_single = '';
    let text_from = '';
    let text_to = '';
    let from_pretty: string;
    let to_pretty: string;

    if (this.hide_from_to) {
      this.cache.single.style.visibility = 'hidden';
      this.cache.from.style.visibility = 'hidden';
      this.cache.to.style.visibility = 'hidden';
      return;
    }
    //
    if (this.type === 'single') {
      this.cache.single.isVisible = true;
      this.cache.single.style.visibility = 'visible';
      this.cache.from.isVisible = true;
      this.cache.from.style.visibility = 'hidden';
      this.cache.to.isVisible = false;
      this.cache.to.style.visibility = 'hidden';
      if (values_num) {
        text_single = this.decorate(p_values[this.result.from ?? 0], undefined);
        this.cache.single.html = text_single;//     this.$cache.single.html(text_single);
      } else {
        from_pretty = this._prettify(this.result.from);

        text_single = this.decorate(from_pretty, this.result.from);
        this.cache.single.html = text_single; //     this.$cache.single.html(text_single);
      }
      //
      this.calcLabels();
      //
      if (this.labels.p_single_left < this.labels.p_min + 1) {
        this.cache.min.isVisible = false; //this.cache.min.style.visibility = 'hidden';//      this.$cache.min[0].style.visibility = "hidden";
      } else {
        this.cache.min.isVisible = true; // this.cache.min.style.visibility = 'visible';//    this.$cache.min[0].style.visibility = "visible";
      }
      //
      if (
        this.labels.p_single_left + this.labels.p_single_fake >
        100 - this.labels.p_max - 1
      ) {
        this.cache.max.isVisible = false; //this.cache.max.style.visibility = 'hidden'; //     this.$cache.max[0].style.visibility = "hidden";
      } else {
        this.cache.max.isVisible = true; // this.cache.max.style.visibility = 'visible'; //    this.$cache.max[0].style.visibility = "visible";
      }
      //
    } else {
      this.cache.to.isVisible = true;
      if (values_num) {
        if (this.decorate_both) {
          text_single = this.decorate(p_values[this.result.from ?? 0], undefined);
          text_single += this.values_separator;
          text_single += this.decorate(p_values[this.result.to ?? 0], undefined);
        } else {
          text_single = this.decorate(p_values[this.result.from ?? 0] + this.values_separator + p_values[this.result.to ?? 0], undefined);
        }
        text_from = this.decorate(p_values[this.result.from ?? 0], undefined);
        text_to = this.decorate(p_values[this.result.to ?? 0], undefined);
        //
        this.cache.single.html = text_single;
        this.cache.from.html = text_from;
        this.cache.to.html = text_to;
        //
      } else {
        from_pretty = this._prettify(this.result.from);
        to_pretty = this._prettify(this.result.to);

        if (this.decorate_both) {
          text_single = this.decorate(from_pretty, this.result.from);
          text_single += this.values_separator;
          text_single += this.decorate(to_pretty, this.result.to);
        } else {
          text_single = this.decorate(
            from_pretty + this.values_separator + to_pretty,
            this.result.to
          );
        }
        text_from = this.decorate(from_pretty, this.result.from);
        text_to = this.decorate(to_pretty, this.result.to);
        //
        this.cache.single.html = text_single;
        this.cache.from.html = text_from;
        this.cache.to.html = text_to;
        //
      }

      this.calcLabels();


      const min = Math.min(this.labels.p_single_left, this.labels.p_from_left);
      let single_left = this.labels.p_single_left + this.labels.p_single_fake;
      let to_left = this.labels.p_to_left + this.labels.p_to_fake;
      let max = Math.max(single_left, to_left);
      
      if (
        this.labels.p_from_left + this.labels.p_from_fake >=
        this.labels.p_to_left
      ) {
        this.cache.from.isVisible = true;
        this.cache.from.style.visibility = 'hidden'; //.isVisible = false; //     this.$cache.from[0].style.visibility = "hidden";
        this.cache.to.isVisible = true;
        this.cache.to.style.visibility = 'hidden';// = false; //     this.$cache.to[0].style.visibility = "hidden";
        this.cache.single.isVisible = true;
        this.cache.single.style.visibility = 'visible';//     this.$cache.single[0].style.visibility = "visible";


        if (this.result.from === this.result.to) {
          if (this.target === 'from') {
            this.cache.from.isVisible = true;
            this.cache.from.style.visibility = 'visible'; //this.$cache.from[0].style.visibility = "visible";
          } else if (this.target === 'to') {
            this.cache.to.isVisible = true;
            this.cache.to.style.visibility = 'visible'; //this.$cache.to[0].style.visibility = "visible";
          } else if (!this.target) {
            this.cache.from.isVisible = true;
            this.cache.from.style.visibility = 'visible'; //this.$cache.from[0].style.visibility = "visible";
          }
          this.cache.single.isVisible = true;
          this.cache.single.style.visibility = 'hidden';//this.$cache.single[0].style.visibility = "hidden";
          max = to_left;
        } else {
          this.cache.from.style.visibility = 'hidden'; //this.cache.from.isVisible = false; //       this.$cache.from[0].style.visibility = "hidden";
          this.cache.to.style.visibility = 'hidden';//this.cache.to.isVisible = false; //       this.$cache.to[0].style.visibility = "hidden";
          this.cache.single.style.visibility = 'visible'; //this.cache.single.isVisible = true; //       this.$cache.single[0].style.visibility = "visible";
          max = Math.max(single_left, to_left);
        }
      } else {
        this.cache.from.style.visibility = 'visible';//this.cache.from.isVisible = true; //     this.$cache.from[0].style.visibility = "visible";
        this.cache.to.style.visibility = 'visible';//this.cache.to.isVisible = true; //     this.$cache.to[0].style.visibility = "visible";
        this.cache.single.style.visibility = 'hidden';//this.cache.single.isVisible = false; //     this.$cache.single[0].style.visibility = "hidden";
      }

      if (min < this.labels.p_min + 1) {
        this.cache.min.isVisible = false; //this.cache.min.style.visibility = 'hidden';//     this.$cache.min[0].style.visibility = "hidden";
      } else {
        this.cache.min.isVisible = true; //this.cache.min.style.visibility = 'visible'; //     this.$cache.min[0].style.visibility = "visible";
      }

      if (max > 100 - this.labels.p_max - 1) {
        this.cache.max.isVisible = false; //  this.cache.max.style.visibility = 'hidden'; //this.$cache.max[0].style.visibility = "hidden";
      } else {
        this.cache.max.isVisible = true; //this.cache.max.style.visibility = 'visible'; // this.$cache.max[0].style.visibility = "visible";
      }
    }
  }

  /**
   * Draw handles
   */
  drawHandles() {
    
    this.coords.w_rs = this.outerWidth(this.cache_rs); //this.$cache.rs.outerWidth(false);

    if (!this.coords.w_rs) {
      return;
    }

    if (this.coords.w_rs !== this.coords.w_rs_old) {
      this.target = 'base';
      this.is_resize = true;
    }

    if (this.coords.w_rs !== this.coords.w_rs_old || this.force_redraw) {
      this.setMinMax();
      this.calc(true);
      this.drawLabels();
      if (this.grid) {


        this.calcGridMargin();
        this.calcGridLabels();


      }
      this.force_redraw = true;
      this.coords.w_rs_old = this.coords.w_rs;
      this.drawShadow();
    }
    //
    if (!this.coords.w_rs) {
      return;
    }
    //
    if (!this.dragging && !this.force_redraw && !this.is_key) {
      console.log('exit 945');
      return;
    }
    
    if (
      this.old_from !== this.result.from ||
      this.old_to !== this.result.to ||
      this.force_redraw ||
      this.is_key
    ) {
      
      this.drawLabels();
      //
      this.cache.bar.style.left = this.coords.p_bar_x + '%';
      this.cache.bar.style.width = this.coords.p_bar_w + '%';
      //
      if (this.type === 'single') {
        this.cache.bar.style.left = '0';
        this.cache.bar.style.width =
          this.coords.p_bar_w + this.coords.p_bar_x + '%';

        this.cache.s_single.style.left = this.coords.p_single_fake + '%';

        this.cache.single.style.left = this.labels.p_single_left + '%';
      } else {
        this.cache.s_from.style.left = this.coords.p_from_fake + '%';
        this.cache.s_to.style.left = this.coords.p_to_fake + '%';

        if (this.old_from !== this.result.from || this.force_redraw) {
          this.cache.from.style.left = this.labels.p_from_left + '%';
        }
        if (this.old_to !== this.result.to || this.force_redraw) {
          this.cache.to.style.left = this.labels.p_to_left + '%';
        }

        this.cache.single.style.left = this.labels.p_single_left + '%';
      }
      //
      this.writeToInput();
      //
      if (
        this.old_from !== this.result.from ||
        (this.old_to !== this.result.to && !this.is_start)
      ) {
        //     this.$cache.input.trigger("change");
        //     this.$cache.input.trigger("input");
      }
      //
      this.old_from = this.result.from ?? this.min;
      this.old_to = this.result.to ?? this.max;

      // callbacks call
      if (
        !this.is_resize &&
        !this.is_update &&
        !this.is_start &&
        !this.is_finish
      ) {
        this.callOnChange();
      }
      if (this.is_key || this.is_click) {
        this.is_key = false;
        this.is_click = false;
        this.callOnFinish();
      }
      //
      this.is_update = false;
      this.is_resize = false;
      this.is_finish = false;
    }

    this.is_start = false;
    this.is_key = false;
    this.is_click = false;
    this.force_redraw = false;
  }

  /**
   * Write values to input element
   */
  writeToInput() {

    if (this.type === 'single') {

      if (this.values.length) {
        this.change.emit(this.result.from_value ?? 0);//this.$cache.input.prop("value", this.result.from_value);
      } else {
        this.change.emit(this.result.from ?? 0);//this.$cache.input.prop("value", this.result.from);
      }
      //this.$cache.input.data("from", this.result.from);
    } else {

      if (this.values.length) {
        this.change.emit({min: this.result.from_value ?? 0, max: this.result.to_value ?? 0});//this.$cache.input.prop("value", this.result.from_value + this.options.input_values_separator + this.result.to_value);

      } else {
        this.change.emit({min: this.result.from ?? 0, max: this.result.to ?? 0});//this.$cache.input.prop("value", this.result.from + this.options.input_values_separator + this.result.to);
      }
      // this.$cache.input.data("from", this.result.from);
      // this.$cache.input.data("to", this.result.to);
    }


  }


  update(): void {
//   if (!this.input) {
//   return;
// }

    this.is_update = true;

// this.options.from = this.result.from;
// this.options.to = this.result.to;
// this.update_check.from = this.result.from;
// this.update_check.to = this.result.to;
//
// this.options = $.extend(this.options, options);
    this.validate();
    this.updateResult();

// this.toggleInput();
    this.remove();
    this.init(true);
  }

  /**
   * Remove slider instance
   * and unbind all events
   */
  remove(): void {
    // this.$cache.cont.remove();
    // this.$cache.cont = null;
    //
    // this.$cache.line.off("keydown.irs_" + this.plugin_count);
    //
    // this.$cache.body.off("touchmove.irs_" + this.plugin_count);
    // this.$cache.body.off("mousemove.irs_" + this.plugin_count);
    //
    // this.$cache.win.off("touchend.irs_" + this.plugin_count);
    // this.$cache.win.off("mouseup.irs_" + this.plugin_count);
    //
    // if (is_old_ie) {
    //   this.$cache.body.off("mouseup.irs_" + this.plugin_count);
    //   this.$cache.body.off("mouseleave.irs_" + this.plugin_count);
    // }
    //
    // this.$cache.grid_labels = [];
    this.coords.big = [];
    this.coords.big_w = [];
    this.coords.big_p = [];
    this.coords.big_x = [];
    // if (this.raf_id != null) {
    //   cancelAnimationFrame(this.raf_id);
    // }
    cancelAnimationFrame(this.raf_id);
  }

  updateResult(): void {
    this.result.min = this.min;
    this.result.max = this.max;
    this.updateFrom();
    this.updateTo();
  }

  updateFrom(): void {
    //this.result.from = this.from;
    

    if (this.result.from) {
      this.result.from_percent = this.convertToPercent(this.result.from);
      this.result.from_pretty = this._prettify(this.result.from);
      if (this.values) {
        this.result.from_value = this.values[this.result.from];
      }
    }

    


    this.result.from_percent = this.convertToPercent(this.result.from);
    this.result.from_pretty = this._prettify(this.result.from);
    if (this.values) {
      this.result.from_value = this.values[this.result.from];
    }
  }

  updateTo(): void {
    //this.result.to = this.to;


    if (this.result.to) {
      this.result.to_percent = this.convertToPercent(this.result.to);
      this.result.to_pretty = this._prettify(this.result.to);
      if (this.values && this.values !== null && this.values.length > 0) {
        this.result.to_value = this.values[this.result.to];
      }
    }



    this.result.to_percent = this.convertToPercent(this.result.to);
    this.result.to_pretty = this._prettify(this.result.to);
    if (this.values) {
      this.result.to_value = this.values[this.result.to];
    }
  }


// =============================================================================================================
  // Callbacks
//
  callOnStart() {
//   this.writeToInput();
//
//   if (this.options.onStart && typeof this.options.onStart === "function") {
//   if (this.options.scope) {
//   this.options.onStart.call(this.options.scope, this.result);
// } else {
//   this.options.onStart(this.result);
// }
// }
  }

  callOnChange() {
    // this.writeToInput();


//
//   if (this.options.onChange && typeof this.options.onChange === "function") {
//     if (this.options.scope) {
//       this.options.onChange.call(this.options.scope, this.result);
//     } else {
//       this.options.onChange(this.result);
//     }
//   }
  }

  callOnFinish() {
    // this.writeToInput();
//
//   if (this.options.onFinish && typeof this.options.onFinish === "function") {
//     if (this.options.scope) {
//       this.options.onFinish.call(this.options.scope, this.result);
//     } else {
//       this.options.onFinish(this.result);
//     }
//   }




    this.writeToInput();

    if (this.type === 'single') {

      if (this.values.length) {
        this.changeFinish.emit(this.result.from_value ?? 0);//this.$cache.input.prop("value", this.result.from_value);
      } else {
        this.changeFinish.emit(this.result.from ?? 0);//this.$cache.input.prop("value", this.result.from);
      }
      //this.$cache.input.data("from", this.result.from);
    } else {

      if (this.values.length) {
        this.changeFinish.emit({min: this.result.from_value ?? 0, max: this.result.to_value ?? 0});//this.$cache.input.prop("value", this.result.from_value + this.options.input_values_separator + this.result.to_value);

      } else {
        this.changeFinish.emit({min: this.result.from ?? 0, max: this.result.to ?? 0});//this.$cache.input.prop("value", this.result.from + this.options.input_values_separator + this.result.to);
      }
    }



  }

  callOnUpdate() {
    // this.writeToInput();
//
//   if (this.options.onUpdate && typeof this.options.onUpdate === "function") {
//     if (this.options.scope) {
//       this.options.onUpdate.call(this.options.scope, this.result);
//     } else {
//       this.options.onUpdate(this.result);
//     }
//   }
  }

  /**
   * Main function called in request animation frame
   * to update everything
   */
  updateScene() {
    
    if (this.raf_id) {
      //   cancelAnimationFrame(this.raf_id);
      this.raf_id = null;
    }
    //
    // clearTimeout(this.update_tm);
    // this.update_tm = null;
    //
    // if (!this.options) {
    //   return;
    // }
    //
    this.drawHandles();
    //
    // if (this.is_active) {
    //   this.raf_id = requestAnimationFrame(this.updateScene.bind(this));
    // } else {
    //   this.update_tm = setTimeout(this.updateScene.bind(this), 300);
    // }
  }

  private _prettify(num: any): any {
    if (!this.prettify_enabled) {
      return num;
    }

    // if (this.options.prettify && typeof this.options.prettify === "function") {
    //   return this.options.prettify(num);
    // } else {
    return this.prettify(num);
    // }
  }

  prettify(num: any) {
    let n = num.toString();
    return n.replace(
      /(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g,
      '$1' + this.prettify_separator
    );
  }

  /**
   * Convert percent to real values
   *
   * @param percent {Number} X in percent
   * @returns {Number} X in real
   */
  convertToValue(percent: number): number {
    let min = this.min; //var min = this.options.min,
    let max = this.max; //max = this.options.max,
    const min_decimals = min.toString().split('.')[1];
    const max_decimals = max.toString().split('.')[1];
    let min_length,
      max_length,
      avg_decimals = 0,
      abs = 0;

    if (percent === 0) {
      return this.min; //return this.options.min;
    }
    if (percent === 100) {
      return this.max; //return this.options.max;
    }

    if (min_decimals) {
      min_length = min_decimals.length;
      avg_decimals = min_length;
    }
    if (max_decimals) {
      max_length = max_decimals.length;
      avg_decimals = max_length;
    }
    if (min_length && max_length) {
      avg_decimals = min_length >= max_length ? min_length : max_length;
    }

    if (min < 0) {
      abs = Math.abs(min);
      min = +(min + abs).toFixed(avg_decimals);
      max = +(max + abs).toFixed(avg_decimals);
    }

    let number = ((max - min) / 100) * percent + min,
      string = this.step.toString().split('.')[1], //this.options.step.toString().split(".")[1],
      result;

    if (string) {
      number = +number.toFixed(string.length);
    } else {
      number = number / this.step; //number = number / this.options.step;
      number = number * this.step; //number = number * this.options.step;

      number = +number.toFixed(0);
    }

    if (abs) {
      number -= abs;
    }

    if (string) {
      result = +number.toFixed(string.length);
    } else {
      result = this.toFixed(number);
    }

    if (result < this.min) {
      // if (result < this.options.min) {
      result = this.min; //result = this.options.min;
    } else if (result > this.max) {
      //} else if (result > this.options.max) {
      result = this.max; //result = this.options.max;
    }

    return result;
  }

  /**
   * Convert real value to percent
   *
   * @param value {Number} X in real
   * @param no_min {boolean=} don't use min value
   * @returns {Number} X in percent
   */
  convertToPercent(value: number, no_min: boolean = false): number {
    let diapason = this.max - this.min, //var diapason = this.options.max - this.options.min,
      one_percent = diapason / 100,
      val,
      percent;

    if (!diapason) {
      this.no_diapason = true;
      return 0;
    }

    if (no_min) {
      val = value;
    } else {
      val = value - this.min; //val = value - this.options.min;
    }

    percent = val / one_percent;

    return this.toFixed(percent);
  }

  /**
   * Draw shadow intervals
   */
  drawShadow() {
    //   var o = this.options,
    //   c = this.$cache,
    //
    let is_from_min =
      typeof this.from_min === 'number' && !isNaN(this.from_min);
    let is_from_max =
      typeof this.from_max === 'number' && !isNaN(this.from_max);
    let is_to_min = typeof this.to_min === 'number' && !isNaN(this.to_min);
    let is_to_max = typeof this.to_max === 'number' && !isNaN(this.to_max);
    //
    let from_min;
    let from_max;
    let to_min;
    let to_max;
    //
    if (this.type === 'single') {
      if (this.from_shadow && (is_from_min || is_from_max)) {
        from_min = this.convertToPercent(
          // @ts-ignore
          is_from_min ? this.from_min : this.min
        );

        from_max =
          this.convertToPercent(
            // @ts-ignore
            is_from_max ? this.from_max : this.max
          ) - from_min;

        from_min = this.toFixed(
          from_min - (this.coords.p_handle / 100) * from_min
        );
        from_max = this.toFixed(
          from_max - (this.coords.p_handle / 100) * from_max
        );
        from_min = from_min + this.coords.p_handle / 2;

        this.cache.shad_single.isVisible = true;
        this.cache.shad_single.style.display = 'block';
        this.cache.shad_single.style.left = from_min + '%';
        this.cache.shad_single.style.width = from_max + '%';
      } else {
        this.cache.shad_single.style.display = 'none';
        this.cache.shad_single.isVisible = false;
      }
    } else {
      if (this.from_shadow && (is_from_min || is_from_max)) {
        from_min = this.convertToPercent(
          // @ts-ignore
          is_from_min ? this.from_min : this.min
        );
        from_max =
          this.convertToPercent(
            // @ts-ignore
            is_from_max ? this.from_max : this.max
          ) - from_min;
        from_min = this.toFixed(
          from_min - (this.coords.p_handle / 100) * from_min
        );
        from_max = this.toFixed(
          from_max - (this.coords.p_handle / 100) * from_max
        );
        from_min = from_min + this.coords.p_handle / 2;

        this.cache.shad_from.isVisible = true;
        this.cache.shad_from.style.display = 'block';
        this.cache.shad_from.style.left = from_min + '%';
        this.cache.shad_from.style.width = from_max + '%';
      } else {
        this.cache.shad_from.style.display = 'none';
      }

      if (this.to_shadow && (is_to_min || is_to_max)) {
        // @ts-ignore
        to_min = this.convertToPercent(is_to_min ? this.to_min : this.min);
        to_max =
          this.convertToPercent(
            // @ts-ignore
            is_to_max ? this.to_max : this.max
          ) - to_min;
        to_min = this.toFixed(to_min - (this.coords.p_handle / 100) * to_min);
        to_max = this.toFixed(to_max - (this.coords.p_handle / 100) * to_max);
        to_min = to_min + this.coords.p_handle / 2;

        this.cache.shad_to.isVisible = true;
        this.cache.shad_to.style.display = 'block';
        this.cache.shad_to.style.left = to_min + '%';
        this.cache.shad_to.style.width = to_max + '%';
      } else {
        this.cache.shad_to.style.display = 'none';
      }
    }
  }

  calcGridMargin() {
    if (!this.grid_margin) {
      return;
    }

    this.coords.w_rs = this.outerWidth(this.cache_rs);
    if (!this.coords.w_rs) {
      return;
    }

    if (this.type === 'single') {
      //if (this.options.type === "single") {
      this.coords.w_handle = this.outerWidth(this.cache_s_single);
    } else {
      this.coords.w_handle = this.outerWidth(this.cache_s_from); // this.$cache.s_from.outerWidth(false);
    }
    this.coords.p_handle = this.toFixed(
      (this.coords.w_handle / this.coords.w_rs) * 100
    );
    this.coords.grid_gap = this.toFixed(this.coords.p_handle / 2 - 0.1);

    this.cache.grid.style.width =
      this.toFixed(100 - this.coords.p_handle) + '%';
    this.cache.grid.style.left = this.coords.grid_gap + '%';
  }


  /**
   * Determine which handles was clicked last
   * and which handler should have hover effect
   *
   * @param target {String}
   */
  changeLevel(target: string): void {
    switch (target) {
      case 'single':
        this.coords.p_gap = this.toFixed(
          this.coords.p_pointer - this.coords.p_single_fake
        );
        this.cache_s_single?.nativeElement.classList.add('state_hover'); // this.$cache.s_single.addClass("state_hover");

        break;
      case 'from':
        this.coords.p_gap = this.toFixed(
          this.coords.p_pointer - this.coords.p_from_fake
        );
        this.cache_s_from?.nativeElement.classList.add('state_hover'); // this.$cache.s_from.addClass("state_hover");
        this.cache_s_from?.nativeElement.classList.add('type_last');// this.$cache.s_from.addClass("type_last");
        this.cache_s_to?.nativeElement.classList.remove('type_last');// this.$cache.s_to.removeClass("type_last");
        break;
      case 'to':
        this.coords.p_gap = this.toFixed(
          this.coords.p_pointer - this.coords.p_to_fake
        );
        this.cache_s_to?.nativeElement.classList.add('state_hover');// this.$cache.s_to.addClass("state_hover");
        this.cache_s_to?.nativeElement.classList.add('type_last');// this.$cache.s_to.addClass("type_last");
        this.cache_s_from?.nativeElement.classList.remove('type_last');// this.$cache.s_from.removeClass("type_last");
        break;
      case 'both':
        this.coords.p_gap_left = this.toFixed(
          this.coords.p_pointer - this.coords.p_from_fake
        );
        this.coords.p_gap_right = this.toFixed(
          this.coords.p_to_fake - this.coords.p_pointer
        );
        this.cache_s_to?.nativeElement.classList.remove('type_last');// this.$cache.s_to.removeClass("type_last");
        this.cache_s_from?.nativeElement.classList.remove('type_last');// this.$cache.s_from.removeClass("type_last");
        break;
    }
  }

  // =============================================================================================================
  // Grid

  calculateGrid() {
    if (!this.grid) {


      return;
    }
    this.bigGridSnap = [];
    this.smallGridSnap = [];
    this.cache_grid_labels = [];

    let i: number;
    let z: number;

    const total = this.max - this.min;
    let big_num = this.grid_num;
    let big_p = 0;
    let big_w = 0;

    let small_max = 4;
    let local_small_max: number;
    let small_p: number;
    let small_w = 0;

    let result: number;

    this.calcGridMargin();

    if (this.grid_snap) {
      big_num = total / this.step;
    }

    if (big_num > 50) big_num = 50;
    big_p = this.toFixed(100 / big_num);

    if (big_num > 4) {
      small_max = 3;
    }
    if (big_num > 7) {
      small_max = 2;
    }
    if (big_num > 14) {
      small_max = 1;
    }
    if (big_num > 28) {
      small_max = 0;
    }

    for (i = 0; i < big_num + 1; i++) {
      local_small_max = small_max;

      big_w = this.toFixed(big_p * i);

      if (big_w > 100) {
        big_w = 100;
      }
      this.coords.big[i] = big_w;

      small_p = (big_w - big_p * (i - 1)) / (local_small_max + 1);

      for (z = 1; z <= local_small_max; z++) {
        if (big_w === 0) {
          break;
        }

        small_w = this.toFixed(big_w - small_p * z);
        this.smallGridSnap.push({left: small_w + '%', label: ''});
      }

      const bigSnap: gridsnap = {left: big_w + '%', label: ''};

      result = this.convertToValue(big_w);
      if (this.values.length) {
        //result = this.p_values[result];
        bigSnap.label = this.p_values[result];
      } else {
        result = this._prettify(result);
        bigSnap.label = '' + result;
      }
      this.bigGridSnap.push(bigSnap);
    }
    this.coords.big_num = Math.ceil(big_num + 1);

    this.cacheGridLabels();
  }

  cacheGridLabels() {
    // var $label, i,
    const num = this.coords.big_num;

    for (let i = 0; i < num; i++) {
      const label = this.cache_grid?.nativeElement.querySelector<HTMLSpanElement>('.js-grid-text-' + i);
      if (label)
        this.cache_grid_labels.push(label);
      //     $label = this.$cache.grid.find(".js-grid-text-" + i);
      //     this.$cache.grid_labels.push($label);
    }

    this.calcGridLabels();
  }

  calcGridLabels() {
    let i: number;
    let start: number[] = [];
    let finish: number[] = [];

    //   var  label,
    let num = this.coords.big_num;
    //
    for (i = 0; i < num; i++) {
      const ow = this.outerWidth(this.cache_grid_labels[i]); //this.coords.big_w[i] = this.$cache.grid_labels[i].outerWidth(false);
      if (ow > 0)
        this.coords.big_w[i] = ow;

      this.coords.big_p[i] = this.toFixed(
        (this.coords.big_w[i] / this.coords.w_rs) * 100
      );
      this.coords.big_x[i] = this.toFixed(this.coords.big_p[i] / 2);

      start[i] = this.toFixed(this.coords.big[i] - this.coords.big_x[i]);
      finish[i] = this.toFixed(start[i] + this.coords.big_p[i]);
    }
    //
    if (this.force_edges) {
      if (start[0] < -this.coords.grid_gap) {
        start[0] = -this.coords.grid_gap;
        finish[0] = this.toFixed(start[0] + this.coords.big_p[0]);

        this.coords.big_x[0] = this.coords.grid_gap;
      }
      //
      if (finish[num - 1] > 100 + this.coords.grid_gap) {
        finish[num - 1] = 100 + this.coords.grid_gap;
        start[num - 1] = this.toFixed(finish[num - 1] - this.coords.big_p[num - 1]);
        //
        this.coords.big_x[num - 1] = this.toFixed(this.coords.big_p[num - 1] - this.coords.grid_gap);
      }
    }

    this.calcGridCollision(2, start, finish);
    this.calcGridCollision(4, start, finish);

    for (i = 0; i < num; i++) {
      // const   label = this.cache_grid_labels[i];

      if (this.coords.big_x[i] !== Number.POSITIVE_INFINITY) {
        this.bigGridSnap[i].marginLeft = -this.coords.big_x[i] + "%";  //     label.style.marginLeft = -this.coords.big_x[i] + "%";
      }
    }
  }

// Collisions Calc Beta
  // TODO: Refactor then have plenty of time
  calcGridCollision(step: number, start: number[], finish: number[]) {
    // var i, next_i, label,
    const num = this.coords.big_num;


    for (let i = 0; i < num; i += step) {
      let next_i = i + (step / 2);
      if (next_i >= num) {
        break;
      }

      // let label = this.cache_grid_labels[next_i];//     label = this.$cache.grid_labels[next_i][0];

      if (finish[i] <= start[next_i]) {
        this.bigGridSnap[next_i].visibility = 'visible';//label.style.visibility = "visible";
      } else {
        this.bigGridSnap[next_i].visibility = 'hidden';//label.style.visibility = "hidden";
      }
    }
  }

  decorate(num: any, original: any) {
    let decorated = '';
    // o = this.options;

    if (this.prefix) {
      decorated += this.prefix;
    }

    decorated += num;

    if (this.max_postfix) {
      if (this.values.length && num === this.p_values[this.max]) {
        decorated += this.max_postfix;
        if (this.postfix) {
          decorated += ' ';
        }
      } else if (original === this.max) {
        decorated += this.max_postfix;
        if (this.postfix) {
          decorated += ' ';
        }
      }
    }

    if (this.postfix) {
      decorated += this.postfix;
    }

    return decorated;
  }

  checkMinInterval(p_current: any, p_next: any, type: any) {
    let current;
    let next;

    if (!this.min_interval) {
      return p_current;
    }

    current = this.convertToValue(p_current);
    next = this.convertToValue(p_next);

    if (type === 'from') {
      if (next - current < this.min_interval) {
        current = next - this.min_interval;
      }
    } else {
      if (current - next < this.min_interval) {
        current = next + this.min_interval;
      }
    }

    return this.convertToPercent(current);
  }

  checkMaxInterval(p_current: any, p_next: any, type: any) {
    let current;
    let next;

    if (!this.max_interval) {
      return p_current;
    }

    current = this.convertToValue(p_current);
    next = this.convertToValue(p_next);

    if (type === 'from') {
      if (next - current > (this.max_interval ?? 0)) {
        current = next - (this.max_interval ?? 0);
      }
    } else {
      if (current - next > (this.max_interval ?? 0)) {
        current = next + (this.max_interval ?? 0);
      }
    }

    return this.convertToPercent(current);
  }

  checkDiapason(p_num: any, min: any, max: any) {
    let num = this.convertToValue(p_num);

    if (typeof min !== 'number') {
      min = this.min;
    }

    if (typeof max !== 'number') {
      max = this.max;
    }

    if (num < min) {
      num = min;
    }

    if (num > max) {
      num = max;
    }

    return this.convertToPercent(num);
  }

  /**
   * Find closest handle to pointer click
   *
   * @param real_x {Number}
   * @returns {String}
   */
  chooseHandle(real_x: any) {
    if (this.type === 'single') {
      return 'single';
    } else {
      const m_point =
        this.coords.p_from_real +
        (this.coords.p_to_real - this.coords.p_from_real) / 2;
      if (real_x >= m_point) {
        return this.to_fixed ? 'from' : 'to';
      } else {
        return this.from_fixed ? 'to' : 'from';
      }
    }
  }

  private outerWidth(element: ElementRef<HTMLSpanElement> | HTMLSpanElement | undefined): number {
    if (element instanceof HTMLSpanElement) {
      return element.offsetWidth;
    } else if (element && element.nativeElement) {
      return element.nativeElement.offsetWidth;
      //return element.nativeElement.getBoundingClientRect().width;
    }
    return 0;
  }

  private officeLeft(element: ElementRef<HTMLSpanElement> | undefined): number {
    if (element && element.nativeElement) {
      const rect = element.nativeElement.getBoundingClientRect();

      return rect.left + window.scrollX;
    }
    return 0;
  }

  /**
   * Keyborard controls for focused slider
   *
   * @param target {String}
   * @param e {Object} event object
   * @returns {boolean|undefined}
   */
  keyDown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
      return;
    }

    switch (event.which) {
      case 83: // W
      case 65: // A
      case 40: // DOWN
      case 37: // LEFT
        // e.preventDefault();
        this.moveByKey(false);
        break;

      case 87: // S
      case 68: // D
      case 38: // UP
      case 39: // RIGHT
        // e.preventDefault();
        this.moveByKey(true);
        break;
    }

    // return true;
  }

  /**
   * Move by key
   *
   * @param right {boolean} direction to move
   */
  moveByKey(right: boolean) {
    var p = this.coords.p_pointer;
    var p_step = (this.max - this.min) / 100;
    p_step = this.step / p_step;

    if (right) {
      p += p_step;
    } else {
      p -= p_step;
    }

    this.coords.x_pointer = this.toFixed(this.coords.w_rs / 100 * p);
    this.is_key = true;
    this.calc();
    this.drawHandles();
  }


  /**
   * Focus with tabIndex
   *
   * @param e {Object} event object
   */
  pointerFocus(e: any) {
    // if (!this.target) {
    //     let x;
    //     let $handle;

    //     if (this.type === "single") {
    //         $handle = this.cache_single;
    //     } else {
    //         $handle = this.cache_from;
    //     }

    //     x = this.officeLeft($handle);
    //     const width = $handle?.nativeElement.getBoundingClientRect().width;
    //     x += ((width??0) / 2) - 1;


    //     this.pointerClick("single", <MouseEvent>{preventDefault: function () {}, pageX: x});
    // }
  }

}
