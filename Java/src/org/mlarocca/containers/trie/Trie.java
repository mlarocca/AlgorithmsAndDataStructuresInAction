package org.mlarocca.containers.trie;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class Trie implements StringTree {

    TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    @Override
    public boolean add(String element) {
        return root.add(element) != null;
    }

    @Override
    public boolean remove(String element) {
        return root.remove(element);
    }

    @Override
    public void clear() {
        // Let the garbage collector do the heavy lifting
        this.root = new TrieNode();
    }

    @Override
    public Optional<String> min() {
        return Optional.empty();
    }

    @Override
    public Optional<String> max() {
        return Optional.empty();
    }

    @Override
    public Optional<String> search(String element) {
        return Optional.empty();
    }

    @Override
    public boolean isEmpty() {
        return this.size() == 0;
    }

    @Override
    public int size() {
        return root.size();
    }

    @Override
    public int height() {
        return 0;
    }

    @Override
    public String longestPrefixOf(String s) {
        return null;
    }

    @Override
    public Iterable<String> keysWithPrefix(String prefix) {
        return null;
    }

    @Override
    public Iterable<String> keys() {
        return null;
    }

    private class TrieNode {

        Map<Character, TrieNode> children;
        boolean storesKey;

        private TrieNode(String key, int charIndex) {
            children = new HashMap<>();
            if (charIndex >= key.length()) {
                storesKey = true;
            } else {
                storesKey = false;
                Character character = key.charAt(charIndex);
                children.put(character, new TrieNode(key, charIndex + 1));
            }
        }

        public TrieNode(String key) {
            this(key, 0);
        }

        public TrieNode() {
            children = new HashMap<>();
            storesKey = false;
        }

        public TrieNode add(String key) {
            return this.add(key, 0);
        }

        private TrieNode add(String key, int charIndex) {
            if (charIndex < key.length()) {
                Character character = key.charAt(0);
                if (children.containsKey(character)) {
                    children.get(character).add(key, charIndex + 1);
                } else {
                    children.put(character, new TrieNode(key, charIndex + 1));
                }
            } else if (charIndex == key.length()) {
                this.storesKey = true;
            } else {
                throw new IllegalArgumentException("CharIndex out of bound " + charIndex + ", " + key);
            }
            return this;
        }

        public TrieNode getNodeFor(String key) {
            return getNodeFor(key, 0);
        }

        private TrieNode getNodeFor(String key, int charIndex) {
            if (charIndex > key.length()) {
                return null;
            } else if (charIndex == key.length()) {
                return storesKey ? this : null;
            } else {
                Character character = key.charAt(0);
                if (children.containsKey(character)) {
                    return children.get(character).getNodeFor(key, charIndex + 1);
                } else {
                    return null;
                }
            }
        }

        public boolean remove(String key) {
            return this.remove(key, 0, new AtomicBoolean(false));
        }

        private boolean remove(String key, int charIndex, AtomicBoolean purge) {
            if (charIndex > key.length()) {
                return false;
            } else if (charIndex == key.length()) {
                if (storesKey) {
                    storesKey = false;
                    if (children.isEmpty()) {
                        purge.set(true);
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                Character character = key.charAt(0);
                if (children.containsKey(character)) {
                    boolean deleted = children.get(character).remove(key, charIndex + 1, purge);
                    if (deleted && purge.get()) {
                        // If the node was deleted and its subtree has no other key, we can remove it from this node's
                        // branches.
                        children.remove(character);
                        if (!children.isEmpty()) {
                            // If there are other branches in the tree, we can't purge the trie anymore
                            purge.set(false);
                        }
                    }
                    return deleted;
                } else {
                    return false;
                }
            }
        }

        public int size() {
            int keysInSubTree = children.values()
                    .parallelStream()
                    .map(node -> node.size())
                    .reduce(0, (a, b) -> a + b);
            return (storesKey ? 1 : 0) + keysInSubTree;
        }

        public List<String> keys() {
            List<String> keys = Collections.synchronizedList(new ArrayList<>());
            this.keys("", keys);
            return keys;
        }

        private void keys(String currentPath, List<String> keys) {
            if (this.storesKey) {
                keys.add(currentPath);
            }
            // For each children, we need to start the search, keeping track of the path
            children.entrySet()
                    .parallelStream()
                    .forEach(entry -> entry.getValue().keys(currentPath + entry.getKey(), keys));
        }
    }
}
