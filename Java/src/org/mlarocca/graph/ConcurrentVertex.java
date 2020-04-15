package org.mlarocca.graph;

import org.json.simple.JSONObject;

import java.io.IOException;
import java.io.StringWriter;
import java.util.*;

class ConcurrentVertex<T> implements VertexInternal<T> {
    private T label;
    private double weight;
    private Map<T, ConcurrentEdge<T>> adj;

    // Weight should default to 1
    public ConcurrentVertex(T label) throws IllegalArgumentException {
        this(label, 1.0);
    }

    public ConcurrentVertex(T label, double weight) throws IllegalArgumentException {
        if (label == null) {
            throw new IllegalArgumentException("Label can't be null");
        }
        this.label = label;
        this.weight = weight;
        this.adj = new HashMap<>();
    }

    @Override
    public synchronized T getLabel() {
        return label;
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
        vertex.put("label", this.getLabel());
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
            throw new IllegalArgumentException("null destination label");
        }

        return addEdge(new ConcurrentEdge<T>(label, destination, weight));
    }

    @Override
    public synchronized boolean addEdge(Edge<T> edge) throws IllegalArgumentException{
        if (edge == null) {
            throw new IllegalArgumentException("null destination label");
        } else if (!(edge instanceof ConcurrentEdge)) {
            throw new IllegalArgumentException("Wrong type for argument Edge: expected ConcurrentEdge");
        }

        Edge<T> oldEdge = adj.put(edge.getDestination(), (ConcurrentEdge<T>)edge);

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
            throw new IllegalArgumentException("null destination label");
        }
        return Optional.ofNullable(adj.remove(destination));
    }

    @Override
    public int hashCode() {
        return label.hashCode();
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

        return this.label.equals(((ConcurrentVertex<T>)other).getLabel());
    }

    @Override
    public String toString() {
        return String.format("Vertex(%s, %.3f)", label.toString(), weight);
    }
}
