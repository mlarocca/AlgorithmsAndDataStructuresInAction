package org.mlarocca.containers.tree;

public interface BST<T extends Comparable<T>> extends ReadOnlyBST<T> {
    boolean insert(final T element);
    boolean delete(final T element);
}