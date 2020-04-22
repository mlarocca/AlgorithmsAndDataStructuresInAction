package org.mlarocca.graph;

import org.json.simple.JSONObject;

import java.io.IOException;
import java.io.StringWriter;

class ThreadsafeEdge<T> implements Edge<T> {
    private T source;
    private T destination;
    private double weight;

    // Edge's weight should default to 1
    public ThreadsafeEdge(T source, T destination) {
        this(source, destination, 1.0);
    }

    public ThreadsafeEdge(T source, T destination, double weight) {
        if (source == null) {
            throw new IllegalArgumentException("source can't be null");
        }
        if (destination == null) {
            throw new IllegalArgumentException("destination can't be null");
        }
        this.source = source;
        this.destination = destination;
        this.weight = weight;
    }

    @Override
    public T getSource() {
        return source;
    }

    @Override
    public T getDestination() {
        return destination;
    }

    @Override
    public double getWeight() {
        return weight;
    }

    @Override
    public boolean isLoop() {
        return getSource().equals(getDestination());
    }

    @Override
    public int hashCode() {
        long hash = 17L * (source.hashCode() * 31L + destination.hashCode());
        return (int) hash % Integer.MAX_VALUE;
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

        ThreadsafeEdge<T> otherEdge = (ThreadsafeEdge<T>)other;
        return this.source.equals(otherEdge.getSource())
                && this.destination.equals(otherEdge.getDestination());
    }

    @Override
    public String toString() {
        return String.format("Edge(%s -> %s | %.3f)", source.toString(), destination.toString(), weight);
    }

    @Override
    public JSONObject toJsonObject() {
        JSONObject edge = new JSONObject();
        edge.put("source", new ThreadsafeVertex<>(this.getSource()).toJsonObject());
        edge.put("destination", new ThreadsafeVertex<>(this.getDestination()).toJsonObject());
        edge.put("weight", this.getWeight());

        return edge;
    }

    @Override
    public String toJson() throws IOException {
        JSONObject edge = this.toJsonObject();

        StringWriter stringWriter = new StringWriter();
        edge.writeJSONString(stringWriter);

        return stringWriter.toString();
    }
}
