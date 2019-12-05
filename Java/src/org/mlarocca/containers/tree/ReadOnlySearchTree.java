package org.mlarocca.containers.tree;

import java.util.Optional;

public interface ReadOnlySearchTree<T extends Comparable<T>> {
    Optional<T> min();
    Optional<T> max();
    Optional<T> search(final T entry);
    boolean isEmpty();
    int size();
    int height();
}
