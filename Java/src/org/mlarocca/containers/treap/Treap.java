package org.mlarocca.containers.treap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.PriorityQueue;
import org.mlarocca.containers.tree.ReadOnlyBST;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Treap<T extends Comparable<T>, S extends Comparable<S>> implements ReadOnlyBST<T>, PriorityQueue<Treap.Entry<T, S>> {

    private Optional<TreapNode> root = Optional.empty();

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

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
            root = root.flatMap(TreapNode::pushDownAndDisconnect);
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
            oldRoot.ifPresent(TreapNode::clear);
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

        } finally {
            writeLock.unlock();
        }
        return false;
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
    protected boolean checkHeapInvariants() {
        //        readLock.lock();
        try {
            return root.map(TreapNode::checkHeapInvariants).orElse(true);

        } finally {
//            readLock.unlock();
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
                return this.pushDownAndDisconnect();
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
        public Optional<TreapNode> pushDownAndDisconnect() {
            if (this.isLeaf()) {
                return Optional.empty();
            }
            // Check if any of the two children is empty, or which one has the highest priority, in order to replace
            // current node and push it down to a leaf.
            if (this.getRight().isEmpty() || this.getRight().flatMap(r ->
                    this.getLeft().map(l -> hasHigherPriority(l.getPriority(), r.getPriority()))).orElse(false)) {
                // Left child certainly exists, and has higher priority than right's
                Optional<TreapNode> newParent = this.getLeft();
                newParent.map(TreapNode::rightRotate);
                // Now this node is the right child of newParent, but we still have to remove it
                newParent.ifPresent(np -> np.setRight(this.pushDownAndDisconnect()));
                // We can return newParent as the node that will replace current node, since we are deleting this.
                return newParent;
            } else {
                // Right child certainly exists, and has higher priority than left's
                Optional<TreapNode> newParent = this.getRight();
                newParent.map(TreapNode::leftRotate);
                // Now this node is the left child of newParent, but we still have to remove it
                newParent.ifPresent(np -> np.setLeft(this.pushDownAndDisconnect()));
                // We can return newParent as the node that will replace current node, since we are deleting this.
                return newParent;
            }
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
        private void clear() {
            this.getLeft().ifPresent(TreapNode::clear);
            this.setLeft(Optional.empty());
            this.getRight().ifPresent(TreapNode::clear);
            this.setRight(Optional.empty());
            this.parent = Optional.empty();
        }

        private boolean checkHeapInvariants() {
            if (getLeft().map(n -> hasHigherPriority(n.getPriority(), priority)).orElse(false)
                    || getRight().map(n -> hasHigherPriority(n.getPriority(), priority)).orElse(false)) {
                return false;
            }
            return getLeft().map(TreapNode::checkHeapInvariants).orElse(true)
                    && getRight().map(TreapNode::checkHeapInvariants).orElse(true);
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
