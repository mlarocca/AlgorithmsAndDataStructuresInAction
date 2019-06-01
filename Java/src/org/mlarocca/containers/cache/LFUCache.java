package org.mlarocca.containers.cache;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.ConcurrentHashMap;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.Heap;
import org.mlarocca.containers.priorityqueue.PriorityQueue;

public class LFUCache<Key, Value> {
    private int maxSize;
    private ConcurrentHashMap<Key, CacheItem> items;
    private PriorityQueue<Key> keyPriorities;

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
        this.items = new ConcurrentHashMap<Key, CacheItem>(maxSize);
        // We use a branching factor of 4 to optimize the D-way heap performance
        this.keyPriorities = new Heap<>(4);

        ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        this.readLock = lock.readLock();
        this.writeLock = lock.writeLock();
    }

    public boolean set(Key key, Value value) {
        writeLock.lock();
        try {
            if (this.items.containsKey(key)) {
                CacheItem item = this.items.get(key);
                item.value = value;
                return keyPriorities.updatePriority(key, item.counter.incrementAndGet());
            } else if (this.getSize() >= this.maxSize) {
                this.evictOneEntry();
            }
            CacheItem item = new CacheItem(value);

            if (!this.keyPriorities.add(key, item.counter.intValue())) {
                return false;
            }
            this.items.put(key, item);
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    public Optional<Value> get(Key key) {
        readLock.lock();
        try {
            return Optional.ofNullable(this.items.get(key)).map(item -> {
                keyPriorities.updatePriority(key, item.counter.incrementAndGet());
                return item.value;
            });
        } finally {
            readLock.unlock();
        }
    }

    public int getSize() {
        readLock.lock();
        try {
            return keyPriorities.size();
        } finally {
            readLock.unlock();
        }
    }

    @VisibleForTesting
    protected boolean evictOneEntry() {
        writeLock.lock();
        try {
            Optional<Key> key = keyPriorities.top();
            if (!key.isPresent()) {
                // Key is not cached
                return false;
            }
            items.remove(key.get());
            keyPriorities.remove(key.get());
            return true;
        } finally {
            writeLock.unlock();
        }
    }

    private class CacheItem {
        public Value value;
        public AtomicInteger counter;

        private CacheItem(Value value) {
            this.value = value;
            this.counter = new AtomicInteger(1);
        }
    }

}
