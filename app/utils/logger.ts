
export function log(...args: any[]) {
	console.log(`[${new Date().toISOString()}]:`, ...args)
}
