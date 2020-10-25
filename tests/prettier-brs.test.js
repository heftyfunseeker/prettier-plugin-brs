const prettier = require("prettier");

function format(code, additionalOptions = {}) {
    options = {
        parser: "brs-parse",
        plugins: ["."],
        tabWidth: 4,
        ...additionalOptions,
    }
    return prettier.format(code, options);
}

describe('Assignment', () => {
    test('formats literals', () => {
        let code = 'a = 32\n'
        expect(format(code)).toBe(code)

        code = 'a = "some string"\n'
        expect(format(code)).toBe(code)

        code = 'a = false\n'
        expect(format(code)).toBe(code)

        code = 'a = false\n'
        expect(format(code)).toBe(code)

        code = 'a = invalid\n'
        expect(format(code)).toBe(code)
    });

    test('formats array literals', () => {
        let code = 'a = [0, "blah", false, invalid]\n'
        expect(format(code)).toBe(code)

    });

    test('formats nested array of literals', () => {
        let code = 'a = [0, ["blah", false], invalid]\n'
        expect(format(code)).toBe(code)
    });

    test('formats line breaks of array', () => {
        let code =
`a = [
    0,
    ["blah", false],
    invalid
]\n`
        expect(format(code, { printWidth: 20})).toBe(code)
    });

    test('formats AA literals', () => {
        let code = 'a = { blah: "foo" }\n'
        expect(format(code)).toBe(code)
    });

    test('formats nested AA literals', () => {
        code = 'a = { blah: [1, 2, 3] }\n'
        expect(format(code)).toBe(code)

        code = 'a = { blah: { foo: 2, bar: "some string" } }\n'
        expect(format(code)).toBe(code)
    });

    test('formats line breaks of AA literals', () => {
        code =
`a = {
    blah: {
        foo: 2,
        bar: "some string"
    }
}\n`
        expect(format(code, { printWidth: 20 })).toBe(code)
    });

    test('formats variables', () => {
        let code = 'a = 32\nb = a\n'
        expect(format(code)).toBe(code)

        code =
`stringVar = "..."
a = {
    blah: {
        foo: [1, 2, 3],
        bar: {
            some: stringVar
        }
    }
}\n`
        expect(format(code, { printWidth: 25 })).toBe(code)
    });
})
