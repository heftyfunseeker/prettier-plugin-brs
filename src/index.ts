import { parser, lexer, preprocessor, types } from "brs"

import prettier = require('prettier')
let builders = prettier.doc.builders;

function parse(code: string, options: any): object {
    let manifest = preprocessor.getManifestSync(process.cwd());
    let scanResults = lexer.Lexer.scan(code, options.filePath);
    let pp = new preprocessor.Preprocessor();
    let preprocessorResults = pp.preprocess(scanResults.tokens, manifest);
    let ast = parser.Parser.parse(preprocessorResults.processedTokens).statements;
    return ast;
}

function printBrs(path: any, options: any, print: Function) {
    let node = path.getValue();
    if (Array.isArray(node)) {
        return builders.concat(path.map(print))
    }
    return nodeTypeToPrint[node.type](path, options, print);
}

function printAssignment(path: any, options: any, print: Function) {
    let node = path.getValue();
    return builders.concat(
        [node.name.text, " = ", path.call(print, 'value'), builders.line]
    );
}

function printLiteral(path: any, options: any, _print: Function) {
    let node: parser.Expr.Literal = path.getValue();
    let valueString = node.value.toString();
    if (node.value.kind === types.ValueKind.String) {
        return `\"${valueString}\"`
    }
    return valueString;
}

function printVariable(path: any, options: any, _print: Function) {
    let node: parser.Expr.Variable = path.getValue();
    return node.name.text;
}

function printArrayLiteral(path: any, options: any, _print: Function) {
    return builders.group(
        builders.concat([
            '[',
            builders.indent(
                builders.concat([
                    builders.softline,
                    builders.join(
                        builders.concat([',', builders.line]), path.map(printBrs, 'elements')
                    )
                ])
            ),
            builders.softline,
            ']'
        ])
    )
}

function printAAMember(path: any, options: any, _print: Function) {
    let memberNode: parser.Expr.AAMember = path.getValue();
    return builders.concat([
        memberNode.name.toString(),
        ': ',
        path.call(printBrs, 'value')
    ]);
}

function printAALiteral(path: any, options: any, _print: Function) {
    return builders.group(
        builders.concat([
            '{',
            builders.indent(
                builders.concat([
                    builders.line,
                    builders.join(
                        builders.concat([',', builders.line]), path.map(printAAMember, 'elements')
                    )
                ])
            ),
            builders.line,
            '}'
        ])
    )
}

let nodeTypeToPrint: any = {
    "Assignment": printAssignment,
    "Literal": printLiteral,
    "ArrayLiteral": printArrayLiteral,
    "AALiteral": printAALiteral,
    "Variable": printVariable,
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
        print: printBrs
    }
}
// options: { printWidth: 120 }
module.exports = {
    languages,
    parsers,
    printers
}
