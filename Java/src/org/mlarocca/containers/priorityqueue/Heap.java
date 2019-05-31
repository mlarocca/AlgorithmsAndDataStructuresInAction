package org.mlarocca.containers.priorityqueue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import com.google.common.annotations.VisibleForTesting;

/**
 * Implementation of the PriorityQueue interface as a d-ary heap.
 * The branching factor for the heap can be passed as an argument.
 * It's 2 by default, but can be set up to 10.
 * The branching factor is the maximum number of children that each internal node can have.
 * For regular heaps, a node an have at most 2 children, so the branching factor is 2.
 * The higher the branching factor, the shortest the height of the heap. However, when an element is
 * pushed towards the leaves of the heap, at each step all children of current node must be examined,
 * so a larger branching factor implies a higher number of nodes to be checked for each step of this
 * operation.
 * On the other hand, inserting elements only examines at most h element, where h is the height of the heap,
 * so this operation is only made faster with larger branching factors.
 * In general values between 3 and 5 are a good compromise and produce good performance.
 *
 * Dublicates are not allowed in this implementation.
 *
 * @param <T> The generic type for elements that can be held in the heap.
 */
public class Heap<T> implements PriorityQueue<T> {

    private static final int DEFAULT_BRANCHING_FACTOR = 2;

    public static final int MAX_BRANCHING_FACTOR = 10;

    private List<Pair<T>> pairs;

    /**
     * Keep the positions of the elements in a hash map to implement a fast version of `contains` method.
     */
    private Map<T, Integer> elementsPositions;

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

    /**
     * Branching factor for the heap, i.e. the (max) number of children for each node.
     */
    private int branchingFactor;

    /**
     * Default constructor. Branching factor is 2 by default, and the heap is initialized, but empty.
     */
    public Heap() {
        this(DEFAULT_BRANCHING_FACTOR);
    }

    /**
     * Constructor: takes the branching factor as a input.
     * Valid branching factors are integers between 2 and 10 included.
     * The heap is initialized and ready to hold elements.
     * @param branchingFactor The (maximum) number of children that a node can have.
     * @throws IllegalArgumentException:
     *          - If the branching factor is not within the valid range.
     */
    public Heap(int branchingFactor) throws IllegalArgumentException {
        pairs = new ArrayList<>();
        elementsPositions = new HashMap<>();
        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        readLock = lock.readLock();
        writeLock = lock.writeLock();
        validateBranchingFactor(branchingFactor);
        this.branchingFactor = branchingFactor;
    }

    /**
     * Most generic constructor.
     *
     * @param elements A list of elements to add to the heap.
     * @param priorities A list of priorities for the elements. The two lists need to have the same
     *                   size, and be in a consistent order: priority for the i-th element must be
     *                   in the i-ith position.
     * @param branchingFactor The (maximum) number of children that a node can have.
     * @throws IllegalArgumentException:
     *          - If the two lists don't have the same size.
     *          - If the branching factor is not within the valid range.
     */
    public Heap(List<T> elements, List<Double> priorities, int branchingFactor) throws IllegalArgumentException {
        validateBranchingFactor(branchingFactor);
        this.branchingFactor = branchingFactor;
        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        readLock = lock.readLock();
        writeLock = lock.writeLock();

        if (elements == null || priorities == null) {
            throw new NullPointerException("Null argument(s)");
        }
        int n = elements.size();
        if (priorities.size() != n) {
            throw new IllegalArgumentException("Elements and priorities lists size does not match");
        }

        pairs = IntStream.range(0, n)
            .mapToObj(i -> new Pair<T>(elements.get(i), priorities.get(i)))
            .collect(Collectors.toList());

        elementsPositions = new HashMap<>();

        // Now performs a heapify initialization
        for (int i = getParentIndex(n - 1) + 1; i < n; i++) {
            // Sets the positions for the second half of the array
            elementsPositions.put(pairs.get(i).getElement(), i);
        }

        for (int i = getParentIndex(n - 1); i >= 0; i--) {
            // Performs a push-down for every element with at least one children, starting from last
            // This way each sub-tree rooted at index i will be a valid sub-heap
            pushDown(i);
        }
    }

    /**
     * Extracts and returns the top element of the heap (if it's not empty), and then reinstante the
     * heap properties.
     * Thread safe.
     *
     * @return If no element is present, returns an empty Optional. Otherwise wraps the highest
     *          priority element in an Optional container.
     */
    @Override
    public Optional<T> top() {
        writeLock.lock();
        try {
            if (this.isEmpty()) {
                return Optional.empty();
            }
            int n = pairs.size();
            T top = pairs.get(0).getElement();

            if (n > 1) {
                // Replaces the top element with the last element in the heap
                pairs.set(0, pairs.remove(n - 1));
                this.pushDown(0);
            } else {
                pairs.remove(0);
            }
            elementsPositions.remove(top);
            // INVARIANT: top is non null at this point
            return Optional.of(top);
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Returns the top element of the heap (if it's not empty), without any side effect.
     * Thread safe.
     *
     * @return If no element is present, returns an empty Optional. Otherwise wraps the highest
     *          priority element in an Optional container.
     */
    @Override
    public Optional<T> peek() {
        readLock.lock();
        try {
            return pairs.isEmpty() ? Optional.empty() : Optional.of(pairs.get(0).getElement());
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Check if an element is stored in the heap.
     * Thread safe.
     *
     * @param element The element of interest.
     * @return true iff the element is present.
     */
    @Override
    public boolean contains(T element) {
        readLock.lock();
        try {
            return elementsPositions.containsKey(element);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Retrieves the priority of an element, if it's stored in the heap.
     * Thread safe.
     *
     * @param element The element of interest.
     * @return Optional.empty if the lement is not stored in the heap. The element's priority, wrapped
     *          in an Optional container, otherwise.
     */
    @Override
    public Optional<Double> priority(T element) {
        readLock.lock();
        try {
            return Optional.ofNullable(elementsPositions.get(element))
                    .map(i -> pairs.get(i).priority);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Add a new element to the heap. The heap does not allow duplicates, so if an element equals
     * to the argument is already stored in the heap, ignores the new one.
     * Thread safe.
     *
     * @param element The value of the element to add.
     * @param priority The priority to associate with the new element.
     * @return true iff the element has been successdully added, false otherwise.
     */
    @Override
    public boolean add(T element, double priority) {
        writeLock.lock();
        try {
            if (this.contains(element)) {
                return false;
            } // else {

            pairs.add(new Pair<T>(element, priority));
            this.bubbleUp(pairs.size() - 1);
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Removes a generic element from the heap. It doesn't need to be the top element, as the removal
     * is based on its value, not on the priority.
     * Thread safe.
     *
     * @param element The element to eb removed.
     * @return true iff the element was stored in the heap and then correctly removed.
     */
    @Override
    public boolean remove(T element) {
        writeLock.lock();
        try {
            if (this.isEmpty() || !this.contains(element)) {
                return false;
            } //else

            int n = this.size();
            int position = elementsPositions.get(element);
            if (position == n - 1) {
                // This also covers the case n == 1
                pairs.remove(position);
                elementsPositions.remove(element);
            } else {
                pairs.set(position, pairs.get(n - 1));
                pairs.remove(n - 1);
                elementsPositions.remove(element);
                this.pushDown(position);
            }
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Updates an element already stored in the queue, by setting its priority to a new value.
     * Thread safe.
     *
     * @param element The element to be updated. If the element is not in the queue, it will NOT be added.
     *                If you need an `upsert` operation instead, check out {@link this.addElementOrUpdatePriority}.
     * @param newPriority The new value for the priority.
     * @return true iff the element was stored in the heap and its priority successfully updated.
     */
    @Override
    public boolean updatePriority(T element, double newPriority) {
        writeLock.lock();
        try {
            if (this.isEmpty() || !this.contains(element)) {
                return false;
            } //else

            int position = elementsPositions.get(element);
            Pair<T> oldPair = pairs.get(position);
            Pair<T> newPair = new Pair<T>(element, newPriority);
            pairs.set(position, newPair);

            if (hasHigherPriority(newPair, oldPair)) {
                bubbleUp(position);
            } else {
                pushDown(position);
            }

            return true;
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Adds the element-priority pair to the heap. If the element was already stored, updates its priority to a new value.
     * Otherwise adds it to the queue.
     * Thread safe.
     *
     * @param element The element to be added or updated. If the element is not in the queue, it will be added.
     * @param priority The priority to associate with the element.
     * @return true iff the element is now stored in the queue with the associated priority.
     */
    @Override
    public boolean addElementOrUpdatePriority(T element, double priority) {
        writeLock.lock();
        try {
            if (contains(element)) {
                return updatePriority(element, priority);
            } else {
                return add(element, priority);
            }
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Returns the size of the heap.
     * Thread safe.
     *
     * @return The number of elements sotred in the heap.
     */
    @Override
    public int size() {
        readLock.lock();
        try {
            return pairs.size();
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Compares two elements stored in the heap and checks if the first one has higher priority than the second one.
     *
     * @param element The element whose prioriyt is checked.
     * @param withRespectToElement The second element, the one with respect to which the comparison is done.
     * @return true iff the first argument has higher priority than the second, in this heap.
     */
    protected boolean hasHigherPriority(Pair<T> element, Pair<T> withRespectToElement) {
        return element.compareTo(withRespectToElement) < 0;
    }

    /**
     * Computes the position of the first child of an element in a given position.
     * It might overflow the array, checks should be performed by the caller.
     *
     * @param index The position of the element whose children's position need to be computed.
     * @return The index that the first child of element at position `index` would have in the array.
     */
    protected int getFirstChildIndex(int index) {
        return branchingFactor * index + 1;
    }

    /**
     * Computes the position that the parent of current element
     * When called for the root, it might underflow the array (in theory, only with branching factor 1), or
     * return the same position: checks should be performed by the caller.
     *
     * @param index The index of the current element, whose parent's position needs to be computed.
     * @return
     */
    protected int getParentIndex(int index) {
        return (index - 1) / branchingFactor;
    }

    /**
     * Validates the value provided for the branching factor.
     * Valid range is between 2 and MAX_BRANCHING_FACTOR.
     *
     * @param branchingFactor The value to validate.
     * @throws IllegalArgumentException In case the argument is outside valid range.
     */
    private void validateBranchingFactor(int branchingFactor) throws IllegalArgumentException {
        if (branchingFactor < DEFAULT_BRANCHING_FACTOR || branchingFactor > MAX_BRANCHING_FACTOR) {
            throw new IllegalArgumentException(
                    String.format("Branching factor needs to be an int between {} and {}", DEFAULT_BRANCHING_FACTOR, MAX_BRANCHING_FACTOR));
        }
    }

    /**
     * Pushes down the element at the given position, towards the heap's leaves, in order to reinstate heap properties.
     * It also needs to update the hashmap holding the element positions.
     *
     * @param index The position in the heap where to start.
     */
    private void pushDown(int index) {
        // INVARIANT: index < n
        int n = pairs.size();
        int firstChildrenIndex= getFirstChildIndex(index);
        int smallestChildrenIndex  = firstChildrenIndex;
        Pair<T> pair = pairs.get(index);
        while (smallestChildrenIndex < n) {
            // Find all
            for (int childrenIndex = smallestChildrenIndex; childrenIndex < Math.min(firstChildrenIndex + branchingFactor, n); childrenIndex++) {
                if (hasHigherPriority(pairs.get(childrenIndex), pairs.get(smallestChildrenIndex))) {
                    smallestChildrenIndex = childrenIndex;
                }
            }
            Pair<T> child = pairs.get(smallestChildrenIndex);
            if (hasHigherPriority(child, pairs.get(index))) {
                pairs.set(index, child);
                elementsPositions.put(child.getElement(), index);
                index = smallestChildrenIndex;
                smallestChildrenIndex = getFirstChildIndex(index);
            } else {
                // The element is already in the right place
                break;
            }
        }
        pairs.set(index, pair);
        elementsPositions.put(pair.getElement(), index);
    }

    /**
     * Bubbles up the element at the given position, towards the root, in order to reinstate heap properties.
     * It also needs to update the hashmap holding the element positions.
     *
     * @param index The position in the heap where to start.
     */
    private void bubbleUp(int index) {
        // INVARIANT: 0 <= index < n
        int parentIndex;
        Pair<T> pair = pairs.get(index);

        while (index > 0) {
            parentIndex = getParentIndex(index);
            Pair<T> parent = pairs.get(parentIndex);
            if (hasHigherPriority(pair, parent)) {
                pairs.set(index, parent);
                elementsPositions.put(parent.getElement(), index);
                index = parentIndex;
            } else {
                // The element is already in the right position
                break;
            }
        }
        pairs.set(index, pair);
        elementsPositions.put(pair.getElement(), index);
    }

    /**
     * Internal class used to zip elements and priorities together.
     * @param <R> The type generic of the elements contained.
     */
    @VisibleForTesting
    protected class Pair<R> implements Comparable<Pair<R>>{
        private R element;
        private double priority;

        /**
         * Constructor.
         *
         * @param element
         * @param priority
         */
        public Pair(R element, double priority) {
            this.element = element;
            this.priority = priority;
        }

        /**
         * A pair should be hashed exactly as its element, ignoring the priority.
         *
         * @return The hashcode for the pair, i.e. the hashcode for the element.
         */
        @Override
        public int hashCode() {
            return element == null ? 0 : element.hashCode();
        }

        /**
         * Equality should only depend on the element, ignoring priority.
         * @param other
         * @return
         */
        @Override
        public boolean equals(Object other) {
            return other != null
                    && other.getClass().equals(this.getClass())
                    && other.hashCode() == element.hashCode()
                    && element.equals(((Pair<R>)other).element);
        }

        /**
         * Compares two pairs, based on priority only.
         *
         * @param other The pair to compare to.
         * @return -1 if this pair is smaller (i.e. higher priority).
         *          0 if they have the same priority.
         *          1 if the other pair has higher priority.
         */
        @Override
        public int compareTo(Pair<R> other) {
            if (other == null || priority < other.priority) {
                return -1;
            } else if (priority == other.priority) {
                return 0;
            } else {
                return 1;
            }
        }

        /**
         * Getter for pair's priority.
         *
         * @return The priority component.
         */
        public double getPriority() {
            return priority;
        }

        /**
         * Getter for the pair's element.
         *
         * @return The element for this pair.
         */
        public R getElement() {
            return element;
        }
    }
}
