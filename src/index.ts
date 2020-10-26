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
        return builders.concat(path.map(print));
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
    );
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
    );
}

function printBinary(path: any, options: any, print: Function) {
    let binaryNode: parser.Expr.Binary = path.getValue();
    return builders.group(
        builders.concat([
            path.call(print, 'left'),
            builders.line,
            binaryNode.token.text,
            builders.line,
            path.call(print, 'right')
        ])
    );
}


function printGrouping(path: any, options: any, print: Function) {
    let groupingNode: parser.Expr.Grouping = path.getValue();
    return builders.group(
        builders.concat([
            groupingNode.tokens.left.text,
            builders.softline,
            path.call(print, 'expression'),
            builders.softline,
            groupingNode.tokens.right.text,
        ])
    );
}

function printCall(path: any, options: any, print: Function) {
    let callNode: parser.Expr.Call = path.getValue();

    // @fix line breaks
    return builders.group(
        builders.concat([
            path.call(print, 'callee'),
            '(',
            builders.join(', ', path.map(print, 'args')),
            ')'
        ])
    );
}

function printDottedGet(path: any, options: any, print: Function) {
    let dottedGetNode: parser.Expr.DottedGet = path.getValue();
    return builders.group(
        builders.concat([
            path.call(print, 'obj'),
            '.',
            dottedGetNode.name.text
        ])
    );
}

let nodeTypeToPrint: any = {
    // Statements
    "Assignment": printAssignment,

    // Expressions
    "Literal": printLiteral,
    "ArrayLiteral": printArrayLiteral,
    "AALiteral": printAALiteral,
    "Variable": printVariable,
    "Binary": printBinary,
    "Grouping": printGrouping,
    "Call": printCall,
    "DottedGet": printDottedGet,
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
