package org.mlarocca.containers.tree;

public interface SearchTree<T extends Comparable<T>> extends ReadOnlySearchTree<T> {
    /**
     * Add the specified element to the tree. Generally, duplicates are allowed (derived class can differ).
     *
     * @param element The element to be inserted.
     *
     * @return true if the element could be successfully added.
     */
    boolean add(final T element);

    /**
     * Remove the specified element from the tree.
     *
     * @param element The element to be removed.
     *
     * @return true if the element was held in the tree and could be successfully removed.
     */
    boolean remove(final T element);

    /**
     * Removes all of the elements from this tree.
     */
    void clear();
}