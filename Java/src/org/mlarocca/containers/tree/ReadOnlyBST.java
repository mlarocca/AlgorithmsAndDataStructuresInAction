package org.mlarocca.containers.tree;

import java.util.Optional;

public interface ReadOnlyBST<T extends Comparable<T>> {
    Optional<T> min();
    Optional<T> max();
    Optional<T> search(final T element);
    boolean isEmpty();
}
