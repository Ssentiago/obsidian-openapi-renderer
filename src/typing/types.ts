import {Params, ParsedParams} from "./interfaces";
import {DropdownComponent, TextComponent, ToggleComponent} from "obsidian";


export type ButtonID = 'openapi-renderer-server' | 'openapi-renderer' | 'openapi-refresher'

export type IframeCreator = (params: ParsedParams | Params) => HTMLIFrameElement;


export type ComponentType = DropdownComponent | TextComponent | ToggleComponent;

export type swaggerStoringType = 'fully-local' | 'partial-local' | 'cdn'

export type exportType = 'none' | 'cdn' | 'all-in-the-one' | 'zip'