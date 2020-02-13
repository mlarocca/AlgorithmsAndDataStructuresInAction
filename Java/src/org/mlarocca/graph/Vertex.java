package org.mlarocca.graph;

import java.util.Collection;
import java.util.Optional;

public interface Vertex<T> {
    T getLabel();
    double getWeight();
    Collection<Edge<T>> getOutEdges();
    Optional<Edge<T>> getEdgeTo(T destination);
}

interface VertexInternal<T> extends Vertex<T> {
    /**
     *
     * @param destination
     * @param weight
     * @return true if the edge overwrote an existing edge, false otherwise.
     * @throws IllegalArgumentException If destination is null.
     *          is already present.
     */
    abstract boolean addEdgeTo(T destination, double weight) throws IllegalArgumentException;

    /**
     *
     * @param edge
     * @return true if the edge overwrote an existing edge, false otherwise.
     * @throws IllegalArgumentException If edge is null.
     */
    abstract boolean addEdge(Edge<T> edge) throws IllegalArgumentException;

    /**
     *
     * @param destination
     * @return
     * @throws IllegalArgumentException If destination is null.
     */
    Optional<Edge<T>> deleteEdgeTo(T destination) throws IllegalArgumentException;
}
