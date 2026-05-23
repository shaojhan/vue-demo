import { h } from 'vue'
import type { VNode } from 'vue'

/**
 * Lightweight inline SVG icon registry (Lucide-style, stroke 1.5).
 * Replaces emoji/ad-hoc icons across the shell. Each entry is a render
 * function returning an <svg> sized to 1em so it inherits font-size/color.
 */
type IconRender = () => VNode

const svg = (paths: string[]): IconRender => {
  return () =>
    h(
      'svg',
      {
        viewBox: '0 0 24 24',
        width: '1em',
        height: '1em',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      },
      paths.map((d) => h('path', { d }))
    )
}

export const icons: Record<string, IconRender> = {
  dashboard: svg([
    'M3 3h7v9H3z',
    'M14 3h7v5h-7z',
    'M14 12h7v9h-7z',
    'M3 16h7v5H3z'
  ]),
  integration: svg([
    'M6 3v12',
    'M18 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    'M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M15 6a9 9 0 0 0-9 9'
  ]),
  operations: svg([
    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2',
    'M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
    'm9 14 2 2 4-4'
  ]),
  assistant: svg([
    'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
  ]),
  admin: svg([
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    'm9 12 2 2 4-4'
  ]),
  user: svg([
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
  ]),
  records: svg([
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    'M8 13h8',
    'M8 17h8'
  ]),
  messages: svg([
    'M4 4h16v12H5.2L4 17.2z',
    'M8 9h8',
    'M8 12h5'
  ]),
  schedule: svg([
    'M8 2v4',
    'M16 2v4',
    'M3 8h18',
    'M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
  ]),
  logout: svg([
    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
    'm16 17 5-5-5-5',
    'M21 12H9'
  ]),
  sun: svg([
    'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    'M12 1v2',
    'M12 21v2',
    'M4.2 4.2l1.4 1.4',
    'M18.4 18.4l1.4 1.4',
    'M1 12h2',
    'M21 12h2',
    'M4.2 19.8l1.4-1.4',
    'M18.4 5.6l1.4-1.4'
  ]),
  moon: svg(['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z']),
  key: svg([
    'M21 2 19 4',
    'm15.5 7.5 3-3',
    'M10.5 12.5 14 9a4 4 0 1 0-1 1l-3.5 3.5L7 16l-2 .5L4.5 19 3 21'
  ])
}
