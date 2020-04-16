package org.mlarocca.graph;

import org.json.simple.JSONObject;

import java.io.IOException;
import java.util.*;

public interface Graph<T> {
    default void addVertex(T label) throws IllegalArgumentException {
        addVertex(label, 0);
    }
    void addVertex(T label, double weight) throws IllegalArgumentException;

    Optional<Vertex<T>> getVertex(T label);

    boolean hasVertex(T label);

    Optional<Vertex<T>> deleteVertex(T label);

    Collection<Vertex<T>> getVertices();

    default boolean addEdge(T source, T destination) throws IllegalArgumentException {
        return addEdge(source, destination, 0);
    }
    boolean addEdge(T source, T destination, double weight) throws IllegalArgumentException;

    Optional<Edge<T>> getEdge(T source, T destination);
    boolean hasEdge(T source, T destination);

    Optional<Edge<T>> deleteEdge(T source, T destination) throws NoSuchElementException;

    Collection<Edge<T>> getEdges();
    Collection<Edge<T>> getEdgesFrom(T source) throws NoSuchElementException;
    Collection<Edge<T>> getEdgesTo(T destination) throws NoSuchElementException;

    Map<Vertex<T>, GraphSearchResult<T>> BFS(T source) throws NoSuchElementException;
    GraphSearchResult<T> BFS(T source, T destination) throws NoSuchElementException ;

    List<Vertex<T>> topologicalSort();
    boolean isAcyclic();
    boolean isConnected();
    boolean isStronglyConnected();

    Graph<T> transpose();

    /**
     * Computes the symmetric closure of a directed graph G.
     * If G is an undirected graphs, it returns a graph isomorphic to G.
     *
     * @return A graph G' that, for each edge (u,v) in G, has both (u,v) and (v,u).
     */
    Graph<T> symmetricClosure();

    /**
     * Computes the transitive closure of a graph G.
     *
     * @return A graph G' with an edge (u,v) for each pair of vertices in G such that v is reachable from u.
     */
    Graph<T> transitiveClosure();

    Set<Set<Vertex<T>>> connectedComponents();
    Set<Set<Vertex<T>>> stronglyConnectedComponents();

    Map<Vertex<T>, GraphSearchResult<T>> Dijkstra(T source) throws NoSuchElementException ;
    GraphSearchResult<T> Dijkstra(T source, T destination) throws NoSuchElementException ;
    //GraphSearchResult<T> AStar(T source) throws NoSuchElementException ;

    JSONObject toJsonObject();
    String toJson() throws IOException;
}
