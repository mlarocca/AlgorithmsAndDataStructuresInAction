package org.mlarocca.containers.tree;

public interface SearchTree<T extends Comparable<T>> extends ReadOnlySearchTree<T> {
    boolean add(final T entry);
    boolean remove(final T entry);
}