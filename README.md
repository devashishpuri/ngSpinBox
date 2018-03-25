# NgSpinBox

Spinbox Directive for Angular 2+.

## Usage

Import 'NgSpinBoxModule' in App.module.ts/CustomModule.ts

Then, Simply use as a directive, wrapped in a container:

<div>
    <input type='tel' ngSpinBox step='0.001' min='0.001' decimal='3'>
</div>
