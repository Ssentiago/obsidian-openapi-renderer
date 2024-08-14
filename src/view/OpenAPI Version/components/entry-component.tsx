import React from 'react';
import { Specification } from '../../../indexedDB/database/specification';
import { OpenAPIVersionView } from '../openapi-version-view';
import { SpecificationProvider } from './core/context';
import VersionViewComponent from './version-view/version-view-component';

export const VersionViewEntry: React.FC<{
    specifications?: Specification[];
    view: OpenAPIVersionView;
}> = ({ specifications = [], view }) => (
    <SpecificationProvider>
        <VersionViewComponent view={view} specifications={specifications} />
    </SpecificationProvider>
);
