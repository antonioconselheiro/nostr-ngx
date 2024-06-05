import { Component, Input } from '@angular/core';
import { SvgRecord } from './svg.record';

@Component({
  selector: 'nostr-svg-render',
  templateUrl: './svg-render.component.html',
  styleUrl: './svg-render.component.scss'
})
export class SvgRenderComponent {
  static record = SvgRecord;

  static add(name: string, svg: string): void {
    this.record[name] = svg;
  }
  
  @Input()
  name!: string;
}
