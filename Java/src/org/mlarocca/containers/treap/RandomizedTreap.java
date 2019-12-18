package org.mlarocca.containers.treap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.tree.SearchTree;

import java.util.Optional;
import java.util.Random;

/**
 * A RandomizedTreap is a binary search tree whose structure depend on randomization, and that on average is balanced.
 * It's implemented through a Treap whose elements' priorities are assigned randomly on insertion: if priorities are drawn
 * from a uniform distribution, it can be proved that the expected height of the tree is logarithmic in the number of elements,
 * after a statistically relevant number of operations on the tree.
 *
 * @param <T> The type of elements that can be added to this container. Must implement the Comparable interface.
 */
public class RandomizedTreap<T extends Comparable<T>> implements SearchTree<T> {

    // A reference to Treap internally used to implement the tree.
    private final Treap<T, Double> treap = new Treap<>();

    // A random numbers generator.
    private final Random rnd = new Random();

    /**
     * {@inheritDoc}
     *
     * Thread safe.
     */
    @Override
    public boolean add(T element) {
        return treap.add(new Treap.TreapEntry<>(element, rnd.nextDouble()));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean remove(T element) {
        return treap.removeKey(element);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void clear() {
        treap.clear();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Optional<T> min() {
        return treap.min();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Optional<T> max() {
        return treap.max();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Optional<T> search(T element) {
        return treap.search(element);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean isEmpty() {
        return treap.isEmpty();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public int size() {
        return treap.size();
    }

    /**
     * {@inheritDoc}
     */
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
