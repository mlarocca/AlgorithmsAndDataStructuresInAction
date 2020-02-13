package org.mlarocca.graph;

class ConcurrentEdge<T> implements Edge<T> {
    private T source;
    private T destination;
    private double weight;

    public ConcurrentEdge(T source, T destination) {
        this(source, destination, 0);
    }

    public ConcurrentEdge(T source, T destination, double weight) {
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

        ConcurrentEdge<T> otherEdge = (ConcurrentEdge<T>)other;
        return this.source.equals(otherEdge.getSource())
                && this.destination.equals(otherEdge.getDestination());
    }

    @Override
    public String toString() {
        return String.format("Edge(%s, %s, %.3f)", source.toString(), destination.toString(), weight);
    }
}
