import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { SvgRecord } from './svg.record';

@Component({
  selector: 'nostr-svg-render',
  styleUrl: './svg-render.component.scss',
  template: ``
})
export class SvgRenderComponent implements OnInit {

  @Input()
  set name(name: string) {
    this.interceptedName = name;
    this.svgRecord.get(name).then(svg => {
      if (this.elementRef.nativeElement && svg) {
        this.elementRef.nativeElement.innerHTML = svg;
      }
    });
  }

  get name(): string {
    return this.interceptedName;
  }

  private interceptedName!: string;

  constructor(
    private svgRecord: SvgRecord,
    private elementRef: ElementRef<HTMLElement>
  ) { }

  ngOnInit(): void {
    this.svgRecord.get(this.name).then(svg => {
      if (this.elementRef.nativeElement && svg) {
        this.elementRef.nativeElement.innerHTML = svg;
      }
    });
  }
}
