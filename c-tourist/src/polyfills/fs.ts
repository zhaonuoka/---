// 浏览器端 fs 空桩
export function readFileSync(_p: string, _opts?: any): any { return '' }
export function writeFileSync(_p: string, _data: any, _opts?: any): void {}
export function watchFile(_p: string, _opts: any, _listener: any): void {}
export function unwatchFile(_p: string, _listener?: any): void {}
export function existsSync(_p: string): boolean { return false }
export function mkdirSync(_p: string, _opts?: any): any { return undefined }
export default { readFileSync, writeFileSync, watchFile, unwatchFile, existsSync, mkdirSync }
