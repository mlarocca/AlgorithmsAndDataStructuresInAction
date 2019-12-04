package org.mlarocca.containers.treap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.PriorityQueue;
import org.mlarocca.containers.tree.ReadOnlyBST;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Treap<T extends Comparable<T>, S extends Comparable<S>> implements ReadOnlyBST<T>, PriorityQueue<Treap.Entry<T, S>> {

    private Optional<TreapNode> root;

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

    public Treap() {
        root = Optional.empty();
        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        readLock = lock.readLock();
        writeLock = lock.writeLock();
    }

    @Override
    public int size() {
        readLock.lock();
        try {
            return root.map(TreapNode::size).orElse(0);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean isEmpty() {
        readLock.lock();
        try {
            return root.isEmpty();
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<T> min() {
        readLock.lock();
        try {
            return root.map(TreapNode::min);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<T> max() {
        readLock.lock();
        try {
            return root.map(TreapNode::max);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<T> search(T element) {
        readLock.lock();
        try {
            return root.flatMap(r -> r.search(Optional.of(element), Optional.empty())).map(TreapNode::getKey);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<Entry<T, S>> top() {
        writeLock.lock();
        try {
            Optional<Entry<T, S>> result = root.map(r -> new TreapEntry(r.getKey(), r.getPriority()));
            root = root.flatMap(TreapNode::pushDownToLeafAndDisconnect);
            return result;
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Optional<Entry<T, S>> peek() {
        readLock.lock();
        try {
            return root.map(node -> new TreapEntry<>(node.getKey(), node.getPriority()));
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean contains(Entry<T, S> entry) {
        readLock.lock();
        try {
            return root.flatMap(r -> r.search(Optional.of(entry.getKey()), Optional.of(entry.getPriority()))).isPresent();
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public void clear() {
        Optional<TreapNode> oldRoot = Optional.empty();
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
            oldRoot.ifPresent(TreapNode::cleanUp);
        }
    }

    @Override
    public boolean add(Entry<T, S> entry) {
        writeLock.lock();
        try {
            root = root.flatMap(r -> r.insert(entry.getKey(), entry.getPriority()))
                    .or(() -> Optional.of(new TreapNode(entry)));
            // Always add elements, allowing duplicates
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public boolean updatePriority(Entry<T, S> oldElement, Entry<T, S> newElement) {
        if (!oldElement.getKey().equals(newElement.getKey())) {
            throw new IllegalArgumentException("The two elements' keys must match!");
        }
        if (oldElement.getPriority().equals(newElement.getPriority())) {
            // Wouldn't actually change anything
            return false;
        }
        writeLock.lock();
        try {
            // Search the old element
            Optional<TreapNode> maybeTarget = root.flatMap(r ->
                    r.search(Optional.of(oldElement.getKey()), Optional.of(oldElement.getPriority())));
            // On successful search, updated its priority
            Optional<TreapNode> node =  maybeTarget.flatMap(n -> n.updatePriority(newElement.getPriority()));
            // Now check if we need to update the root: only if the node returned is a new root
            if (node.map(TreapNode::isRoot).orElse(false)) {
                root = node;
            }
            // Return true iff the target node to update was found in the first place
            return maybeTarget.isPresent();
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public boolean remove(Entry<T, S> entry) {
        writeLock.lock();
        try {
            AtomicBoolean entryRemoved = new AtomicBoolean(false);
            root = root.flatMap(node -> node.remove(entry.getKey(), entry.getPriority(), entryRemoved));
            return entryRemoved.get();
        } finally {
            writeLock.unlock();
        }
    }


    /**
     * Compares two elements stored in the heap and checks if the first one has higher priority than the second one.
     *
     * @param first  The element whose priority is checked.
     * @param second The second element, the one with respect to which the comparison is done.
     * @return true iff the first argument has higher priority than the second, in this heap.
     */
    protected boolean hasHigherPriority(S first, S second) {
        return first.compareTo(second) < 0;
    }

    @VisibleForTesting
    protected boolean checkTreapInvariants() {
        readLock.lock();
        try {
            return root.map(TreapNode::checkTreapInvariants).orElse(true);
        } finally {
            readLock.unlock();
        }
    }

    @VisibleForTesting
    protected boolean checkBSTInvariants() {
        readLock.lock();
        try {
            return root.map(TreapNode::checkTreapInvariants).orElse(true);
        } finally {
            readLock.unlock();
        }
    }
    @VisibleForTesting
    private class TreapNode {
        private T key;
        private S priority;

        private Optional<TreapNode> left;
        private Optional<TreapNode> right;
        private Optional<TreapNode> parent;

        public TreapNode(T key, S priority) {
            this.key = key;
            this.priority = priority;
            this.left = Optional.empty();
            this.right = Optional.empty();
            this.parent = Optional.empty();
        }

        private TreapNode(Entry<T, S> entry) {
            this(entry.getKey(), entry.getPriority());
        }

        public Optional<TreapNode> getLeft() {
            return left;
        }

        public Optional<TreapNode> getRight() {
            return right;
        }

        private void setLeft(Optional<TreapNode> left) {
            this.left = left;
            left.ifPresent(n -> n.parent = Optional.of(this));
        }

        private void setRight(Optional<TreapNode> right) {
            this.right = right;
            right.ifPresent(n -> n.parent = Optional.of(this));
        }

        public Optional<TreapNode> getParent() {
            return parent;
        }

        public boolean isLeaf() {
            return left.isEmpty() && right.isEmpty();
        }

        public boolean isRoot() {
            return parent.isEmpty();
        }

        private boolean isLeftChild() {
            return getParent().flatMap(p -> p.getLeft().map(node -> node.equals(this))).orElse(false);
        }

        private boolean isRightChild() {
            return getParent().flatMap(p -> p.getRight().map(node -> node.equals(this))).orElse(false);
        }

        public T getKey() {
            return key;
        }

        public S getPriority() {
            return priority;
        }

        public Optional<TreapNode> search(Optional<T> targetKey, Optional<S> targetPriority) {
            if (targetKey.map(tK -> tK.equals(key)).orElse(true) &&
                    targetPriority.map(tP -> tP.equals(priority)).orElse(true)) {
                return Optional.of(this);
            }
            // else
            Optional<TreapNode> result = Optional.empty();

            if (targetKey.map(tK -> tK.compareTo(key) <= 0).orElse(true)) {
                result = getLeft().flatMap(lN -> lN.search(targetKey, targetPriority));
            }

            if (result.isEmpty() && targetKey.map(tK -> tK.compareTo(key) > 0).orElse(true)) {
                result = getRight().flatMap(rN -> rN.search(targetKey, targetPriority));
            }
            return result;
        }

        public int size() {
            return 1 + getLeft().map(TreapNode::size).orElse(0) + getRight().map(TreapNode::size).orElse(0);
        }

        public T min() {
            return getLeft().map(TreapNode::min).orElse(key);
        }

        public T max() {
            return getRight().map(TreapNode::max).orElse(key);
        }

        public Optional<TreapNode> insert(T key, S priority) {
            if (key.compareTo(this.getKey()) <= 0) {
                Optional<TreapNode> left = this.getLeft().flatMap(node -> node.insert(key, priority))
                        .or(() -> Optional.of(new TreapNode(key, priority)));
                this.setLeft(left);
                if (hasHigherPriority(priority, this.getPriority())) {
                    return this.getLeft().map(TreapNode::rightRotate);
                }
            } else {
                Optional<TreapNode> right = this.getRight().flatMap(node -> node.insert(key, priority))
                        .or(() -> Optional.of(new TreapNode(key, priority)));
                this.setRight(right);
                if (hasHigherPriority(priority, this.getPriority())) {
                    return this.getRight().map(TreapNode::leftRotate);
                }
            }
            return Optional.of(this);
        }

        public Optional<TreapNode> remove(T targetKey, S targetPriority, AtomicBoolean wasRemoved) {
            if (targetKey.equals(key) && targetPriority.equals(priority)) {
                wasRemoved.set(true);
                return this.pushDownToLeafAndDisconnect();
            }
            // else
            if (targetKey.compareTo(key) <= 0) {
                this.setLeft(getLeft().flatMap(lN -> lN.remove(targetKey, targetPriority, wasRemoved)));
            } else {
                this.setRight(this.getRight().flatMap(rN -> rN.remove(targetKey, targetPriority, wasRemoved)));
            }
            return Optional.of(this);
        }

        /**
         * Pushes down current node till it reaches a leaf, and then disconnects it from the tree.
         *
         * @return
         */
        public Optional<TreapNode> pushDownToLeafAndDisconnect() {
            if (this.isLeaf()) {
                return Optional.empty();
            }
            // Check if any of the two children is empty, or which one has the highest priority, in order to replace
            // current node and push it down to a leaf.
            if (this.getRight().isEmpty() || this.getRight().flatMap(r ->
                    this.getLeft().map(l -> hasHigherPriority(l.getPriority(), r.getPriority()))).orElse(false)) {
                // Left child certainly exists, and has higher priority than right's
                Optional<TreapNode> newSubRoot = this.getLeft();
                newSubRoot.map(TreapNode::rightRotate);
                // Now this node is the right child of newSubRoot, but we still have to remove it
                newSubRoot.ifPresent(np -> np.setRight(this.pushDownToLeafAndDisconnect()));
                // We can return newSubRoot as the node that will replace current node, since we are deleting this.
                return newSubRoot;
            } else {
                // Right child certainly exists, and has higher priority than left's
                Optional<TreapNode> newSubRoot = this.getRight();
                newSubRoot.map(TreapNode::leftRotate);
                // Now this node is the left child of newSubRoot, but we still have to remove it
                newSubRoot.ifPresent(np -> np.setLeft(this.pushDownToLeafAndDisconnect()));
                // We can return newSubRoot as the node that will replace current node, since we are deleting this.
                return newSubRoot;
            }
        }

        public Optional<TreapNode> updatePriority(S newPriority) {
            // Update priority
            S oldPriority = getPriority();
            this.priority = newPriority;

            // Now we need to check invariants: if new priority is higher, we need to check current node's parent,
            // otherwise its children.
            if (hasHigherPriority(newPriority, oldPriority)) {
                return this.bubbleUp();
            } else {
                // Store a reference to current's node parent
                Optional<TreapNode> parent = getParent();
                boolean leftChild = this.isLeftChild();

                Optional<TreapNode> newSubRoot = this.pushDown();

                parent.ifPresent(p -> {
                    if (leftChild) {
                        p.setLeft(newSubRoot);
                    } else {
                        p.setRight(newSubRoot);
                    }
                });
                return newSubRoot;
            }
        }

        /**
         * Pushes down current node till heap's invariants are not violated anymore.
         *
         * @return the new root of the subtree that is pushed down. No node in levels above current node will be
         *         changed by this call (except for, at most, the reference to child pointing to this node, which can be updated).
         */
        private Optional<TreapNode> pushDown() {
            if (this.isLeaf()) {
                return Optional.of(this);
            }
            Optional<TreapNode> highestPriorityChild = this.getLeft();
            // Check which child has the highest priority (at least one must be non-empty).
            if (this.getLeft().isEmpty() || this.getLeft().flatMap(lN ->
                    this.getRight().map(rN -> hasHigherPriority(rN.getPriority(), lN.getPriority()))).orElse(false)) {
                highestPriorityChild = getRight();
            }

            // Check if the highest-priority child has higher priority than current node
            if (highestPriorityChild.map(c -> hasHigherPriority(getPriority(), c.getPriority())).orElse(false)) {
                return Optional.of(this);
            }

            // else: the highest priority child must be rotated, next step depends on its position
            if (highestPriorityChild.map(TreapNode::isLeftChild).orElse(false)) {
                // Left child certainly exists, and has higher priority than right's
                Optional<TreapNode> newSubRoot = this.getLeft();
                newSubRoot.map(TreapNode::rightRotate);
                // Now this node is the right child of newSubRoot, but we still have to remove it
                newSubRoot.ifPresent(np -> np.setRight(this.pushDown()));
                // We can return newSubRoot as the node that will replace current node, since we are deleting this.
                return newSubRoot;
            } else {
                // Right child certainly exists, and has higher priority than left's
                Optional<TreapNode> newSubRoot = this.getRight();
                newSubRoot.map(TreapNode::leftRotate);
                // Now this node is the left child of newSubRoot, but we still have to remove it
                newSubRoot.ifPresent(np -> np.setLeft(this.pushDown()));
                // We can return newSubRoot as the node that will replace current node, since we are deleting this.
                return newSubRoot;
            }
        }

        /**
         * Bubbles up current node till heap's invariants are not violated anymore.
         *
         * @return the root of the subtree that is affected by this call. No node below the level of current node will
         *         be updated by this call, except at most for the parent's reference in this node's children.
         */
        private Optional<TreapNode> bubbleUp() {
            // Check if the there is a parent, and if it has a priority higher than current node's
            if (getParent().map(p -> hasHigherPriority(p.getPriority(), getPriority())).orElse(true)) {
                return Optional.of(this);
            } // else: this node must be rotated, next step depends on its position

            if (this.isLeftChild()) {
                // Left child certainly exists, and has higher priority than right's
                this.rightRotate();
            } else {
                this.leftRotate();
            }
            return this.bubbleUp();
        }

        /**
         * y                             x
         * / \      RightRotate(x)      /  \
         * x   T3    – – – – – – – >    T1   y
         * / \        < - - - - - - -        / \
         * T1  T2      LeftRotate(y)         T2  T3
         *
         * @return
         */
        private TreapNode leftRotate() {
            if (this.isRoot()) {
                throw new IllegalStateException("Left rotate called on root");
            }
            Optional<TreapNode> parent = this.getParent();
            this.parent = parent.flatMap(TreapNode::getParent);
            parent.ifPresent(p -> p.setRight(this.getLeft()));
            this.setLeft(parent);
            return this;
        }

        /**
         * y                             x
         * / \      RightRotate(x)      /  \
         * x   T3    – – – – – – – >    T1   y
         * / \        < - - - - - - -        / \
         * T1  T2      LeftRotate(y)         T2  T3
         *
         * @return
         */
        private TreapNode rightRotate() {
            if (this.isRoot()) {
                throw new IllegalStateException("Right rotate called on root");
            }
            Optional<TreapNode> parent = this.getParent();
            this.parent = parent.flatMap(TreapNode::getParent);
            parent.ifPresent(p -> p.setLeft(this.getRight()));
            this.setRight(parent);
            return this;
        }

        /**
         * Cleans up tree's references to facilitate garbage collection.
         */
        private void cleanUp() {
            this.getLeft().ifPresent(TreapNode::cleanUp);
            this.setLeft(Optional.empty());
            this.getRight().ifPresent(TreapNode::cleanUp);
            this.setRight(Optional.empty());
            this.parent = Optional.empty();
        }

        private boolean checkTreapInvariants() {
            if (getLeft().map(n -> hasHigherPriority(n.getPriority(), priority) || n.getKey().compareTo(key) > 0)
                    .orElse(false)
                    || getRight().map(n -> hasHigherPriority(n.getPriority(), priority) || n.getKey().compareTo(key) <= 0)
                    .orElse(false)) {
                return false;
            }
            return getLeft().map(TreapNode::checkTreapInvariants).orElse(true)
                    && getRight().map(TreapNode::checkTreapInvariants).orElse(true);
        }
    }

    public interface Entry<K, P extends Comparable<P>> extends Comparable<Entry<K, P>> {
        K getKey();

        P getPriority();
    }

    public static class TreapEntry<K, P extends Comparable<P>> implements Treap.Entry<K, P> {
        private K key;
        private P priority;

        public TreapEntry(K key, P priority) {
            this.key = key;
            this.priority = priority;
        }

        public K getKey() {
            return key;
        }

        public P getPriority() {
            return priority;
        }

        @Override
        public int compareTo(Entry<K, P> o) {
            if (o == null) {
                return -1;
            }
            return this.priority.compareTo(o.getPriority());
        }
    }
}
