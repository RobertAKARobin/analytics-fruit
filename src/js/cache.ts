export class Cache<CacheVal extends Record<string, unknown>> {
	public val: CacheVal;

	constructor (
		public key: string,
	) {
		this.val = tryOrNull(() => JSON.parse(localStorage.getItem(this.key))) || {};
	}

	clear() {
		for (const propertyName in this.val) {
			delete this.val[propertyName];
		}
		this.persist();
	}

	persist() {
		localStorage.setItem(this.key, JSON.stringify(this.val));
	}
}

function tryOrNull(callback) {
	try {
		return callback();
	} catch {
		return null;
	}
}
