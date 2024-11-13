import { moment } from 'obsidian';

export class LimitedMap<K, V> {
    private readonly map: Map<K, V>;
    private readonly accessTimes: Map<K, number>;
    private readonly maxSize: number;

    constructor(maxSize: number) {
        this.map = new Map<K, V>();
        this.accessTimes = new Map<K, number>();
        this.maxSize = maxSize;
    }

    set(key: K, value: V): void {
        if (this.map.size >= this.maxSize) {
            const oldest = this.findOldestKey();
            if (oldest !== undefined) {
                this.map.delete(oldest);
                this.accessTimes.delete(oldest);
            }
        }
        this.map.set(key, value);
        this.accessTimes.set(key, moment().unix());
    }

    get(key: K): V | undefined {
        const value = this.map.get(key);
        if (value) {
            this.accessTimes.set(key, moment().unix());
        }
        return value;
    }

    private findOldestKey(): K | undefined {
        let oldestKey: K | undefined;
        let oldestTime = Infinity;

        for (const [key, time] of this.accessTimes.entries()) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }

        return oldestKey;
    }
}
