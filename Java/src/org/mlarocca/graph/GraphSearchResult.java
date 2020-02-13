package org.mlarocca.graph;

import java.util.List;
import java.util.Optional;

public interface GraphSearchResult<T> {
    Vertex<T> source();
    Vertex<T> destination();
    Optional<List<Edge<T>>> path();
    Double distance();
}
