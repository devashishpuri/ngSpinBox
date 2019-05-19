# NgSpinBox

<h2>Spinbox Directive for Angular.</h2>

## Installation

<h4> npm i ng-spin-box --save </h4>

## Usage

Import 'NgSpinBoxModule' in app.module.ts / <Custom-Module>.module.ts

Then, Simply use as a directive, wrapped in a container(Important):

```html
<div>
    <input type='tel' ngSpinBox step='0.01' min='0.01' decimal='2' snapToStep='true'>
</div>
```
Classes for Wrapper Element, Increment and Decrement Button are:
'ng-spin-box-wrapper', 'ng-spin-box-btn-up' and 'ng-spin-box-btn-down' respectively. 
