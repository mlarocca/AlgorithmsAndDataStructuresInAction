package org.mlarocca.containers.tree;

import java.util.Optional;

public interface ReadOnlySearchTree<T extends Comparable<T>> {
    /**
     * Returns the smallest element held in the tree.
     *
     * @return An Optional wrapping a reference to the minimum element contained, or Optional.empty if the tree is empty.
     */
    Optional<T> min();

    /**
     * Returns the largest element held in the tree.
     *
     * @return An Optional wrapping a reference to the maximum element contained, or Optional.empty if the tree is empty.
     */
    Optional<T> max();

    /**
     * Searches the specified element in the tree.
     *
     * @param element the element to be searched.
     *
     * @return An Optional wrapping a reference to the element found in the tree, if it's found, or Optional.empty otherwise.
     */
    Optional<T> search(final T element);

    /**
     * Checks if the tree is empty, i.e. if it doesn't contains any element.
     *
     * @return true if the tree is empty.
     */
    boolean isEmpty();

    /**
     * Returns the number of elements in this tree.
     *
     * @return How many elements are held in the tree.
     */
    int size();

    /**
     * Returns the height of the tree.
     *
     * @return The height of the tree, i.e. the length of the longest path from the tree's root to a leaf.
     */
    int height();
}
