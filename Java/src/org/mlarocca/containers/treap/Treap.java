package org.mlarocca.containers.treap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.PriorityQueue;
import org.mlarocca.containers.tree.ReadOnlySearchTree;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * A Treap is a container that stores key-priority pairs in a tree, abiding by invariants of both binary search trees and binary heaps.
 * 1) Each node has at most two children;
 * 2) All keys in the left subtree of a node N are not-larger than N.key;
 * 3) All keys in the right subtree of a node N are larger than N.key;
 * 4) Given a node N, N.priority is the largest priority among all nodes in the subtree rooted at N.
 *
 * With respect to a heap, an invariant is relaxed: a treap is, generally, not a complete balanced tree (because it might not be
 * compatible with the constraints on its keys).
 *
 * Performance:
 * - Insert, search, remove, update all take time proportional to the height of the tree (O(n) in the worst case, O(log n)
 *   for a balanced tree)
 * - size, height are not cached in this implementation, so they take linear time, O(n);
 * - min, max return the minimum and maximum key in the container, and as such require time proportional to the height of the tree.
 *
 * Design:
 *   This class was designed to implement both BST's and Heap's interfaces. It was not, obviously, the only way, neither the
 *   most efficient, but this choice was made so that a Treap can be passed in place of both binary search trees and
 *   priority queues.
 *   As always we need to compromise and balance our requirements, so in many applications, whenever we know that we are
 *   going to use randomized treaps only and we don't need methods like `top`, we can and should avoid the complexity of
 *   multiple inheritance.
 *
 *   Inheriting from 2 different interfaces has consequences and raises issues, so that the result is not the cleanest possible.
 *   First, a Treap's entries are pairs of possibly different types (as long as both are comparable); if these types are
 *   T and S, we need Treap<T,S> to abide by the interfaces BST<T> and PriorityQueue<Pair<T,S>: for the BST part, we are only
 *   interested in operations on keys (there is no notion of priority), but for the heap's part, we need to take into account
 *   both priorities and keys.
 *   If we tried to inherit all methods from both classes, we would have issues because we would allow inserting keys
 *   without priorities etc...
 *   So, the first thing we had to do was splitting the interface for BSTs into two, one for read-only operations, that
 *   Treap implements, and another interface, extending the read-only one, that includes methods `insert`, `remove` etc...
 *
 *   The next issue comes with methods with the same name: since these containers are generic, we will hit issues with
 *   erasure if both interface have methods with the same (generic) signature:
 *   https://stackoverflow.com/questions/1998544/method-has-the-same-erasure-as-another-method-in-type
 *
 *   To work around this issue, we had to find an alternative name for method `contains` in at least one of the two interfaces:
 *   in the end, the BST's version is called `search`.
 *
 *   In conclusion, this is one possible implementation for Treaps, as generic as possible, because it's meant for
 *   didactic purposes.
 *   Keep in mind that neither its implementation nor its design are optimized for the best performance, or the cleanest
 *   possible: depending on your requirements, simpler, more efficient versions can be written by simplifying the inheritance
 *   hierarchy and possibly dropping the use of Optional, lambdas and Stream.
 *
 * @param <T> The type of the keys added to the container. Must implement the Comparable interface.
 * @param <S> The type used for the priority associated to keys. Must implement the Comparable interface.
 */
public class Treap<T extends Comparable<T>, S extends Comparable<S>> implements ReadOnlySearchTree<T>, PriorityQueue<Treap.Entry<T, S>> {

    // A reference to the root of the internal representation of the tree.
    private Optional<TreapNode> root;

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

    /**
     * Construct an empty treap.
     */
    public Treap() {
        root = Optional.empty();
        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        readLock = lock.readLock();
        writeLock = lock.writeLock();
    }

    /**
     * Computes the size of the treap.
     * Performance warning: this value is not cached, so this requires a scan of the full tree.
     *
     * Thread safe.
     *
     * @return The number of entries in the container.
     */
    @Override
    public int size() {
        readLock.lock();
        try {
            return root.map(TreapNode::size).orElse(0);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Computes the height of the treap.
     * Performance warning: this value is not cached, so this method requires a scan of the full tree.
     *
     * Thread safe.
     *
     * @return The height of the tree.
     */
    @Override
    public int height() {
        readLock.lock();
        try {
            return root.map(TreapNode::height).orElse(0);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Check if the treap is empty (i.e. if it currently contains no entries).
     *
     * Thread safe.
     *
     * @returnv true if and only if there is no entry in the container.
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
     * Returns the (value of the) minimum key contained in the treap.
     *
     * Thread safe.
     *
     * @return The minimum key.
     */
    @Override
    public Optional<T> min() {
        readLock.lock();
        try {
            return root.map(TreapNode::min);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Returns the (value of the) maximum key contained in the treap.
     *
     * Thread safe.
     *
     * @return The maximum key.
     */
    @Override
    public Optional<T> max() {
        readLock.lock();
        try {
            return root.map(TreapNode::max);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Searches a key in the container.
     *
     * @param key Return a reference to the object, wrapped in an optional: if the key is not found, empty will be returned.
     *
     * Thread safe.
     *
     * @return An Optional wrapping the result of the search.
     */
    @Override
    public Optional<T> search(T key) {
        readLock.lock();
        try {
            return root.flatMap(r -> r.search(Optional.of(key), Optional.empty())).map(TreapNode::getKey);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Extracts and returns the top entry of the treap (if it's not empty), and then reinstante the
     * heap properties.
     *
     * Thread safe.
     *
     * @return If no entry is present, returns an empty Optional. Otherwise wraps the highest
     *          priority entry (consisting in a key and its priority) in an Optional container.
     */
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

    /**
     * Returns the top entry of the treap (if it's not empty), without any side effect.
     *
     * Thread safe.
     *
     * @return If no entry is present, returns an empty Optional. Otherwise wraps the highest
     *          priority entry (consisting in a key and its priority) in an Optional container.
     */
    @Override
    public Optional<Entry<T, S>> peek() {
        readLock.lock();
        try {
            return root.map(node -> new TreapEntry<>(node.getKey(), node.getPriority()));
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Check if an entry is stored in the treap.
     *
     * @param entry The entry of interest: both key and priority must match.
     *
     * Thread safe.
     *
     * @return true if and only if an entry of the container matches the one searched.
     */
    @Override
    public boolean contains(Entry<T, S> entry) {
        readLock.lock();
        try {
            return root.flatMap(r -> r.search(Optional.of(entry.getKey()), Optional.of(entry.getPriority()))).isPresent();
        } finally {
            readLock.unlock();
        }
    }


    /**
     * Add a new entry to the treap. Duplicates are allowed for keys and even for the whole <key, priority> pair.
     *
     * @param entry The <key, priority> entry to add to the container.
     *
     * Thread safe.
     *
     * @return true iff the entry has been successfully added, false otherwise.
     */
    @Override
    public boolean add(Entry<T, S> entry) {
        writeLock.lock();
        try {
            root = root.flatMap(r -> r.add(entry.getKey(), entry.getPriority()))
                    .or(() -> Optional.of(new TreapNode(entry)));
            // Always add entries, allowing duplicates
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public boolean updatePriority(Entry<T, S> oldEntry, Entry<T, S> newEntry) {
        if (!oldEntry.getKey().equals(newEntry.getKey())) {
            throw new IllegalArgumentException("The two keys' keys must match!");
        }
        if (oldEntry.getPriority().equals(newEntry.getPriority())) {
            // Wouldn't actually change anything
            return false;
        }
        writeLock.lock();
        try {
            // Search the old entry
            Optional<TreapNode> maybeTarget = root.flatMap(r ->
                    r.search(Optional.of(oldEntry.getKey()), Optional.of(oldEntry.getPriority())));
            // On successful search, updated its priority
            Optional<TreapNode> node =  maybeTarget.flatMap(n -> n.updatePriority(newEntry.getPriority()));
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

    /**
     * Removes a generic entry from the heap.
     *
     * @param entry The entry to be removed. Both key and priority must match in order for an entry to be removed from the treap.
     *
     * Thread safe.
     *
     * @return true iff the entry was stored in the heap and then correctly removed.
     */
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
     * Removes a generic key from the heap.
     *
     * @param key The key to be removed. Only the key must match in order for an entry to be removed from the treap.
     *            If a key appears multiple times in the treap (possibly with different priorities), then any of
     *            the duplicates can be removed: there is no way to tell which of the duplicate entries will be removed
     *            from the client side; internally, the entry removed will be the one closest to the root,
     *            the first of the duplicates found during a traversal of the tree.
     *
     * Thread safe.
     *
     * @return true iff the key was stored in the heap and then correctly removed.
     */
    public boolean removeKey(T key) {
        writeLock.lock();
        try {
            Optional<TreapNode> maybeNode = root.flatMap(r -> r.search(Optional.of(key), Optional.empty()));
            if (maybeNode.isEmpty()) {
                // No entry with matching key found;
                return false;
            } else {
                // An entry with matching key is found: get its priority and re-use the remove(Entry) overloaded method
                return maybeNode.map(node -> remove(new TreapEntry<>(node.getKey(), node.getPriority()))).orElse(false);
            }
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Remove all entries from the treap.
     *
     * Thread safe.
     */
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

    /**
     * Takes two priorities (two objects of type S) and checks how the first one compares to the second one.
     *
     * @param first  The first priority.
     * @param second The second priority, the one with respect to which the comparison is done.
     *
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

        public int height() {
            return 1 + Math.max(getLeft().map(TreapNode::height).orElse(0), getRight().map(TreapNode::height).orElse(0));
        }

        public T min() {
            return getLeft().map(TreapNode::min).orElse(key);
        }

        public T max() {
            return getRight().map(TreapNode::max).orElse(key);
        }

        public Optional<TreapNode> add(T key, S priority) {
            if (key.compareTo(this.getKey()) <= 0) {
                Optional<TreapNode> left = this.getLeft()
                        .flatMap(node -> node.add(key, priority))
                        // If the left child is empty, we can create a new node with the new key
                        .or(() -> Optional.of(new TreapNode(key, priority)));
                this.setLeft(left);
                // Check that the heaps invariants are not violated, otherwise a rotation is needed to reinstate them
                if (hasHigherPriority(priority, this.getPriority())) {
                    return this.getLeft().map(TreapNode::rightRotate);
                }
            } else {
                Optional<TreapNode> right = this.getRight()
                        .flatMap(node -> node.add(key, priority))
                        // If the right child is empty, we can create a new node with the new key
                        .or(() -> Optional.of(new TreapNode(key, priority)));
                this.setRight(right);
                // Check that the heaps invariants are not violated, otherwise a rotation is needed to reinstate them
                if (hasHigherPriority(priority, this.getPriority())) {
                    return this.getRight().map(TreapNode::leftRotate);
                }
            }
            return Optional.of(this);
        }

        public Optional<TreapNode> remove(T targetKey, S targetPriority, AtomicBoolean wasRemoved) {
            if (targetKey.equals(key) && targetPriority.equals(priority)) {
                wasRemoved.set(true);
                // We have found the node to be removed, now we just need to push it down to a leaf and remove it
                return this.pushDownToLeafAndDisconnect();
            }
            // else: based on how the target key to remove compares to current, traverse the left or right subtree
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
         * @return The new root of the subtree previously rooted at current node, or Optional.empty if this was a leaf.
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
         *     y                             x
         *    / \      RightRotate(x)      /  \
         *   x   T3    – – – – – – – >    T1   y
         *  / \        < - - - - - - -        / \
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
         *     y                             x
         *    / \      RightRotate(x)      /  \
         *   x   T3    – – – – – – – >    T1   y
         *  / \        < - - - - - - -        / \
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
