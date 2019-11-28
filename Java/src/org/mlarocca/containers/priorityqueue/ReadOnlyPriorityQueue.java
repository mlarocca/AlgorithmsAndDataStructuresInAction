package org.mlarocca.containers.priorityqueue;

import java.util.Optional;

public interface ReadOnlyPriorityQueue<T extends Comparable<T>> {
    Optional<T> top();
    Optional<T> peek();
    boolean contains(T element);
    int size();
    default boolean isEmpty() {
        return this.size() == 0;
    }
    void clear();
}
