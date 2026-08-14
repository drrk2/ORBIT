import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ICON_PATHS = {
  dashboard: 'M3 13h8V3H3v10Zm10 8h8V11h-8v10Zm0-18v6h8V3h-8ZM3 21h8v-6H3v6Z',
  building:
    'M4 21V5l8-3 8 3v16h-6v-5h-4v5H4Zm3-3h2v-2H7v2Zm0-4h2v-2H7v2Zm0-4h2V8H7v2Zm4 4h2v-2h-2v2Zm0-4h2V8h-2v2Zm4 4h2v-2h-2v2Zm0-4h2V8h-2v2Z',
  users:
    'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm8 2c-2 0-6 1-6 3v3h12v-3c0-2-4-3-6-3ZM8 13c-2.33 0-7 1.17-7 3.5V19h7v-3c0-.85.33-1.6.9-2.25C8.6 13.28 8.26 13 8 13Z',
  laptop: 'M3 4h18v12H3V4Zm2 2v8h14V6H5Zm-3 12h20v2H2v-2Z',
  requests: 'M6 2h9l5 5v15H6V2Zm2 2v16h10V8h-4V4H8Zm2 8h6v2h-6v-2Zm0 4h6v2h-6v-2Zm0-8h2v2h-2V8Z',
  approval:
    'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-1.1 14.4 6-6-1.4-1.4-4.6 4.6-2.4-2.4-1.4 1.4 3.8 3.8Z',
  shield:
    'M12 2 4 5v6c0 5.05 3.41 9.76 8 11 4.59-1.24 8-5.95 8-11V5l-8-3Zm0 2.18L18 6.43V11c0 3.86-2.43 7.67-6 8.84C8.43 18.67 6 14.86 6 11V6.43l6-2.25Z',
  history:
    'M13 3a9 9 0 1 1-8.95 10H2l3-3 3 3H6.06A7 7 0 1 0 13 5a6.95 6.95 0 0 0-4.95 2.05L6.64 5.64A8.96 8.96 0 0 1 13 3Zm-1 4h2v5.17l3.24 3.24-1.42 1.41L12 13V7Z',
  menu: 'M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z',
  bell: 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
  search: 'm15.5 14 5 5-1.5 1.5-5-5a7 7 0 1 1 1.5-1.5ZM10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  refresh: 'M17.65 6.35A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.76-4.24L13 11h8V3l-3.35 3.35Z',
  logout:
    'M10 4H4v16h6v-2H6V6h4V4Zm3.59 3.59L15 6.17 20.83 12 15 17.83l-1.41-1.42L17 13H9v-2h8l-3.41-3.41Z',
  arrow: 'm9 18 6-6-6-6 1.4-1.4L17.8 12l-7.4 7.4L9 18Z',
  pin: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z',
  briefcase:
    'M9 4V2h6v2h5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5Zm2 0h2V3h-2v1ZM4 12v7h16v-7h-6v2h-4v-2H4Zm6 0h4v-2h6V6H4v4h6v2Z',
  clock:
    'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-1 3h2v4.59l3.2 3.2-1.41 1.41L11 12.41V7Z',
  close:
    'm6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z',
  filter: 'M3 5h18v2H3V5Zm4 6h10v2H7v-2Zm3 6h4v2h-4v-2Z',
  check: 'm9.1 18.3-5.4-5.4 1.4-1.4 4 4L19 5.6 20.4 7 9.1 18.3Z',
  undo: 'M7.4 7H15a6 6 0 0 1 0 12h-4v-2h4a4 4 0 1 0 0-8H7.4l3.3 3.3-1.4 1.4L3.6 8l5.7-5.7 1.4 1.4L7.4 7Z',
  package:
    'm12 2 9 5v10l-9 5-9-5V7l9-5Zm0 2.3L6.1 7.6 12 10.9l5.9-3.3L12 4.3ZM5 9.3v6.5l6 3.3v-6.5L5 9.3Zm8 9.8 6-3.3V9.3l-6 3.3v6.5Z',
  more: 'M6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z',
} as const;

export type IconName = keyof typeof ICON_PATHS;

@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
      aria-hidden="true"
      [style.width.px]="size()"
      [style.height.px]="size()"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
      flex: 0 0 auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrbitIcon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  protected readonly path = computed(() => ICON_PATHS[this.name()]);
}
