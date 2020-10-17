import { parser, lexer, preprocessor, types } from "brs"
import prettier = require('prettier')

function parse(code: string, options: any): object {
    let manifest = preprocessor.getManifestSync(process.cwd());
    let scanResults = lexer.Lexer.scan(code, options.filePath);
    let pp = new preprocessor.Preprocessor();
    let preprocessorResults = pp.preprocess(scanResults.tokens, manifest);
    let ast = parser.Parser.parse(preprocessorResults.processedTokens).statements;
    return ast[0];
}

function prettyPrintBrs(path: any, options: any, print: Function) {
    let node = path.getValue();
    // @nicco: check ast spec - "pretty" sure brs represents a single file's contents as a tree
    return nodeTypeToPrint[node.type](path, options, print);
}

function printAssignment(path: any, options: any, print: Function) {
    let node = path.getValue();
    return builders.concat(
        [node.name.text, " = ", path.call(print, 'value'), builders.line]
    );
}

function printLiteral(path: any, options: any, print: Function) {
    let node: parser.Expr.Literal = path.getValue();
    let valueString = node.value.toString();
    if (node.value.kind === types.ValueKind.String) {
        return `\"${valueString}\"`
    }
    return valueString;
}

// A little hard to parse this unless you understand how builders.group
// and builders.line work together. Line tries to fit everything within a group
// within options.printWidth. If it can't, we get line breaks with indentation
function printArrayLiteral(path: any, options: any, print: Function) {
    return builders.group(
        builders.indent(
            builders.concat(['[',
                builders.join(
                    builders.concat([',', builders.line]), path.map(print, 'elements')
                ),
            ']'])
        )
    )
}

let builders = prettier.doc.builders;

let nodeTypeToPrint: any = {
    "Assignment": printAssignment,
    "Literal": printLiteral,
    "ArrayLiteral": printArrayLiteral,
};

let languages = [
    {
        extensions: ['.brs'],
        name: 'Brightscript',
        parsers: ['brs-parse']
    }
]

let parsers = {
    'brs-parse': {
        parse: (text: string, parsers: any, options: any): any =>
        parse(text, options),
        astFormat: 'brs-ast',
    }
}

let printers = {
    'brs-ast': {
        print: prettyPrintBrs
    }
}
// options: { printWidth: 120 }
module.exports = {
    languages,
    parsers,
    printers
}
