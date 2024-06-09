import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { SvgRecord } from './svg.record';

@Component({
  selector: 'nostr-svg-render',
  styleUrl: './svg-render.component.scss',
  template: ``
})
export class SvgRenderComponent implements OnInit {
  static record = SvgRecord;

  static add(name: string, svg: string): void {
    this.record[name] = svg;
  }
  
  @Input()
  set name(name: string) {
    this.interceptedName = name;
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.innerHTML = SvgRenderComponent.record[name];
    }
  }

  get name(): string {
    return this.interceptedName;
  }

  private interceptedName = '';

  constructor(
    private elementRef: ElementRef<HTMLElement>
  ) { }

  ngOnInit(): void {
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.innerHTML = SvgRenderComponent.record[this.name];
    }
  }
}
