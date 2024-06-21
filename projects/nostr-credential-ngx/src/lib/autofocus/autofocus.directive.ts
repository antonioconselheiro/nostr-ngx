import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[autofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {

  @Input()
  selectValue = true;

  constructor(
    private el: ElementRef<HTMLInputElement>
  ) { }

  ngAfterViewInit(): void {
    const el = this.el?.nativeElement;

    if (el) {
      el.focus();

      if (this.selectValue) {
        const value = el.value;
        el.selectionStart = 0;
        el.selectionEnd = value.length;
      }
    }
  }
}
