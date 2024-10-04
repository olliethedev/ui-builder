import * as path from 'path';
import { ComponentDocWithIsDefault } from "./file-to-doc";
import { Project, } from 'ts-morph';

// Initialize ts-morph Project for type checking
const project = new Project({
    useInMemoryFileSystem: true,
});

export type PropInterfaceData = {
    interfaceString: string;
    componentName: string;
    from: string;
    isDefault: boolean;
    filePath: string;
}

/**
 * Generates a TypeScript interface string for a given component.
 * Handles complex types by assigning appropriate default values.
 * @param doc - The component documentation extracted by react-docgen-typescript.
 * @returns The TypeScript interface as a string.
 */
export function docToInterface(doc: ComponentDocWithIsDefault, rootDir: string, dirPart: string | undefined): PropInterfaceData {

    const path = dirPart ? dirPart.replace(rootDir, '') : '';
    let interfaceString = '';

    // Start interface definition
    interfaceString += `export interface ${ doc.componentName }Props {\n`;

    Object.entries(doc.props).forEach(([propName, propData]) => {

        const optionalFlag = propData.required ? '' : '?';
        let propType = propData.type.name;

        // Check if the type is a function
        if (isFunctionType(propType)) {
            propType = '(...args: any[]) => any';
        }
        // Validate the prop type
        else if (!isValidType(propType)) {
            console.warn(`Unresolved complex type "${ propType }" for prop "${ propName }" in component "${ doc.displayName }". Defaulting to "any".`);
            propType = 'any';
        }


        interfaceString += `  ${ fixKey(propName) }${ optionalFlag }: ${ propType };\n`;
    });

    interfaceString += '}\n';

    const componentName = doc.componentName;
    // const relativePath = getRelativeImportPath(doc.filePath, rootDir, dirPart);

    const from = `@/components${ path }/${ getFilenameWithoutExtension(doc.filePath) }`;

    return {
        interfaceString,
        componentName,
        from,
        isDefault: doc.isDefault,
        filePath: doc.filePath
    };
}

/**
 * Checks if a given type name is a valid TypeScript type without external dependencies.
 * @param typeName - The name of the type to validate.
 * @returns True if the type is valid, false otherwise.
 */
function isValidType(typeName: string): boolean {

    // Create a temporary source file with the type declaration
    const sourceFile = project.createSourceFile("temp.ts", `type TempType = ${ typeName };`, { overwrite: true });

    // Retrieve diagnostics (errors) for the source file
    const diagnostics = sourceFile.getPreEmitDiagnostics();

    if (diagnostics.length > 0) {
        // console.warn(`Type "${ typeName }" is invalid:`, diagnostics.map(d => d.getMessageText()).join(", "));
        return false;
    }


    return true;
}

/**
 * Checks if a given type name is a function type.
 * @param typeName - The name of the type to check.
 * @returns True if the type is a function, false otherwise.
 */
function isFunctionType(typeName: string): boolean {
    // Create a temporary source file with the type declaration
    const sourceFile = project.createSourceFile("temp.ts", `type TempType = ${ typeName };`, { overwrite: true });
    const typeAlias = sourceFile.getTypeAliasOrThrow("TempType");
    const type = typeAlias.getType();

    // Check if the type is a function
    return type.getCallSignatures().length > 0;
}

/**
 * Fixes any valid key to a valid type key by adding quotes if necessary.
 * e.g., area-label -> "area-label"
 * @param key - String of the key to fix.
 * @returns The fixed key.
 */
function fixKey(key: string): string {
    if (key.includes('-')) {
        return `"${ key }"`;
    }
    return key;
}

/**
 * Gets filename without the extension.
 * @param filepath - The absolute path of the component file.
 * @returns The filename without the extension.
 */
function getFilenameWithoutExtension(filepath: string): string {
    return path.basename(filepath, '.tsx');
}

