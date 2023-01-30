const {
    SYMBOL:VARIABLE_SYMBOL,
    SHORT_SENTENCE:VARIABLE_SHORT_SENTENCE,
    MODEL_LIST:VARIABLE_MODEL_LIST,
    PLUGIN_LIST:VARIABLE_PLUGIN_LIST,
    GITGNORE:VARIABLE_GITGNORE,
    TEXT:VARIABLE_TEXT,
    findModel:FUNCTION_findModel
} = require("../src/index");
test('VARIABLE', () => {
    expect(Array.isArray(VARIABLE_SYMBOL)).toBe(true);
    expect(Array.isArray(VARIABLE_SHORT_SENTENCE)).toBe(true);
    expect(Array.isArray(VARIABLE_MODEL_LIST)).toBe(true);
    expect(Array.isArray(VARIABLE_PLUGIN_LIST)).toBe(true);
    expect(Array.isArray(VARIABLE_GITGNORE)).toBe(true);
    expect(Array.isArray(VARIABLE_TEXT)).toBe(true);
});
test('FUNCTION', () => {
    expect(FUNCTION_findModel()).toBe(true);
    expect(FUNCTION_findModel()).toBe(false);
});