
export function log(...args: any[]) {
	console.log(`[${new Date().toISOString()}]: `, ...args)
}

export function error(...args: any[]) {
	log('ERROR: ', ...args)
}
