package org.mlarocca.containers.priorityqueue;

import java.util.Optional;

public interface PriorityQueue<T extends Comparable<T>> {
    Optional<T> top();
    Optional<T> peek();
    boolean contains(T element);
    boolean add(T element);
    boolean updatePriority(T oldElement, T newElement);
    boolean remove(T element);
    int size();
    default boolean isEmpty() {
        return this.size() == 0;
    }
    void clear();
}
