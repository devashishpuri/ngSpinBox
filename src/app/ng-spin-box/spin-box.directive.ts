import { Directive, ElementRef, Input, HostListener, HostBinding, Renderer2 } from '@angular/core';

interface SpinBoxOptions {
  min: number;
  max: number;
  step: number;
}

@Directive({
  // tslint:disable-next-line
  selector: '[ngSpinBox]'
})
export class SpinBoxDirective {

  @Input('min') min: number;
  @Input('max') max: number;
  @Input('step') step: number;
  @Input('decimal') decimal: number;
  @Input('className') className: number;

  private _hasFocus = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    console.log('The Reference Element', el);
    this._initView();
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
    this.renderer.listen(buttonUp, 'click', (e: Event) => { this._clickSpinBoxButton(e, true); });
    this.renderer.setAttribute(buttonUp, 'style', `
      position: absolute;
      top: 0;
      right: 0;
      height: 50%;
    `);

    // Add Up/Down Buttons for UserInteraction
    const buttonDown = this.renderer.createElement('button');
    this.renderer.appendChild(wrapper, buttonDown);
    this.renderer.listen(buttonDown, 'click', (e: Event) => { this._clickSpinBoxButton(e, false); });
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
    (<HTMLInputElement>this.el.nativeElement).focus();
    this._increaseDecreaseValue(shouldInrease);
  }

  /**
   * Increase Decrease Value of SpinBox
   * @param shouldInrease If true, increase the Value,
   * Else Decrease the Value.
   */
  private _increaseDecreaseValue(shouldInrease: boolean) {
    let value: number | string = +((<HTMLInputElement>this.el.nativeElement).value || 0);

    /**
     * Add Decimal logic
     */
    const multiplier = Math.pow(10, (+this.decimal + 1));
    let decimalValue = value * multiplier;

    const step = (+this.step) || 1;

    if (shouldInrease) {
      decimalValue += (step *  multiplier);
    } else {
      decimalValue -= (step * multiplier);
    }

    value = (decimalValue / multiplier).toFixed(this.decimal);

    if ((+value) >= (+this.min || -Infinity) && (+value) <= (+this.max || Infinity)) {
      this.renderer.setProperty(this.el.nativeElement, 'value', value);
    }

  }

  @HostListener('focus') onFocus() {
    this._hasFocus = true;
  }

  @HostListener('blur') onBlur() {
    this._hasFocus = false;
  }

  @HostListener('wheel', ['$event']) onMouseWheel(event: WheelEvent) {
    if (!this._hasFocus) {
      return;
    }
    (event.deltaY > 0) ? this._increaseDecreaseValue(false) : this._increaseDecreaseValue(true);
  }

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    const key = event.key;
    const cursorPosition =  (<HTMLInputElement>this.el.nativeElement).selectionStart;

    if (key === 'ArrowUp') {
      this._increaseDecreaseValue(true);
    } else if (key === 'ArrowDown') {
      this._increaseDecreaseValue(false);
    }

    // Allow special key presses
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey ||
      key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Backspace' ||
      key === 'Delete') {
      return;
    }

    // Allow a Decimal sign
    // if (key === this._getDecimalSeparator()) {
    //   return;
    // }

    // Allow a minus sign if the value can be negative
    if (key === '-' && cursorPosition === 0 && (this.min && this.min < 0)) {
      return;
    }

    // Allow Entry with valid Precision
    if (this._checkPrecision(key)) {
      return;
    }

    // Allow digits
    // if ((/[0-9]/g).test(key)) {
    //   return;
    // }

    // Prevent the default action
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }

  }

  private _getDecimalSeparator() {
    const number = 1.1;
    return number.toLocaleString().substring(1, 2);
  }

  private _checkPrecision(key: string) {
    const decimal = (+this.decimal) || 0;
    const refElement = (<HTMLInputElement>this.el.nativeElement);
    const value = refElement.value.substr(0, refElement.selectionStart) + key + refElement.value.substr(refElement.selectionEnd);
    const regexString = '^\\d+\\' + this._getDecimalSeparator() + '?\\d{0,' + decimal + '}$';
    return new RegExp(regexString, 'g').test(value);
  }

}
// this.renderer.setElementProperty(this.el.nativeElement, 'value', validString);
