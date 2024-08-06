import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[nostrListenTypingComplete]',
  standalone: true
})
export class TypingCompleteDirective {

  /**
   * Configure the typing timeout
   */
  @Input()
  timeout = 1000;

  @Output()
  typingCompleted = new EventEmitter<string>();

  private timeoutId?: number;

  constructor(
    private el: ElementRef
  ) { }

  @HostListener('keyup')
  onKeyUp(): void {
    clearTimeout(this.timeoutId);
    const timeout = Number(this.timeout);
    const onCompleted = (): void => this.typingCompleted.emit(this.el.nativeElement.value);
    this.timeoutId = +setTimeout(onCompleted, timeout);
  }
}
