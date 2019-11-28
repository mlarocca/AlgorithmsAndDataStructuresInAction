package org.mlarocca.containers.treap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.PriorityQueue;
import org.mlarocca.containers.tree.ReadOnlyBST;

import java.util.Optional;

public class Treap<T extends Comparable<T>, S extends Comparable<S>> implements ReadOnlyBST<T>, PriorityQueue<Treap.Entry<T, S>> {

    private Optional<TreapNode> root;

    @Override
    public int size() {
        return root.map(TreapNode::size).orElse(0);
    }

    @Override
    public boolean isEmpty() {
        return root.isEmpty();
    }

    @Override
    public Optional<T> min() {
        return root.map(TreapNode::min);
    }

    @Override
    public Optional<T> max() {
        return root.map(TreapNode::max);
    }

    @Override
    public Optional<T> search(T element) {
        return root.flatMap(r -> r.search(Optional.of(element), Optional.empty())).map(TreapNode::getKey);
    }

    @Override
    public Optional<Entry<T, S>> top() {
        Optional<Entry<T, S>> result = root.map(r -> new TreapEntry(r.getKey(), r.getValue()));
        root = root.flatMap(TreapNode::remove);
        return result;
    }

    @Override
    public Optional<Entry<T, S>> peek() {
        return Optional.empty();
    }

    @Override
    public boolean contains(Entry<T, S> element) {
        return false;
    }

    @Override
    public void clear() {
        while (root.isPresent()) {
            root = root.flatMap(TreapNode::remove);
        }
    }

    public void add(T key, S value) {
        root = root.flatMap(r -> r.insert(key, value)).or(() -> Optional.of(new TreapNode(key, value)));
    }

    public boolean remove(T key, S value) throws NullPointerException {
        Optional<TreapNode> maybeNode = root.flatMap(r -> r.search(Optional.of(key), Optional.of(value)));
        Optional<TreapNode> maybeRemoved = maybeNode.flatMap(node -> node.remove());
        if (maybeRemoved.map(TreapNode::isRoot).orElse(false)) {
            root = maybeRemoved;
        }
        return maybeRemoved.isPresent();
    }

    @Override
    public boolean add(Entry<T, S> element) {
        return false;
    }

    @Override
    public boolean updatePriority(Entry<T, S> oldElement, Entry<T, S> newElement) {
        return false;
    }

    @Override
    public boolean remove(Entry<T, S> element) {
        return false;
    }

    @VisibleForTesting
    private class TreapNode {
        private T key;
        private S value;

        private Optional<TreapNode> left;
        private Optional<TreapNode> right;
        private Optional<TreapNode> parent;

        public TreapNode(T key, S value) {
            this.key = key;
            this.value = value;
            this.left = Optional.empty();
            this.right = Optional.empty();
            this.parent = Optional.empty();
        }

        public Optional<TreapNode> left() {
            return left;
        }

        public Optional<TreapNode> right() {
            return right;
        }

        public Optional<TreapNode> parent() {
            return parent;
        }

        public boolean isLeaf() {
            return left.isEmpty() && right.isEmpty();
        }

        public boolean isRoot() {
            return parent.isEmpty();
        }

        public T getKey() {
            return key;
        }

        public S getValue() {
            return value;
        }

        public Optional<TreapNode> search(Optional<T> targetKey, Optional<S> targetValue) {
            if (targetKey.map(tK -> tK.equals(key)).orElse(true) && targetValue.map(tV -> tV.equals(value)).orElse(true)) {
                return Optional.of(this);
            }
            // else
            Optional<TreapNode> result = Optional.empty();

            if (targetKey.map(tK -> tK.compareTo(key) < 0).orElse(true)) {
                result = left().flatMap(lN -> lN.search(targetKey, targetValue));
            }

            if (result.isEmpty() && targetKey.map(tK -> tK.compareTo(key) > 0).orElse(true)) {
                result = right().flatMap(rN -> rN.search(targetKey, targetValue));
            }
            return result;
        }

        public int size() {
            return 1 + left().map(TreapNode::size).orElse(0) + right().map(TreapNode::size).orElse(0);
        }

        public T min() {
            return left().map(TreapNode::min).orElse(key);
        }

        public T max() {
            return right().map(TreapNode::max).orElse(key);
        }

        public Optional<TreapNode> insert(T key, S value) {
            return Optional.empty();
        }

        public Optional<TreapNode> remove() {
            return Optional.empty();
        }

        private void leftRotate() {

        }

        private void rightRotate() {

        }

    }

    public interface Entry<K, V extends Comparable<V>> extends Comparable<Entry<K,V>> {
        K getKey();
        V getValue();
    }

    public class TreapEntry implements Treap.Entry<T, S> {
        private T key;
        private S value;

        public TreapEntry(T key, S value) {
            this.key = key;
            this.value = value;
        }

        public T getKey() {
            return key;
        }

        public S getValue() {
            return value;
        }

        @Override
        public int compareTo(Entry<T, S> o) {
            if (o == null) {
                return -1;
            }
            return this.value.compareTo(o.getValue());
        }
    }
}
