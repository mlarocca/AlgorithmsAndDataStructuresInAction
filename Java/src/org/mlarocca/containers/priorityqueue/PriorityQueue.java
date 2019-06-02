package org.mlarocca.containers.priorityqueue;

import java.util.Optional;

public interface PriorityQueue<T> {
    Optional<T> top();
    Optional<T> peek();
    boolean contains(T element);
    Optional<Double> priority(T element);
    boolean add(T element, double priority);
    boolean updatePriority(T element, double newPriority);
    boolean addElementOrUpdatePriority(T element, double priority);
    boolean remove(T element);
    int size();
    default boolean isEmpty() {
        return this.size() == 0;
    }
    void clear();
}
