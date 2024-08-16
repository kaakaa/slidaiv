import * as assert from 'assert';

import { getLocaleName, obj2frontmatter } from "./utils";

suite('obj2frontmatter', () => {
    test('should return empty string', () => {
        assert.equal('', obj2frontmatter({}));
    });
    test('should return 1 elem frontmatter', () => {
        assert.equal('---\nelem1: val1\n---', obj2frontmatter({"elem1": "val1"}));
    });
    test('should return 2 elem frontmatter', () => {
        assert.equal('---\nelem1: val1\nelem2: val2\n---', obj2frontmatter({"elem1": "val1", "elem2": "val2"}));
    });
    test('should return nested elem frontmatter', () => {
        assert.equal('---\nparent1:\n  child1: val1\n  child2: val2\nparent2:\n  - list1\n  - list2\n---', obj2frontmatter({"parent1": {"child1": "val1", "child2": "val2"}, "parent2": ["list1", "list2"]}));
    });
});


suite('getLocaleName', () => {
    test('should return English', () => {
        assert.equal('English', getLocaleName('en'));
    });
    test('should return Japanese with ja', () => {
        assert.equal('Japanese', getLocaleName('ja'));
    });
    test('should return Chinese (China) with zh-cn', () => {
        assert.equal('Chinese (China)', getLocaleName('zh-cn'));
    });
    test('should return Chinese (Taiwan) with zh-tw', () => {
        assert.equal('Chinese (Taiwan)', getLocaleName('zh-tw'));
    });
    test('should return English with empty string', () => {
        assert.equal('English', getLocaleName(''));
    });
    test('should return English with invalid string', () => {
        assert.equal('English', getLocaleName(')#$'));
    });
});
