import { Specification } from '../indexedDB/database/specification';

export interface specData {
    name: string;
    version: string;
    time: number;
    diff: string;
}

export interface renderData {
    path: string;
    data: specData[];
}

export interface OneFileVersionData {
    specs: Specification[];
    spec: Specification;
}
