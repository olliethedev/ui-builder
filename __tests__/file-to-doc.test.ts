import { fileToDoc } from '../lib/ui-builder/scripts/file-to-doc';

describe('fileToDoc', () => {
    it('should parse ReactClass component correctly', () => {
        const docs = fileToDoc('./__tests__/components/ReactClass.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        expect(doc.displayName).toBe('ReactClass');
        expect(doc.isDefault).toBe(true);
        expect(doc.props).toHaveProperty('content');
        expect(doc.props.content.type.name).toBe('string');
    });

    it('should parse ReactFC component correctly', () => {
        const docs = fileToDoc('./__tests__/components/ReactFC.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        expect(doc.displayName).toBe('ReactFC');
        expect(doc.isDefault).toBe(true);
        expect(doc.props).toHaveProperty('content');
        expect(doc.props.content.type.name).toBe('string');
    });

    it('should parse ReactFunction component correctly', () => {
        const docs = fileToDoc('./__tests__/components/ReactFunction.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        expect(doc.displayName).toBe('ReactFunction');
        expect(doc.isDefault).toBe(true);
        expect(doc.props).toHaveProperty('content');
        expect(doc.props.content.type.name).toBe('string');
    });

    it('should parse ReactFunctionWithExtendsTyped component correctly', () => {
        const docs = fileToDoc('./__tests__/components/ReactFunctionWithExtendsTyped.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        expect(doc.displayName).toBe('ReactFunctionWithExtendsTyped');
        expect(doc.isDefault).toBe(true);
        expect(doc.props).toHaveProperty('content');
        expect(doc.props.content.type.name).toBe('string');
    });

    it('should parse ReactFunctionWithExtendsTyped component correctly', () => {
        const docs = fileToDoc('./__tests__/components/ReactFunctionWithExtendsTyped.tsx');
        expect(docs).toHaveLength(1);
        const doc = docs[0];
        expect(doc.displayName).toBe('ReactFunctionWithExtendsTyped');
        expect(doc.isDefault).toBe(true);
        expect(doc.props).toHaveProperty('content');
        expect(doc.props.content.type.name).toBe('string');
    });

});