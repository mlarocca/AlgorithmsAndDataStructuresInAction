package org.mlarocca.graph;

public interface Edge<T> {
    T getSource();
    T getDestination();
    double getWeight();
}
