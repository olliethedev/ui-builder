import { withCustomConfig, ComponentDoc, PropItem } from 'react-docgen-typescript';
import { Project, SourceFile, CallExpression, Identifier, Node } from 'ts-morph';

const defaultParserOpts = {
  savePropValueAsString: true,
  skipChildrenPropWithoutDoc: false,
  shouldExtractValuesFromUnion: false,
  shouldExtractLiteralValuesFromEnum: false,
  shouldRemoveUndefinedFromOptional: true,
  shouldSortUnions: true,
  customComponentTypes: ["Toaster"],
  propFilter: (prop: PropItem) => {
    if (prop.declarations && prop.declarations.length > 0) {
      // Filter props based on declarations
      const hasValidDeclaration = prop.declarations.some((declaration) => {
        const isChildren = prop.name === 'children';
        const isRadixUI = declaration.fileName.includes('@radix-ui'); // specific to shadcn/ui as components are imported from there
        // skip node_modules for props inheriting things like HTMLDivElement, or we will get an overwhelming amount of props
        const isNodeModules = declaration.fileName.includes('node_modules');

        return isChildren || isRadixUI || !isNodeModules;
      });
      return hasValidDeclaration;
    }
    return true;
  },
};

// Create a parser with custom configuration
const customParser = withCustomConfig('./tsconfig.json', defaultParserOpts);
// const parser = withDefaultConfig(defaultParserOpts);

// Extend the ComponentDoc type to include isDefault flag and componentName
export type ComponentDocWithIsDefault = ComponentDoc & {
  isDefault: boolean;
  componentName: string;
};

// Initialize a ts-morph Project
const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

/**
 * Parses a file and returns the documentation along with export information.
 * @param filePath - The path to the file to parse.
 * @returns The documentation for the file including isDefault and componentName.
 */
export function fileToDoc(filePath: string): ComponentDocWithIsDefault[] {
  const docs = customParser.parse(filePath);
  const sourceFile = project.addSourceFileAtPath(filePath);

  const exportNames = getExportNames(sourceFile);

  return docs.map((doc) => {
    const exportInfo = exportNames.find((exp) => {
        return exp.displayName === doc.displayName || exp.name.toLowerCase() === doc.displayName.toLowerCase();
    });
    const isDefault = exportInfo ? exportInfo.isDefault : false;
    const componentName = exportInfo ? exportInfo.name : doc.displayName;
    return { ...doc, isDefault, componentName };
  });
}

/**
 * Retrieves export names from a source file.
 * @param sourceFile - The ts-morph SourceFile object.
 * @returns An array of Export objects containing name and isDefault flag.
 */
function getExportNames(sourceFile: SourceFile): Export[] {
    const defaultExports = sourceFile.getExportAssignments();
    const exportSymbols = sourceFile.getExportSymbols();
    const exportNames: Export[] = [];
  
    // First, collect all export names
    defaultExports.forEach((exportAssignment) => {
      const expr = exportAssignment.getExpression();
      if (expr) {
        let name: string;
  
        if (Node.isIdentifier(expr)) {
          // export default Identifier;
          name = expr.getText();
        } else if (Node.isCallExpression(expr)) {
          // Handle higher-order components or wrapper functions e.g., export default memo(Component);
          const callExpr = expr as CallExpression;
          const args = callExpr.getArguments();
          const identifierArg = args.find((arg) => Node.isIdentifier(arg)) as Identifier | undefined;
          name = identifierArg ? identifierArg.getText() : expr.getText();
        } else {
          // Fallback to the expression's text
          name = expr.getText();
        }
  
        exportNames.push({
          name: name,
          isDefault: true,
        });
      }
    });
  
    exportSymbols.forEach((exportSymbol) => {
      if (exportSymbol.getName() !== 'default') {
        exportNames.push({
          name: exportSymbol.getName(),
          isDefault: false,
        });
      }
    });
  
    // Now, map component names to their displayNames if defined
    const displayNameMap: Record<string, string> = {};
  
    // Find all expression statements that assign to Component.displayName
    sourceFile.getStatements().forEach(statement => {
      if (Node.isExpressionStatement(statement)) {
        const expression = statement.getExpression();
        if (Node.isBinaryExpression(expression)) {
          const left = expression.getLeft();
          const right = expression.getRight();
  
          // Check if the left side is of the form Component.displayName
          if (
            Node.isPropertyAccessExpression(left) &&
            left.getName() === 'displayName' &&
            Node.isIdentifier(left.getExpression())
          ) {
            const componentName = left.getExpression().getText();
            let displayNameValue = '';
  
            // Extract the displayName value if it's a string literal
            if (Node.isStringLiteral(right) || Node.isNoSubstitutionTemplateLiteral(right)) {
              displayNameValue = right.getLiteralText();
            } else {
              // Handle cases where displayName is assigned a variable or expression
              displayNameValue = right.getText();
            }
  
            displayNameMap[componentName] = displayNameValue;
          }
        }
      }
    });
  
    // Assign displayName to the corresponding exports
    exportNames.forEach(exp => {
      if (displayNameMap[exp.name]) {
        exp.displayName = displayNameMap[exp.name];
      }else {
        //fallback to filename because displayName is not defined and react-docgen-typescript uses the name of the file as the displayName for default exports
        exp.displayName = sourceFile.getBaseName().replace('.tsx', '').replace('-', '');
      }
    });
  
    return exportNames;
  }

/**
 * Represents an export from a source file.
 */
interface Export {
  name: string;
  isDefault: boolean;
  displayName?: string;
}