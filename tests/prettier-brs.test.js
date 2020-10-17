const prettier = require("prettier");

function format(code, additionalOptions = {}) {
    options = {
        parser: "brs-parse",
        plugins: ["."],
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
        let code = 'a = [0, ["blah", false], invalid]\n'
        expect(format(code, { printWidth: 20})).toBe(code)
    });
})
