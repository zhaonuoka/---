export function dirname(p: string) { const i = p.lastIndexOf('/'); return i === -1 ? '.' : p.slice(0, i) }
export default { dirname }
