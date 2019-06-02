package org.mlarocca.containers.cache;

import java.util.Optional;

public interface Cache<Key, Value> {
    boolean set(Key key, Value value);
    Optional<Value> get(Key key);
    int size();
    boolean isEmpty();
    void clear();
}
