import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[autofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {

  constructor(
    private el: ElementRef<HTMLInputElement>
  ) { }

  ngAfterViewInit(): void {
    const el = this.el?.nativeElement;

    if (el) {
      const value = el.value;
      el.focus();
      el.selectionStart = 0;
      el.selectionEnd = value.length;
    }
  }
}
