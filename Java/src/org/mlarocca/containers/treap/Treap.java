package org.mlarocca.containers.treap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.PriorityQueue;
import org.mlarocca.containers.priorityqueue.ReadOnlyPriorityQueue;
import org.mlarocca.containers.tree.BST;
import org.mlarocca.containers.tree.ReadOnlyBST;

import java.util.Optional;

public class Treap<T extends Comparable<T>, S extends Comparable<S>> implements ReadOnlyBST<T>, ReadOnlyPriorityQueue<S> {

    private Optional<TreapNode> root;

    @Override
    public Optional<T> min() {
        return Optional.empty();
    }

    @Override
    public Optional<T> max() {
        return Optional.empty();
    }

    @Override
    public Optional<T> search(T element) {
        return root.flatMap(r -> r.search(Optional.of(element), Optional.empty())).map(TreapNode::getKey);
    }

    @Override
    public Optional<S> top() {
        Optional<S> result = root.map(TreapNode::value);
        root.ifPresent(TreapNode::remove);
        return result;
    }

    @Override
    public Optional<S> peek() {
        return root.map(TreapNode::value);
    }

    @Override
    public boolean contains(S element) {
        return root.flatMap(r -> r.search(Optional.empty(), Optional.of(element))).isPresent();
    }

    @Override
    public int size() {
        return root.map(TreapNode::size).orElse(0);
    }

    @Override
    public boolean isEmpty() {
        return root.isEmpty();
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
        return maybeNode.flatMap(node -> node.remove()).isPresent();
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

        public S value() {
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
            return 1 + left().map(TreapNode::size).orElse(0)  + right().map(TreapNode::size).orElse(0);
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
}
