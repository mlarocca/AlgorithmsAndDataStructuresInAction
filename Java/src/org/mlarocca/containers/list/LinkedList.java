package org.mlarocca.containers.list;

import java.util.Collection;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Doubly linked, concurrent list
 */
public class LinkedList<T> {
    private Guard guard;

    private InternalLinkedListNode<T> head;
    private InternalLinkedListNode<T> tail;
    private AtomicInteger size;

    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;


    public LinkedList() {
        this.guard = new Guard(this);
        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        readLock = lock.readLock();
        writeLock = lock.writeLock();
        clear();
    }

    public void clear() {
        writeLock.lock();
        try {
            head = guard;
            tail = guard;
            size = new AtomicInteger(0);
        } finally {
            writeLock.unlock();
        }
    }

    public int size() {
        readLock.lock();
        try {
            return size.get();
        } finally {
            readLock.unlock();
        }
    }

    public boolean isEmpty() {
        readLock.lock();
        try {
            return head.isEmpty();
        } finally {
            readLock.unlock();
        }
    }

    public boolean contains(T value) {
        readLock.lock();
        try {
            return search(value).hasValue();
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Returns the first node containing value.
     * 
     * @param value The element to search.
     * @return An optional wrapping the result, or empty if it's not found.
     */
    public LinkedListNode<T> search(T value) {
        readLock.lock();
        try {
            return head.search(value);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Add to the head of the list.
     * 
     * @param value
     * @return
     */
    public LinkedListNode<T> add(T value) {
        writeLock.lock();
        try {
            head = new Node(value, head, this);
            if (tail.isEmpty()) {
                tail = head;
            }
            size.incrementAndGet();
            return head;
        } finally {
            writeLock.unlock();
        }
    }

    public boolean addAll(Collection<T> values) {
        writeLock.lock();
        try {
            for (T value : values) {
                if (add(value).isEmpty()) {
                    return false;
                }
            }
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Remove an arbitrary element of the list.
     * 
     * @param value
     * @return
     */
    public LinkedListNode<T> remove(T value) {
        writeLock.lock();
        try {
            InternalLinkedListNode<T> maybeNode = head.search(value);
            // Update tail
            if (!maybeNode.isEmpty()) {
                if (maybeNode == tail) {
                    tail = tail.getPrev();
                }
                if (maybeNode == head) {
                    head = head.getNext();
                }
                maybeNode.detach();
                size.decrementAndGet();
            }
            // Detach the node and return it
            return maybeNode;
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Remove the tail of the list
     * @return
     */
    public LinkedListNode<T> removeTail() {
        writeLock.lock();
        try {
            InternalLinkedListNode<T> oldTail = tail;
            if (oldTail == head) {
                tail = head = guard;
            } else {
                tail = tail.getPrev();
                oldTail.detach();
            }
            if (!oldTail.isEmpty()) {
                size.decrementAndGet();
            }
            return oldTail;
        } finally {
            writeLock.unlock();
        }
    }
    public LinkedListNode<T> bringToFront(LinkedListNode<T> node) {
        if (node.isEmpty()) {
            // Can't bring an empty node to front of the list
            return guard;
        } else {
            return updateAndBringToFront(node, node.getValue());
        }
    }

    public LinkedListNode<T> updateAndBringToFront(LinkedListNode<T> node, T newValue) {
        writeLock.lock();
        try {
            if (node.isEmpty()) {
                // Can't bring an empty node to front of the list
                return guard;
            }
            InternalLinkedListNode<T> iNode = (InternalLinkedListNode<T>) node;
            if (this != (iNode.getListReference())) {
                // The node doesn't belong to this list
                return guard;
            }
            // else
            detach(iNode);
            add(newValue);
            return head;
        } catch (ClassCastException e) {
            // If it's an instance of another class, can't be of this list
            return guard;
        } finally {
            writeLock.unlock();
        }
    }

    private void detach(InternalLinkedListNode<T> node) {
        if (node == tail) {
            removeTail();
        } else {
            node.detach();
            if (node == head) {
                head = head.getNext();
            }
            size.decrementAndGet();
        }
    }
    
    public interface LinkedListNode<S> {
        boolean hasValue();
        boolean isEmpty();
        
        S getValue() throws NullPointerException;
    }
    
    private interface InternalLinkedListNode<S> extends LinkedListNode<S> {
        void detach();
        LinkedList<S> getListReference();

        InternalLinkedListNode<S> setPrev(InternalLinkedListNode<S> prev);
        InternalLinkedListNode<S> setNext(InternalLinkedListNode<S> next);

        InternalLinkedListNode<S> getPrev();
        InternalLinkedListNode<S> getNext();

        InternalLinkedListNode<S> search(S value);

    }

    public class Guard implements InternalLinkedListNode<T> {
        private LinkedList<T> list;

        public Guard(LinkedList<T> list) {
            this.list = list;
        }

        @Override
        public boolean hasValue() {
            return false;
        }

        @Override
        public boolean isEmpty() {
            return true;
        }

        @Override
        public T getValue() throws NullPointerException {
            throw new NullPointerException();
        }

        @Override
        public void detach() {
            // Nothing to do
            return ;
        }

        @Override
        public LinkedList<T> getListReference() {
            return list;
        }

        @Override
        public InternalLinkedListNode<T> setPrev(InternalLinkedListNode<T> next) {
            // Nothing to do;
            return next;
        }

        @Override
        public InternalLinkedListNode<T> setNext(InternalLinkedListNode<T> prev) {
            return prev;
        }

        @Override
        public InternalLinkedListNode<T> getPrev() {
            return this;
        }

        @Override
        public InternalLinkedListNode<T> getNext() {
            return this;
        }

        @Override
        public InternalLinkedListNode<T> search(T value) {
            return this;
        }
    }

    /**
     * 
     */
    public class Node implements InternalLinkedListNode<T> {
        private T value;
        private LinkedList<T> list;

        private InternalLinkedListNode next;
        private InternalLinkedListNode prev;

        /**
         * Constructor.
         * Creates an isolated node.
         *
         * @param value The value to store in this list node.
         */
        public Node(T value, LinkedList<T> list) {
            this(value, guard, list);
        }

        /**
         * Constructor.
         * Creates a node and connects it to a list.
         *
         * @param value The value to store in this list node.
         * @param next The node to set as successor for the newly created.
         */
        public Node(T value, InternalLinkedListNode<T> next, LinkedList<T> list) {
            this.value = value;
            this.next = next;
            this.setPrev(next.getPrev());
            this.prev.setNext(this);
            this.next.setPrev(this);
            this.list = list;
        }

        @Override
        public boolean hasValue() {
            return true;
        }

        @Override
        public boolean isEmpty() {
            return false;
        }

        public T getValue() {
            return value;
        }

        public void detach() {
            this.prev.setNext(this.getNext());
            this.next.setPrev(this.getPrev());
        }

        @Override
        public LinkedList<T> getListReference() {
            return this.list;
        }

        @Override
        public InternalLinkedListNode<T> setPrev(InternalLinkedListNode<T> prev) {
            this.prev = prev;
            return this;
        }

        @Override
        public InternalLinkedListNode<T> setNext(InternalLinkedListNode<T> next) {
            this.next = next;
            return this;
        }

        @Override
        public InternalLinkedListNode<T> getPrev() {
            return this.prev;
        }

        @Override
        public InternalLinkedListNode<T> getNext() {
            return this.next;
        }

        @Override
        public InternalLinkedListNode<T> search(T value) {
            if (this.getValue() == value) {
                return this;
            } else {
                return this.getNext().search(value);
            }
        }
    }
}
