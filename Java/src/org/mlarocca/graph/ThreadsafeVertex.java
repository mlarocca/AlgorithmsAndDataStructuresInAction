package org.mlarocca.graph;

import org.json.simple.JSONObject;

import java.io.IOException;
import java.io.StringWriter;
import java.util.*;

class ThreadsafeVertex<T> implements VertexInternal<T> {
    private T name;
    private double weight;
    private Map<T, ThreadsafeEdge<T>> adj;

    // Weight should default to 1
    public ThreadsafeVertex(T name) throws IllegalArgumentException {
        this(name, 1.0);
    }

    public ThreadsafeVertex(T name, double weight) throws IllegalArgumentException {
        if (name == null) {
            throw new IllegalArgumentException("Name can't be null");
        }
        this.name = name;
        this.weight = weight;
        this.adj = new HashMap<>();
    }

    @Override
    public synchronized T getName() {
        return name;
    }

    @Override
    public double getWeight() {
        return weight;
    }

    @Override
    public synchronized Optional<Edge<T>> getEdgeTo(T destination) throws IllegalArgumentException {
        return Optional.ofNullable(adj.get(destination));
    }

    @Override
    public JSONObject toJsonObject() {
        JSONObject vertex = new JSONObject();
        vertex.put("name", this.getName());
        vertex.put("weight", this.getWeight());

        return vertex;
    }

    @Override
    public String toJson() throws IOException {
        JSONObject vertex = this.toJsonObject();

        StringWriter stringWriter = new StringWriter();
        vertex.writeJSONString(stringWriter);

        return stringWriter.toString();
    }

    @Override
    public synchronized Collection<Edge<T>> getOutEdges() {
        return new HashSet<>(adj.values());
    }

    @Override
    public synchronized boolean addEdgeTo(T destination, double weight) {
        if (destination == null) {
            throw new IllegalArgumentException("null destination");
        }

        return addEdge(new ThreadsafeEdge<T>(name, destination, weight));
    }

    @Override
    public synchronized boolean addEdge(Edge<T> edge) throws IllegalArgumentException{
        if (edge == null) {
            throw new IllegalArgumentException("null destination");
        } else if (!(edge instanceof ThreadsafeEdge)) {
            throw new IllegalArgumentException("Wrong type for argument Edge: expected ConcurrentEdge");
        }

        Edge<T> oldEdge = adj.put(edge.getDestination(), (ThreadsafeEdge<T>)edge);

        if (oldEdge == null) {
            // Fresh edge
            return false;
        } else {
            // Overwriting old edge
            return true;
        }
    }

    @Override
    public synchronized Optional<Edge<T>> deleteEdgeTo(T destination) throws IllegalArgumentException {
        if (destination == null) {
            throw new IllegalArgumentException("null destination");
        }
        return Optional.ofNullable(adj.remove(destination));
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }

    @Override
    public boolean equals(Object other) {
        // Reference equality
        if (this == other) {
            return true;
        }
        // Check that other is not null and of the same class
        if (other == null || !(other.getClass().equals(this.getClass()))) {
            return false;
        }

        return this.name.equals(((ThreadsafeVertex<T>)other).getName());
    }

    @Override
    public String toString() {
        return String.format("Vertex(%s, %.3f)", name.toString(), weight);
    }
}
