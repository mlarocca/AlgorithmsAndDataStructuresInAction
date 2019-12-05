package org.mlarocca.containers.treap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.tree.SearchTree;

import java.util.Optional;
import java.util.Random;

public class RandomizedSearchTree<T extends Comparable<T>> implements SearchTree<T> {
    private final Treap<T, Double> treap = new Treap<>();
    private final Random rnd = new Random();

    public RandomizedSearchTree() {

    }

    @Override
    public boolean add(T entry) {
        return treap.add(new Treap.TreapEntry<>(entry, rnd.nextDouble()));
    }

    @Override
    public boolean remove(T entry) {
        return treap.removeKey(entry);
    }

    @Override
    public Optional<T> min() {
        return treap.min();
    }

    @Override
    public Optional<T> max() {
        return treap.max();
    }

    @Override
    public Optional<T> search(T entry) {
        return treap.search(entry);
    }

    @Override
    public boolean isEmpty() {
        return treap.isEmpty();
    }

    @Override
    public int size() {
        return treap.size();
    }

    @Override
    public int height() {
        return treap.height();
    }

    @VisibleForTesting
    protected boolean checkTreapInvariants() {
        return treap.checkTreapInvariants();
    }

    @VisibleForTesting
    protected boolean checkBSTInvariants() {
        return treap.checkBSTInvariants();
    }
}
