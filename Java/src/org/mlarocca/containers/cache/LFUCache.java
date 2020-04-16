package org.mlarocca.containers.cache;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.heap.Heap;
import org.mlarocca.containers.priorityqueue.PriorityQueue;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class LFUCache<Key, Value> implements Cache<Key, Value> {
    private int maxSize;
    private ConcurrentHashMap<Key, CacheItem> items;
    private PriorityQueue<CacheItem> keyPriorities;

    /**
     * To make this container thread-safe, we need to synchronize all public methods.
     * Instead of using a generic reentrant lock through the synchronized keyword,
     * we define a Read/Write lock, so if we have more reads than writes, we can hold the lock
     * without blocking other reads. Only writes block all other operations.
     */
    private ReentrantReadWriteLock.ReadLock readLock;
    private ReentrantReadWriteLock.WriteLock writeLock;

    public LFUCache(int maxSize) {
        this.maxSize = maxSize;
        this.items = new ConcurrentHashMap<>(maxSize);
        // We use a branching factor of 4 to optimize the D-way heap performance
        this.keyPriorities = new Heap<>(4);

        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        this.readLock = lock.readLock();
        this.writeLock = lock.writeLock();
    }

    @Override
    public boolean set(Key key, Value value) {
        writeLock.lock();
        try {
            if (this.items.containsKey(key)) {
                CacheItem item = this.items.get(key);
                keyPriorities.remove(item);
                item.value = value;
                item.counter.incrementAndGet();
                return keyPriorities.add(item);
            } else if (this.size() >= this.maxSize) {
                this.evictOneEntry();
            }
            CacheItem item = new CacheItem(key, value);

            if (!this.keyPriorities.add(item)) {
                return false;
            }
            this.items.put(key, item);
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Optional<Value> get(Key key) {
        readLock.lock();
        try {
            return Optional.ofNullable(this.items.get(key)).map(item -> {
                keyPriorities.remove(item);
                item.counter.incrementAndGet();
                keyPriorities.add(item);
                return item.value;
            });
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public int size() {
        readLock.lock();
        try {
            return keyPriorities.size();
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
            keyPriorities.clear();
            items.clear();
        } finally {
            writeLock.unlock();
        }
    }

    @VisibleForTesting
    protected boolean evictOneEntry() {
        writeLock.lock();
        try {
            Optional<CacheItem> item = keyPriorities.top();
            if (!item.isPresent()) {
                // Cache is empty
                return false;
            }
            items.remove(item.get().key);
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    private class CacheItem implements Comparable<CacheItem> {
        public Key key;
        public Value value;
        public AtomicInteger counter;

        private CacheItem(Key key, Value value) {
            this.key = key;
            this.value = value;
            this.counter = new AtomicInteger(1);
        }

        @Override
        public int compareTo(CacheItem o) {
            if (o == null) {
                return -1;
            }
            return this.counter.get() - o.counter.get();
        }
    }

}
