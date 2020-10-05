package org.mlarocca.containers.strings;

import org.mlarocca.containers.tree.SearchTree;

import java.util.Optional;

public interface StringsTree extends SearchTree<String> {
    /**
     * Search the tree for the longest key that is a prefix of prefix.
     *
     * @param prefix A non-empty string.
     * @return The (possibly empty) longest prefix of `prefix` that is stored in the trie.
     */
    Optional<String> longestPrefixOf(String prefix);

    /**
     * Search the tree for all the keys for which the argument is a valid prefix.
     *
     * @param prefix A string, possibly empty.
     * @return All the keys having the argument as a prefix.
     */
    Iterable<String> keysWithPrefix(String prefix);

    /**
     * Returns an iterable spanning over all the keys in the tree.
     *
     * @return All the keys in the tree.
     */
    Iterable<String> keys();
}

