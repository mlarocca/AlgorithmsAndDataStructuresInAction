package org.mlarocca.containers.cache;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.list.LinkedList;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class LRUCache<Key, Value> implements Cache<Key, Value> {
    private int maxSize;
    private ConcurrentHashMap<Key, LinkedList.LinkedListNode<CacheItem>> nodes;
    private LinkedList<CacheItem> itemsList;

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

    public LRUCache(int maxSize) {
        this.maxSize = maxSize;
        this.nodes = new ConcurrentHashMap<>(maxSize);
        // We use a branching factor of 4 to optimize the D-way heap performance
        this.itemsList = new LinkedList<>();

        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        this.readLock = lock.readLock();
        this.writeLock = lock.writeLock();
    }

    @Override
    public boolean set(Key key, Value value) {
        writeLock.lock();
        try {
            CacheItem item = new CacheItem(key, value);
            if (this.nodes.containsKey(key)) {
                LinkedList.LinkedListNode<CacheItem> node = this.nodes.get(key);
                LinkedList.LinkedListNode<CacheItem> newNode = itemsList.updateAndBringToFront(node, item);
                if (newNode.isEmpty()) {
                    return false;
                }
                this.nodes.put(key, newNode);
                return true;
            }
            // else
            if (this.size() >= this.maxSize) {
                this.evictOneEntry();
            }
            LinkedList.LinkedListNode<CacheItem> newNode = this.itemsList.add(item);
            if (newNode.isEmpty()) {
                return false;
            }
            this.nodes.put(key, newNode);
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Optional<Value> get(Key key) {
        readLock.lock();
        try {
            LinkedList.LinkedListNode<CacheItem> node = this.nodes.get(key);
            if (node == null || node.isEmpty()) {
                return Optional.empty();
            }
            nodes.put(key, this.itemsList.bringToFront(node));
            return Optional.of(node.getValue().value);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public int size() {
        readLock.lock();
        try {
            return itemsList.size();
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean isEmpty() {
        return size() == 0;
    }

    @Override
    public void clear() {
        writeLock.lock();
        try {
            nodes.clear();
            itemsList.clear();
        } finally {
            writeLock.unlock();
        }
    }

    @VisibleForTesting
    protected boolean evictOneEntry() {
        writeLock.lock();
        try {
            LinkedList.LinkedListNode<CacheItem> node = itemsList.removeTail();
            if (node.isEmpty()) {
                // Cache was empty
                return false;
            }
            nodes.remove(node.getValue().key);
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    private class CacheItem {
        public Key key;
        public Value value;

        private CacheItem(Key key, Value value) {
            this.value = value;
            this.key = key;
        }
    }

}
