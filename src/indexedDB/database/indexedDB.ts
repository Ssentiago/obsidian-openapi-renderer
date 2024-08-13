import Dexie from 'dexie';
import { BaseSpecification } from './specification';

interface Database extends Dexie {
    spec: Dexie.Table<BaseSpecification, number>;
}

export class IndexedDB extends Dexie implements Database {
    spec: Dexie.Table<BaseSpecification, number>;

    constructor() {
        super('OpenAPI Renderer');

        this.version(1).stores({
            spec: '++id, &[path+name+diff+version], createdAt, softDeleted',
        });
        this.spec = this.table('spec');

        this.spec.mapToClass(BaseSpecification);
    }

    async add(spec: BaseSpecification): Promise<void> {
        await this.spec.add(spec);
    }

    async getVersions(path: string): Promise<BaseSpecification[]> {
        let versions = await this.spec.where('path').equals(path).toArray();
        versions = versions.sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
        );
        return versions;
    }

    async getLastVersion(path: string): Promise<BaseSpecification | undefined> {
        const specs = await this.spec
            .where('path')
            .equals(path)
            .sortBy('createdAt');
        return specs.at(-1);
    }

    async deleteVersion(id: number): Promise<void> {
        const spec = await this.spec.get(id);
        if (spec) {
            spec.softDeleted = true;
            await this.spec.put(spec);
        }
    }

    async restoreVersion(id: number): Promise<void> {
        const spec = await this.spec.get(id);
        if (spec) {
            spec.softDeleted = false;
            await this.spec.put(spec);
        }
    }

    async deleteVersionPermanently(id: number): Promise<void> {
        await this.spec.delete(id);
    }

    async isNextVersionFull(path: string): Promise<boolean> {
        const specs = await this.spec.where('path').equals(path).toArray();
        return (specs.length + 1) % 10 === 0;
    }

    async removeAllVersions(path: string): Promise<void> {
        await this.spec
            .where('path')
            .equals(path)
            .modify((record) => (record.softDeleted = true));
    }

    async clearAll(): Promise<void> {
        await this.spec
            .toCollection()
            .modify((record) => (record.softDeleted = true));
    }

    async restoreAll(): Promise<void> {
        await this.spec
            .toCollection()
            .modify((record) => (record.softDeleted = false));
    }

    async permanentlyClearAll(): Promise<void> {
        await this.spec
            .filter((record) => Boolean(record.softDeleted))
            .delete();
    }
}
