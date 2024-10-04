import { docToInterface, PropInterfaceData } from '../lib/ui-builder/scripts/doc-to-interface';
import { fileToDoc } from '../lib/ui-builder/scripts/file-to-doc';
import path from 'path';

describe('docToInterface', () => {
    const componentsDir = path.join(__dirname, '..', 'components');

    it('should generate interface for ReactClass component', () => {
        const docs = fileToDoc('./__tests__/components/ReactClass.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        
        const interfaceData: PropInterfaceData = docToInterface(doc, componentsDir, undefined);
        expect(interfaceData.componentName).toBe('ReactClass');
        expect(interfaceData.interfaceString).toContain('export interface ReactClassProps');
        expect(interfaceData.interfaceString).toContain('content: string;');
        expect(interfaceData.isDefault).toBe(true);
        expect(interfaceData.from).toBe('@/components/ReactClass');
    });

    it('should generate interface for ReactFC component', () => {
        const docs = fileToDoc('./__tests__/components/ReactFC.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        
        const interfaceData: PropInterfaceData = docToInterface(doc, componentsDir, undefined);
        expect(interfaceData.componentName).toBe('ReactFC');
        expect(interfaceData.interfaceString).toContain('export interface ReactFCProps');
        expect(interfaceData.interfaceString).toContain('content: string;');
        expect(interfaceData.isDefault).toBe(true);
        expect(interfaceData.from).toBe('@/components/ReactFC');
    });

    it('should generate interface for ReactFunction component', () => {
        const docs = fileToDoc('./__tests__/components/ReactFunction.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        
        const interfaceData: PropInterfaceData = docToInterface(doc, componentsDir, undefined);
        expect(interfaceData.componentName).toBe('ReactFunction');
        expect(interfaceData.interfaceString).toContain('export interface ReactFunctionProps');
        expect(interfaceData.interfaceString).toContain('content: string;');
        expect(interfaceData.isDefault).toBe(true);
        expect(interfaceData.from).toBe('@/components/ReactFunction');
    });

    it('should handle components with extended props correctly', () => {
        const docs = fileToDoc('./__tests__/components/ReactClassWithExtends.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        
        const interfaceData: PropInterfaceData = docToInterface(doc, componentsDir, undefined);
        expect(interfaceData.componentName).toBe('ReactClass');
        expect(interfaceData.interfaceString).toContain('export interface ReactClassProps');
        expect(interfaceData.interfaceString).toContain('prefix: string;');
        expect(interfaceData.interfaceString).toContain('content: string;');
        expect(interfaceData.isDefault).toBe(true);
        expect(interfaceData.from).toBe('@/components/ReactClassWithExtends');
    });

    it('should handle components with complex prop types', () => {
        const docs = fileToDoc('./__tests__/components/ReactFunctionComplexTypes.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        
        const interfaceData: PropInterfaceData = docToInterface(doc, componentsDir, undefined);
        expect(interfaceData.componentName).toBe('ReactFunctionComplexTypes');
        expect(interfaceData.interfaceString).toContain('export interface ReactFunctionComplexTypesProps');
        expect(interfaceData.interfaceString).toContain('stringProp: string;');
        expect(interfaceData.interfaceString).toContain('userRole: \"admin\" | \"user\" | \"guest\"');
        expect(interfaceData.isDefault).toBe(true);
        expect(interfaceData.from).toBe('@/components/ReactFunctionComplexTypes');
    });
});