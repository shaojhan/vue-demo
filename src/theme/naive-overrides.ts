import type { GlobalThemeOverrides } from 'naive-ui'

/**
 * naive-ui theme overrides for the MES Platform (Data-Dense Dashboard).
 *
 * These values mirror the light-mode tokens in src/styles/tokens.css.
 * naive-ui needs concrete colors at config time (it cannot read CSS vars),
 * so this file is the JS-side reflection of the same palette. Keep both in sync.
 */

const primary = '#1e40af'
const primaryHover = '#1d4ed8'
const primaryPressed = '#1e3a8a'
const primarySuppl = '#3b82f6'

const error = '#dc2626'
const errorHover = '#b91c1c'
const success = '#16a34a'
const warning = '#d97706'
const info = '#3b82f6'

const borderRadius = '8px'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: primary,
    primaryColorHover: primaryHover,
    primaryColorPressed: primaryPressed,
    primaryColorSuppl: primarySuppl,
    infoColor: info,
    infoColorHover: primarySuppl,
    successColor: success,
    warningColor: warning,
    errorColor: error,
    errorColorHover: errorHover,
    borderRadius,
    borderRadiusSmall: '4px',
    fontFamily:
      "'Fira Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'Fira Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    textColorBase: '#0f172a',
    textColor1: '#0f172a',
    textColor2: '#475569',
    textColor3: '#64748b',
    bodyColor: '#f8fafc',
    cardColor: '#ffffff',
    borderColor: '#dbeafe'
  },
  DataTable: {
    thColor: '#e9eef6',
    thTextColor: '#0f172a',
    thFontWeight: '600',
    tdColorHover: '#f1f5f9',
    borderColor: '#dbeafe'
  },
  Button: {
    fontWeight: '500'
  }
}
