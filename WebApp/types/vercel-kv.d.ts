declare module '@vercel/kv' {
  // Minimal typing used by the app; consumers should install the official package in production
  export const kv: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
  const _default: { kv: typeof kv }
  export default _default
}
