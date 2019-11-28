package org.mlarocca.containers.priorityqueue;

import java.util.Optional;

public interface PriorityQueue<T extends Comparable<T>> {
    boolean add(T element);
    boolean updatePriority(T oldElement, T newElement);
    boolean remove(T element);
    Optional<T> top();
    Optional<T> peek();
    boolean contains(T element);
    int size();
    default boolean isEmpty() {
        return this.size() == 0;
    }
    void clear();
}
