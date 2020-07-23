package org.mlarocca.containers.trie;

import org.mlarocca.containers.tree.SearchTree;

public interface StringTree extends SearchTree<String> {
    String longestPrefixOf(String s);

    Iterable<String> keysWithPrefix(String prefix);

    Iterable<String> keys();
}

