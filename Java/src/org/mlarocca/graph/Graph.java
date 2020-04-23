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
        return addEdge(source, destination, 1);
    }

    boolean addEdge(T source, T destination, double weight) throws IllegalArgumentException;

    Optional<Edge<T>> getEdge(T source, T destination);

    boolean hasEdge(T source, T destination);

    Optional<Edge<T>> deleteEdge(T source, T destination) throws NoSuchElementException;

    /**
     * Returns all edges in the graph (including loops).
     *
     * @return A collection containing all edges in the graph (including loops).
     */
    Collection<Edge<T>> getEdges();

    /**
     * Returns simple edges in the graph (loops are excluded).
     *
     * @return A collection containing all simple edges in the graph (all edges that aren't loops).
     */
    Collection<Edge<T>> getSimpleEdges();

    Collection<Edge<T>> getEdgesFrom(T source) throws NoSuchElementException;

    Collection<Edge<T>> getEdgesTo(T destination) throws NoSuchElementException;

    Map<Vertex<T>, GraphSearchResult<T>> BFS(T source) throws NoSuchElementException;

    GraphSearchResult<T> BFS(T source, T destination) throws NoSuchElementException;

    Map<Vertex<T>, Integer> DFS();

    List<Vertex<T>> topologicalSort();

    boolean isAcyclic();

    boolean isConnected();

    boolean isStronglyConnected();

    boolean isComplete();

    /**
     * @param partitions This set is used to return the partitions found for the graph.
     *                   WARNING: the list will be cleared of any previous content.
     * @return
     */
    boolean isBipartite(List<Set<Vertex<T>>> partitions);

    boolean isCompleteBipartite();

    Graph<T> inducedSubGraph(Set<T> vertices);

    Graph<T> transpose();

    boolean isPlanar();

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

    Map<Vertex<T>, GraphSearchResult<T>> Dijkstra(T source) throws NoSuchElementException;

    GraphSearchResult<T> Dijkstra(T source, T destination) throws NoSuchElementException;
    //GraphSearchResult<T> AStar(T source) throws NoSuchElementException ;

    JSONObject toJsonObject();

    String toJson() throws IOException;
}
