import * as assert from 'assert';
import { obj2yaml } from "./utils";

suite('utils', () => {
    test('should return empty string', () => {
        assert.equal('', obj2yaml({}));
    });
    test('should return 1 elem frontmatter', () => {
        assert.equal('---\nelem1: val1\n---', obj2yaml({"elem1": "val1"}));
    });
    test('should return 2 elem frontmatter', () => {
        assert.equal('---\nelem1: val1\nelem2: val2\n---', obj2yaml({"elem1": "val1", "elem2": "val2"}));
    });
    test('should return nested elem frontmatter', () => {
        assert.equal('---\nparent1:\n  child1: val1\n  child2: val2\nparent2:\n  - list1\n  - list2\n---', obj2yaml({"parent1": {"child1": "val1", "child2": "val2"}, "parent2": ["list1", "list2"]}));
    });
});