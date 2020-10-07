package org.mlarocca.containers.strings.tst;

import org.mlarocca.containers.strings.StringsTree;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

public class Tst implements StringsTree {

    private Optional<TstNode> root;

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

    public Tst() {
        root = Optional.empty();

        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        readLock = lock.readLock();
        writeLock = lock.writeLock();
    }

    @Override
    public boolean add(String element) {
        if (element.isEmpty()) {
            throw new IllegalArgumentException("Keys must be non-empty");
        }
        writeLock.lock();
        try {
            if (root.isEmpty()) {
                root = Optional.of(new TstNode(element));
                return true;
            } else {
                return root.flatMap(r -> r.add(element)).isPresent();
            }
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public boolean remove(String element) {
        writeLock.lock();
        try {
            return root.map(r -> r.remove(element)).orElse(false);
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public void clear() {
        writeLock.lock();
        try {
            // Let the garbage collector do all the hard work
            root = Optional.empty();
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Optional<String> search(String element) {
        readLock.lock();
        try {
            // If root or search's result are empty, evaluates to Optional.empty; otherwise returns the input
            return root.flatMap(r -> r.search(element)).map(n -> element);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<String> longestPrefixOf(String prefix) {
        readLock.lock();
        try {
            return root.flatMap(node -> node.longestPrefixOf(prefix));
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Iterable<String> keysWithPrefix(String prefix) {
        if (prefix.isEmpty()) {
            return this.keys();
        }
        readLock.lock();
        try {
            return root.map(node -> node.keysWithPrefix(prefix)).orElse(new ArrayList<>());
        } finally {
            readLock.unlock();
        }

    }

    @Override
    public Iterable<String> keys() {
        readLock.lock();
        try {
            return root.map(TstNode::keys).orElse(new ArrayList<>());
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<String> min() {
        readLock.lock();
        try {
            return root.flatMap(TstNode::min);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<String> max() {
        readLock.lock();
        try {
            return root.flatMap(TstNode::max);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean isEmpty() {
        readLock.lock();
        try {
            return this.size() == 0;
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public int size() {
        readLock.lock();
        try {
            return root.map(TstNode::size).orElse(0);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public int height() {
        readLock.lock();
        try {
            return root.map(TstNode::height).orElse(0);
        } finally {
            readLock.unlock();
        }
    }

    private class TstNode {

        private Character character;
        private boolean storesKey;

        private Optional<TstNode> left;
        private Optional<TstNode> middle;
        private Optional<TstNode> right;

        public TstNode(String key) {
            this(key, 0);
        }

        public TstNode(String key, int charIndex) {
            if (charIndex >= key.length()) {
                throw new IndexOutOfBoundsException();
            }
            character = key.charAt(charIndex);
            left = right = Optional.empty();
            if (charIndex + 1 < key.length()) {
                // Stores the rest of the key in a midlle-link chain
                storesKey = false;
                middle = Optional.of(new TstNode(key, charIndex + 1));
            } else {
                middle = Optional.empty();
                storesKey = true;
            }
        }

        public Optional<TstNode> add(String key) {
            return this.add(key, 0);
        }

        private Optional<TstNode> add(String key, int charIndex) {
            if (charIndex < key.length()) {
                Character c = key.charAt(charIndex);
                if (character.equals(c)) {
                    if (charIndex == key.length() - 1) {
                        if (storesKey) {
                            return Optional.empty();
                        } else {
                            storesKey = true;
                            return Optional.of(this);
                        }
                    } else if (this.middle.isPresent()) {
                        return middle.flatMap(node -> node.add(key, charIndex + 1));
                    } else {
                        this.middle = Optional.of(new TstNode(key, charIndex + 1));
                        return middle;
                    }
                } else if (c.compareTo(character) < 0) {
                    if (this.left.isPresent()) {
                        return left.flatMap(node -> node.add(key, charIndex));
                    } else {
                        left = Optional.of(new TstNode(key, charIndex));
                        return left;
                    }
                } else {
                    if (this.right.isPresent()) {
                        return right.flatMap(node -> node.add(key, charIndex));
                    } else {
                        right = Optional.of(new TstNode(key, charIndex));
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
                    boolean deleted = this.middle.map(node -> node.remove(key, charIndex + 1, purge))
                            .orElse(false);
                    if (deleted && purge.get()) {
                        this.middle = Optional.empty();
                        purge.set(!this.storesKey && this.isLeaf());
                    }
                    return deleted;
                }
            } else if (c.compareTo(this.character) < 0) {
                boolean deleted = left.map(node -> node.remove(key, charIndex, purge)).orElse(false);
                if (deleted && purge.get()) {
                    this.left = Optional.empty();
                    purge.set(!this.storesKey && this.isLeaf());
                }
                return deleted;
            } else {
                boolean deleted = right.map(node -> node.remove(key, charIndex, purge)).orElse(false);
                if (deleted && purge.get()) {
                    this.right = Optional.empty();
                    purge.set(!this.storesKey && this.isLeaf());
                }
                return deleted;
            }
        }

        public Optional<TstNode> search(String key) {
            Optional<TstNode> node = getNodeFor(key, 0);
            return node.filter(n -> n.storesKey);
        }

        private Optional<TstNode> getNodeFor(String key, int charIndex) {
            if (charIndex >= key.length()) {
                return Optional.empty();
            }
            Character c = key.charAt(charIndex);
            if (c.equals(this.character)) {
                if (charIndex == key.length() - 1) {
                    return Optional.of(this);
                } else {
                    return middle.flatMap(node -> node.getNodeFor(key, charIndex + 1));
                }
            } else if (c.compareTo(this.character) < 0) {
                return left.flatMap(node -> node.getNodeFor(key, charIndex));
            } else {
                return right.flatMap(node -> node.getNodeFor(key, charIndex));
            }
        }

        public List<String> keys() {
            List<String> keys = Collections.synchronizedList(new ArrayList<>());
            this.keys("", keys);
            return keys;
        }

        public void keys(String currentPath, List<String> keys) {
            if (this.storesKey) {
                keys.add(currentPath + this.character);
            }
            // For left and right branches, we must not add this node's character to the path
            left.ifPresent(node -> node.keys(currentPath, keys));
            right.ifPresent(node -> node.keys(currentPath, keys));
            // For the middle child, instead, this node's character is part of the path forward
            middle.ifPresent(node -> node.keys(currentPath + character, keys));
        }

        public Iterable<String> keysWithPrefix(String prefix) {
            // Invariant: prefix is not empty
            Optional<TstNode> node = this.getNodeFor(prefix, 0);

            return node.map(TstNode::keys)
                    // All keys in node.keys already include the last character in prefix
                    .map(iter -> iter.stream().map(s -> prefix.substring(0, prefix.length() - 1) + s))
                    .map(stream -> stream.collect(Collectors.toList())).orElse(new ArrayList<>());
        }

        public Optional<String> longestPrefixOf(String key) {
            return this.longestPrefixOf(key, 0);
        }

        public Optional<String> longestPrefixOf(String key, int charIndex) {
            if (charIndex >= key.length()) {
                return Optional.empty();
            }
            Optional<String> result = Optional.empty();
            Character c = key.charAt(charIndex);
            if (c.equals(this.character)) {
                if (charIndex == key.length() - 1) {
                    return storesKey ? Optional.of(key) : Optional.empty();
                } else {
                    result = middle.flatMap(node -> node.longestPrefixOf(key, charIndex + 1))
                            .or(() -> this.storesKey ? Optional.of(key.substring(0, charIndex + 1)) : Optional.empty());
                }
            } else if (c.compareTo(this.character) < 0) {
                result = left.flatMap(node -> node.longestPrefixOf(key, charIndex));
            } else {
                result = right.flatMap(node -> node.longestPrefixOf(key, charIndex));
            }
            return result;
        }


        public Optional<String> min() {
            return this.min("");
        }

        private Optional<String> min(String path) {
            // Search the left branch, if it exists it has lexicographically smaller words
            Optional<String> result = left.flatMap(node -> node.min(path));
            if (result.isPresent()) {
                return result;
            }
            // else, search the middle branch (including current node) and return the shortest key
            if (this.storesKey) {
                return Optional.of(path + character);
            } else {
                result = middle.flatMap(node -> node.min(path + character));
            }
            if (result.isPresent()) {
                return result;
            }
            // else search the right branch
            return right.flatMap(node -> node.min(path));
        }

        public Optional<String> max() {
            return this.max("");
        }

        private Optional<String> max(String path) {
            // Search the right branch, if it exists it has lexicographically larger words
            Optional<String> result = right.flatMap(node -> node.max(path));
            if (result.isPresent()) {
                return result;
            }
            // else, search the middle branch (including current node) and return its max (and longest)
            result = middle.flatMap(node -> node.max(path + character));
            if (result.isPresent()) {
                return result;
            }
            if (this.storesKey) {
                return Optional.of(path + character);
            }
            // else search the left branch
            return left.flatMap(node -> node.max(path));
        }

        public int size() {
            return (this.storesKey ? 1 : 0) +
                    left.map(TstNode::size).orElse(0) +
                    middle.map(TstNode::size).orElse(0) +
                    right.map(TstNode::size).orElse(0);
        }

        public int height() {
            if (isLeaf()) {
                return 0;
            } else {
                int subTreesHeight = Math.max(
                        Math.max(left.map(TstNode::height).orElse(0), right.map(TstNode::height).orElse(0)),
                        middle.map(TstNode::height).orElse(0));

                return 1 + subTreesHeight;
            }
        }

        private boolean isLeaf() {
            return left.isEmpty() && right.isEmpty() && middle.isEmpty();
        }

    }
}
