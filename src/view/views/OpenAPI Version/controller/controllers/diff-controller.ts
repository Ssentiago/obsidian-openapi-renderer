import { DiffPatcher, create, Delta } from 'jsondiffpatch';
import DiffMatchPatch from 'diff-match-patch';

export class DiffController {
    private readonly diffPatch: DiffPatcher;

    constructor() {
        this.diffPatch = create({
            objectHash: function (obj) {
                return JSON.stringify(obj);
            },
            arrays: {
                detectMove: true,
                includeValueOnMove: false,
            },
            textDiff: {
                diffMatchPatch: DiffMatchPatch,
                minLength: 60,
            },
        });
    }

    diff(old: string, _new: string): Delta {
        return this.diffPatch.diff(old, _new);
    }

    unpatch(str: string, delta: any): unknown {
        return this.diffPatch.unpatch(str, delta);
    }

    patch(str: string, delta: any): unknown {
        return this.diffPatch.patch(str, delta);
    }
}
