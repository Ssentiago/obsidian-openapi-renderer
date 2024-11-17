export interface AnchorData {
    line: number;
    pos: number;
    time: number;
    label?: string;
    comment?: string;
}

export class Anchor {
    path: string;
    anchors: AnchorData[];
    constructor(path: string, anchors: AnchorData[]) {
        this.path = path;
        this.anchors = anchors;
    }
}
