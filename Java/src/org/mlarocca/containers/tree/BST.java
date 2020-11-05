package org.mlarocca.containers.tree;

import com.google.common.annotations.VisibleForTesting;

import java.util.Optional;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class BST<T extends Comparable<T>> implements SearchTree<T> {

    // A reference to the root of the internal representation of the tree.
    private Optional<BSTNode> root;

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

    // Random numbers generator
    private static final Random rnd = new Random();

    public BST() {
        root = Optional.empty();
        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        readLock = lock.readLock();
        writeLock = lock.writeLock();
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public boolean add(T element) {
        writeLock.lock();
        try {
            root = root.flatMap(r -> r.add(element))
                    .or(() -> Optional.of(new BSTNode(element)));
            // Always add entries, allowing duplicates
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public boolean remove(T element) {
        writeLock.lock();
        try {
            AtomicBoolean elementRemoved = new AtomicBoolean(false);
            root = root.flatMap(node -> node.remove(element, elementRemoved));
            return elementRemoved.get();
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public void clear() {
        Optional<BSTNode> oldRoot = Optional.empty();
        writeLock.lock();
        try {
            oldRoot = root;
            root = Optional.empty();
        } finally {
            writeLock.unlock();
            // Now we still want to clean up references in the tree to facilitate garbage collection
            // (although, since the pointer to the old root should NOT be stored anywhere by now, the GC should
            // be able to identify the dangling reference and recollect the whole tree).
            // Anyway, we can clear the old tree outside of the write lock, because it's not reachable anymore.
            oldRoot.ifPresent(BSTNode::cleanUp);
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public Optional<T> min() {
        readLock.lock();
        try {
            return root.map(BSTNode::min);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public Optional<T> max() {
        readLock.lock();
        try {
            return root.map(BSTNode::max);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public Optional<T> search(T element) {
        readLock.lock();
        try {
            return root.flatMap(r -> r.search(element)).map(BSTNode::getKey);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public boolean isEmpty() {
        readLock.lock();
        try {
            return root.isEmpty();
        } finally {
            readLock.unlock();
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public int size() {
        readLock.lock();
        try {
            return root.map(BSTNode::size).orElse(0);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * Thread safe.
     */
    @Override
    public int height() {
        readLock.lock();
        try {
            return root.map(BSTNode::height).orElse(0);
        } finally {
            readLock.unlock();
        }
    }

    @VisibleForTesting
    protected boolean checkBSTInvariants() {
        readLock.lock();
        try {
            return root.map(BSTNode::checkBSTInvariants).orElse(true);
        } finally {
            readLock.unlock();
        }
    }

    @VisibleForTesting
    private class BSTNode {
        private T key;

        private BSTNode left;
        private BSTNode right;

        public BSTNode(T key) {
            this.key = key;
            this.left = null;
            this.right = null;
        }

        public Optional<BSTNode> getLeft() {
            return Optional.ofNullable(left);
        }

        public Optional<BSTNode> getRight() {
            return Optional.ofNullable(right);
        }

        private void setLeft(BSTNode left) {
            this.left = left;
        }

        private void setRight(BSTNode right) {
            this.right = right;
        }

        public boolean isLeaf() {
            return getLeft().isEmpty() && getRight().isEmpty();
        }

        public T getKey() {
            return key;
        }

        public int size() {
            return 1 + getLeft().map(BSTNode::size).orElse(0) + getRight().map(BSTNode::size).orElse(0);
        }

        public int height() {
            return 1 + Math.max(getLeft().map(BSTNode::height).orElse(0), getRight().map(BSTNode::height).orElse(0));
        }

        public T min() {
            return getLeft().map(BSTNode::min).orElse(key);
        }

        public T max() {
            return getRight().map(BSTNode::max).orElse(key);
        }

        public Optional<BSTNode> search(T targetKey) {
            if (targetKey.equals(key)) {
                return Optional.of(this);
            }
            // else
            Optional<BSTNode> result = Optional.empty();

            if (targetKey.compareTo(key) <= 0) {
                result = getLeft().flatMap(lN -> lN.search(targetKey));
            }

            if (result.isEmpty() && targetKey.compareTo(key) > 0) {
                result = getRight().flatMap(rN -> rN.search(targetKey));
            }
            return result;
        }

        public Optional<BSTNode> add(T key) {
            // Check how the new key compares to this node's key
            if (key.compareTo(this.getKey()) <= 0) {
                // The new key is NOT larger than current, so in a search we would go left
                BSTNode left = this.getLeft()
                        .flatMap(node -> node.add(key))
                        // If the left child is empty, we can create a new node with the new key
                        .orElse(new BSTNode(key));
                this.setLeft(left);
            } else {
                // The new key is larger than current, so in a search we would go right
                BSTNode right = this.getRight()
                        .flatMap(node -> node.add(key))
                        // If the right child is empty, we can create a new node with the new key
                        .orElse(new BSTNode(key));
                this.setRight(right);
            }
            return Optional.of(this);
        }

        public Optional<BSTNode> remove(T targetKey, AtomicBoolean wasRemoved) {
            if (targetKey.equals(key)) {
                wasRemoved.set(true);
                if (this.isLeaf()) {
                    return Optional.empty();
                } else if (this.getRight().isEmpty() || (this.getLeft().isPresent() && rnd.nextBoolean())) {
                    // Checks if the right branch is present; if it's empty, or in 50% of the cases where both branches are present...
                    // The random component is used to prevent trees from getting skewed when several removal are performed.
                    this.getLeft().map(BSTNode::max).ifPresent(prevKey -> {
                        // We replace current node's key with the previous key in the tree (so to preserve total ordering)
                        this.key = prevKey;
                        // and then remove that key from the subtree where it was found.
                        this.setLeft(this.getLeft().flatMap(lN -> lN.remove(prevKey, wasRemoved)).orElse(null));
                    });
                } else {
                    this.getRight().map(BSTNode::min).ifPresent(nextKey -> {
                        // We replace current node's key with the next key in the tree (so to preserve total ordering)
                        this.key = nextKey;
                        // and then remove that key from the subtree where it was found.
                        this.setRight(this.getRight().flatMap(rN -> rN.remove(nextKey, wasRemoved)).orElse(null));
                    });
                }
                return Optional.of(this);
            }
            // else
            if (targetKey.compareTo(key) <= 0) {
                this.setLeft(getLeft().flatMap(lN -> lN.remove(targetKey, wasRemoved)).orElse(null));
            } else {
                this.setRight(this.getRight().flatMap(rN -> rN.remove(targetKey, wasRemoved)).orElse(null));
            }
            return Optional.of(this);
        }

        /**
         * Cleans up tree's references to facilitate garbage collection.
         */
        private void cleanUp() {
            this.getLeft().ifPresent(BSTNode::cleanUp);
            this.setLeft(null);
            this.getRight().ifPresent(BSTNode::cleanUp);
            this.setRight(null);
        }

        private boolean checkBSTInvariants() {
            if (getLeft().map(n -> n.getKey().compareTo(key) > 0).orElse(false)
                    || getRight().map(n -> n.getKey().compareTo(key) <= 0).orElse(false)) {
                return false;
            }
            return getLeft().map(BSTNode::checkBSTInvariants).orElse(true)
                    && getRight().map(BSTNode::checkBSTInvariants).orElse(true);
        }
    }
}
