package org.mlarocca.containers.trie.tst;

import org.mlarocca.containers.trie.StringTree;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class Tst implements StringTree {

    private TstNode root;

    public Tst() {
        root = null;
    }

    @Override
    public boolean add(String element) {
        if (element.isEmpty()) {
            throw new IllegalArgumentException("Keys must be non-empty");
        }
        if (root == null) {
            root = new TstNode(element);
            return true;
        } else {
            return root.add(element) != null;
        }
    }

    @Override
    public boolean remove(String element) {
        if (root == null) {
            return false;
        } else {
            return root.remove(element);
        }
    }

    @Override
    public void clear() {
        // Let the garbage collector do all the hard work
        root = null;
    }

    @Override
    public Optional<String> search(String element) {
        return root.search(element) == null ? Optional.empty() : Optional.of(element);
    }

    @Override
    public Optional<String> longestPrefixOf(String prefix) {
        return Optional.empty();
    }

    @Override
    public Iterable<String> keysWithPrefix(String prefix) {
        return null;
    }

    @Override
    public Iterable<String> keys() {
        return root == null ? new HashSet<>() : root.keys();
    }

    @Override
    public Optional<String> min() {
        return Optional.ofNullable(root).map(TstNode::min);
    }

    @Override
    public Optional<String> max() {
        return Optional.ofNullable(root).map(TstNode::max);
    }

    @Override
    public boolean isEmpty() {
        return root == null || root.size() == 0;
    }

    @Override
    public int size() {
        return root == null ? 0 : root.size();
    }

    @Override
    public int height() {
        return root == null ? 0 : root.height();
    }

    private class TstNode {

        private Character character;
        private boolean storesKey;

        private TstNode left;
        private TstNode middle;
        private TstNode right;

        public TstNode(String key) {
            this(key, 0);
        }

        public TstNode(String key, int charIndex) {
            if (charIndex >= key.length()) {
                throw new IndexOutOfBoundsException();
            }
            character = key.charAt(charIndex);
            left = right = null;
            if (charIndex + 1 < key.length()) {
                // Stores the rest of the key in a midlle-link chain
                storesKey = false;
                middle = new TstNode(key, charIndex + 1);
            } else {
                middle = null;
                storesKey = true;
            }
        }

        public TstNode add(String key) {
            return this.add(key, 0);
        }

        private TstNode add(String key, int charIndex) {
            if (charIndex < key.length()) {
                Character c = key.charAt(charIndex);
                if (character.equals(c)) {
                    if (charIndex == key.length() - 1) {
                        if (storesKey) {
                            return null;
                        } else {
                            storesKey = true;
                            return this;
                        }
                    } else if (this.middle != null) {
                        return middle.add(key, charIndex + 1);
                    } else {
                        this.middle = new TstNode(key, charIndex + 1);
                        return middle;
                    }
                } else if (c.compareTo(character) < 0) {
                    if (this.left != null) {
                        return left.add(key, charIndex);
                    } else {
                        left = new TstNode(key, charIndex);
                        return left;
                    }
                } else {
                    if (this.right != null) {
                        return right.add(key, charIndex);
                    } else {
                        right = new TstNode(key, charIndex);
                        return right;
                    }
                }
            } else {
                throw new IllegalArgumentException("CharIndex out of bound " + charIndex + ", " + key);
            }
        }

        public boolean remove(String key) {
            AtomicBoolean purge = new AtomicBoolean(false);
            return remove(key, 0, purge);
        }

        private boolean remove(String key, int charIndex, AtomicBoolean purge) {
            if (charIndex >= key.length()) {
                return false;
            }
            Character c = key.charAt(charIndex);
            if (c.equals(this.character)) {
                if (charIndex == key.length() - 1) {
                    if (storesKey) {
                        storesKey = false;
                        // If this stores a key, and it's a leaf, the path to this node can be purged.
                        purge.set(this.isLeaf());
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    boolean deleted = this.middle == null
                            ? false
                            : this.middle.remove(key, charIndex + 1, purge);
                    if (deleted && purge.get()) {
                        this.middle = null;
                        purge.set(!this.storesKey && this.isLeaf());
                    }
                    return deleted;
                }
            } else if (c.compareTo(this.character) < 0) {
                boolean deleted = left == null ? false : left.remove(key, charIndex, purge);
                if (deleted && purge.get()) {
                    this.left = null;
                    purge.set(!this.storesKey && this.isLeaf());
                }
                return deleted;
            } else {
                boolean deleted = right == null ? false : right.remove(key, charIndex, purge);
                if (deleted && purge.get()) {
                    this.right = null;
                    purge.set(!this.storesKey && this.isLeaf());
                }
                return deleted;
            }
        }

        public TstNode search(String key) {
            return search(key, 0);
        }

        private TstNode search(String key, int charIndex) {
            if (charIndex >= key.length()) {
                return null;
            }
            Character c = key.charAt(charIndex);
            if (c.equals(this.character)) {
                if (charIndex == key.length() - 1) {
                    return storesKey ? this : null;
                } else {
                    return this.middle == null ? null : this.middle.search(key, charIndex + 1);
                }
            } else if (c.compareTo(this.character) < 0) {
                return left == null ? null : left.search(key, charIndex);
            } else {
                return right == null ? null : right.search(key, charIndex);
            }
        }

        public Iterable<String> keys() {
            List<String> keys = Collections.synchronizedList(new ArrayList<>());
            this.keys("", keys);
            return keys;
        }

        public void keys(String currentPath, List<String> keys) {
            if (this.storesKey) {
                keys.add(currentPath + this.character);
            }
            // For left and right branches, we must not add this node's character to the path
            if (left != null) {
                left.keys(currentPath, keys);
            }
            if (right != null) {
                right.keys(currentPath, keys);
            }
            // For the middle child, instead, this node's character is part of the path forward
            if (middle != null) {
                middle.keys(currentPath + character, keys);
            }
        }

        public String min() {
            return this.min("");
        }

        private String min(String path) {
            // Search the left branch, if it exists it has lexicographically smaller words
            String result = left == null ? null : left.min(path);
            if (result != null) {
                return result;
            }
            // else, search the middle branch (including current node) and return the shortest key
            if (this.storesKey) {
                return path + character;
            } else {
                result = middle == null ? null : middle.min(path + character);
            }
            if (result != null) {
                return result;
            }
            // else search the right branch
            return right == null ? null : right.min(path);
        }

        public String max() {
            return this.max("");
        }

        private String max(String path) {
            // Search the right branch, if it exists it has lexicographically larger words
            String result = right == null ? null : right.max(path);
            if (result != null) {
                return result;
            }
            // else, search the middle branch (including current node) and return its max (and longest)
            result = middle == null ? null : middle.max(path + character);
            if (result != null) {
                return result;
            }
            if (this.storesKey) {
                return path + character;
            }
            // else search the left branch
            return left == null ? null : left.max(path);
        }

        public int size() {
            return (this.storesKey ? 1 : 0) +
                    (left != null ? left.size() : 0) +
                    (right != null ? right.size() : 0) +
                    (middle != null ? middle.size() : 0);
        }

        public int height() {
            if (isLeaf()) {
                return 0;
            } else {
                int subTreesHeight = Math.max(
                        Math.max((left != null ? left.height() : 0), (right != null ? right.height() : 0)),
                        (middle != null ? middle.height() : 0));

                return 1 + subTreesHeight;
            }
        }

        private boolean isLeaf() {
            return left == null && right == null && middle == null;
        }

    }
}
