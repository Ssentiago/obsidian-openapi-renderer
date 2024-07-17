import {Params, ParsedParams} from "./interfaces";


export type ButtonID = 'openapi-renderer-server' | 'openapi-renderer' | 'openapi-refresher'

export type IframeCreator = (params: ParsedParams | Params) => HTMLIFrameElement;


