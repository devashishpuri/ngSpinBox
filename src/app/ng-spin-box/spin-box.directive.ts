import { Directive, ElementRef, Input, HostListener, Renderer2, Output, EventEmitter } from '@angular/core';


@Directive({
  // tslint:disable-next-line
  selector: '[ngSpinBox]'
})
export class SpinBoxDirective {

  @Input('min') min: number;
  @Input('max') max: number;
  @Input('step') step: number;
  @Input('decimal') decimal: number;
  @Input('snapToStep') snapToStep: boolean;
  @Input('stepAtCursor') stepAtCursor: boolean;
  @Input('setLimitOnBlur') setLimitOnBlur: boolean;

  private _hasFocus = false;
  valueToBeSet = 0;

  @Output('changeByMouse') changeByMouse: EventEmitter<string> = new EventEmitter();

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this._initView();
  }

  get _isDisabled(): boolean {
    return (<HTMLInputElement>this.el.nativeElement).disabled;
  }

  private _initView() {
    const node = <HTMLInputElement>this.el.nativeElement;
    const parent = node.parentNode;
    // Create Wrapper Element
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'ng-spin-box-wrapper');
    this.renderer.setAttribute(wrapper, 'style', `
      position: relative;
      display: inline-block;
    `);

    // Wrap Input in our Custom Wrapper
    this.renderer.appendChild(wrapper, node);
    this.renderer.appendChild(parent, wrapper);

    // Add Up/Down Buttons for UserInteraction
    const buttonUp = this.renderer.createElement('button');
    this.renderer.appendChild(wrapper, buttonUp);
    this.renderer.addClass(buttonUp, 'ng-spin-box-btn-up');
    this.renderer.listen(buttonUp, 'click', (e: Event) => { this._clickSpinBoxButton(e, true); });
    this.renderer.setAttribute(buttonUp, 'tabIndex', '-1');
    this.renderer.setAttribute(buttonUp, 'style', `
      position: absolute;
      top: 0;
      right: 0;
      height: 50%;
    `);

    // Add Up/Down Buttons for UserInteraction
    const buttonDown = this.renderer.createElement('button');
    this.renderer.appendChild(wrapper, buttonDown);
    this.renderer.addClass(buttonDown, 'ng-spin-box-btn-down');
    this.renderer.listen(buttonDown, 'click', (e: Event) => { this._clickSpinBoxButton(e, false); });
    this.renderer.setAttribute(buttonDown, 'tabIndex', '-1');
    this.renderer.setAttribute(buttonDown, 'style', `
      position: absolute;
      bottom: 0;
      right: 0;
      height: 50%;
    `);
  }

  private _clickSpinBoxButton(event: Event, shouldInrease: boolean) {
    event.preventDefault();
    event.stopPropagation();
    if (!this._isDisabled) {
      (<HTMLInputElement>this.el.nativeElement).focus();
      this._increaseDecreaseValue(shouldInrease);
    }
  }

  /**
   * Increase Decrease Value of SpinBox
   * @param shouldInrease If true, increase the Value,
   * Else Decrease the Value.
   */
  private _increaseDecreaseValue(shouldInrease: boolean) {
    const valueStr = (<HTMLInputElement>this.el.nativeElement).value;
    const value: number | string = +(valueStr || 0);

    const precision = +(this.decimal || 0);
    /**
     * Add Decimal logic
     */
    const multiplier = Math.pow(10, (precision + 2));
    let decimalValue = value * multiplier;
    decimalValue = +decimalValue.toFixed(precision + 2);

    const step = (+this.step) || 1;

    // Get Cursor Position
    const cursorPosition = (<HTMLInputElement>this.el.nativeElement).selectionStart;
    const decimalPosition = valueStr.indexOf(this._getDecimalSeparator);
    const cursorFactor = (cursorPosition - decimalPosition);

    // Convert String type values to boolean, to stop the need of Data Binding
    const shouldSnapToStep = typeof this.snapToStep === 'string' ? JSON.parse(this.snapToStep) : this.snapToStep;

    if (shouldInrease) {
      if (this.stepAtCursor && (cursorPosition <= valueStr.length - 2)) {
        const stepMultiplier = Math.pow(10, (precision + 2) - cursorFactor);
        decimalValue += (1 * stepMultiplier);
      } else {
        if (shouldSnapToStep) {
          let decimalVal = Math.round((decimalValue) / (step * multiplier)) * (step * multiplier);
          if (decimalVal > (decimalValue)) {
            decimalVal -= (step * multiplier);
          }
          decimalValue = (decimalVal) + (step * multiplier);
        } else {
          decimalValue += (step * multiplier);
        }
      }
    } else {
      // if (this.stepAtCursor && (cursorPosition > decimalPosition && cursorPosition <= valueStr.length - 2)) {
      if (this.stepAtCursor && (cursorPosition <= valueStr.length - 2)) {
        const stepMultiplier = Math.pow(10, (precision + 2) - cursorFactor);
        decimalValue -= (1 * stepMultiplier);
      } else {
        if (shouldSnapToStep) {
          let decimalVal = Math.round((decimalValue) / (step * multiplier)) * (step * multiplier);
          if (decimalVal < (decimalValue)) {
            decimalVal += (step * multiplier);
          }
          decimalValue = (decimalVal) - (step * multiplier);
        } else {
          decimalValue -= (step * multiplier);
        }
      }
    }

    const finalValue = (decimalValue / multiplier).toFixed(precision);

    // If input value is entered out of bounds, then upon scrolling it, it jumps to a value within bounds.
    if ((+finalValue) >= (+this.min || -Infinity) && (+finalValue) <= (+this.max || Infinity)) {
      this.valueToBeSet = +finalValue;
    } else if ((+finalValue) < (+this.min || -Infinity)) {
      this.valueToBeSet = this.min;
    } else if ((+finalValue) > (+this.max || Infinity)) {
      this.valueToBeSet = this.max;
    }
    if (this.changeByMouse) {
      this.changeByMouse.emit(finalValue);
    }

    // Value to be set needs to be string
    const valueToBeSetStr = (+this.valueToBeSet).toFixed(precision);
    this.renderer.setProperty(this.el.nativeElement, 'value', valueToBeSetStr);

    // Trigger Input Event
    let event;
    try {
      event = new Event('input', { bubbles: true, cancelable: false });
    } catch (e) {
      event = document.createEvent('Event');
      event.initEvent('input', true, false);
    }

    // dispatch the event
    this.el.nativeElement.dispatchEvent(event);

    if (valueStr.indexOf(this._getDecimalSeparator) !== -1) {
      (<HTMLInputElement>this.el.nativeElement).selectionStart = cursorPosition;
      (<HTMLInputElement>this.el.nativeElement).selectionEnd = cursorPosition;
    }
  }

  @HostListener('focus') onFocus() {
    this._hasFocus = true;
  }

  @HostListener('blur') onBlur() {
    const setLimitOnBlur = typeof this.setLimitOnBlur === 'string' ? JSON.parse(this.setLimitOnBlur) : this.setLimitOnBlur;
    if (setLimitOnBlur) {
      this._hasFocus = false;
      // On blur, if the entered values is out of bounds, it should jump within bounds
      const value: number | string = +((<HTMLInputElement>this.el.nativeElement).value || 0);
      let shouldInrease = false;
      if (value > this.max) {
        this._increaseDecreaseValue(shouldInrease);
      } else if (value < this.min) {
        shouldInrease = true;
        this._increaseDecreaseValue(shouldInrease);
      }
    }
  }

  @HostListener('wheel', ['$event']) onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    if (!this._hasFocus || this._isDisabled) {
      return;
    }
    (event.deltaY > 0) ? this._increaseDecreaseValue(false) : this._increaseDecreaseValue(true);
  }

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    const key = event.key;
    const cursorPosition = (<HTMLInputElement>this.el.nativeElement).selectionStart;

    // console.log('The Event triggered', key, event);

    if (key === 'ArrowUp' || key === 'Up') {
      if (event.shiftKey) {
        return;
      } else {
        this._increaseDecreaseValue(true);
      }
    } else if (key === 'ArrowDown' || key === 'Down') {
      if (event.shiftKey) {
        return;
      } else {
        this._increaseDecreaseValue(false);
      }
    }

    // Allow special key presses
    if (event.ctrlKey || event.metaKey ||
      key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Backspace' ||
      key === 'Delete' || key === 'Tab' || key === 'Left' || key === 'Right') {
      return;
    }

    // Allow a minus sign if the value can be negative
    if (key === '-' && cursorPosition === 0 && (this.min && this.min < 0)) {
      return;
    }

    // Allow Entry with valid Precision
    if (this._checkValidity(key)) {
      return;
    }


    // Allow digits
    // if ((/[0-9]/g).test(key)) {
    //   return;
    // }

    // Prevent the default action
    event.preventDefault();

  }

  // This will prevent input when resulted value is greater than max value.
  private _checkBounds(value: string) {
    if (parseFloat(value) > this.max) {
      return false;
    }
    return true;
  }

  private get _getDecimalSeparator() {
    const number = 1.1;
    return number.toLocaleString().substring(1, 2);
  }

  private _checkValidity(key: string) {
    const decimal = (+this.decimal) || 0;
    const refElement = (<HTMLInputElement>this.el.nativeElement);
    const value = refElement.value.substr(0, refElement.selectionStart) + key + refElement.value.substr(refElement.selectionEnd);
    const regexString = '^\\d+\\' + this._getDecimalSeparator + '?\\d{0,' + decimal + '}$';
    return new RegExp(regexString, 'g').test(value) && this._checkBounds(value) ;
  }

}
// this.renderer.setElementProperty(this.el.nativeElement, 'value', validString);
