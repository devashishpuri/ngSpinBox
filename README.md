# NgSpinBox

<h2>Spinbox Directive for Angular 2+.</h2>

## Installation

<h4> npm i ng-spin-box --save </h4>

## Usage

Import 'NgSpinBoxModule' in App.module.ts/CustomModule.ts

Then, Simply use as a directive, wrapped in a container:

```html
<div>
    <input type='tel' ngSpinBox step='0.001' min='0.001' decimal='3'>
</div>
```
Classes for Wrapper Element, Increment and Decrement Button are:
'ng-spin-box-wrapper', 'ng-spin-box-btn-up' and 'ng-spin-box-btn-down' respectively. 
