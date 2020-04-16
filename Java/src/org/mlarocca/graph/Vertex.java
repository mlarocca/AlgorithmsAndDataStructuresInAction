package org.mlarocca.graph;

import org.json.simple.JSONObject;

import java.io.IOException;
import java.util.Collection;
import java.util.Optional;

public interface Vertex<T> {
    T getLabel();
    double getWeight();
    Collection<Edge<T>> getOutEdges();
    Optional<Edge<T>> getEdgeTo(T destination);
    JSONObject toJsonObject();
    String toJson() throws IOException;
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
    boolean addEdgeTo(T destination, double weight) throws IllegalArgumentException;

    /**
     *
     * @param edge
     * @return true if the edge overwrote an existing edge, false otherwise.
     * @throws IllegalArgumentException If edge is null.
     */
    boolean addEdge(Edge<T> edge) throws IllegalArgumentException;

    /**
     *
     * @param destination
     * @return
     * @throws IllegalArgumentException If destination is null.
     */
    Optional<Edge<T>> deleteEdgeTo(T destination) throws IllegalArgumentException;
}
