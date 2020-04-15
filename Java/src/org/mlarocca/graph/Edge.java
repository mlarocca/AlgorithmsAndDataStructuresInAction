package org.mlarocca.graph;

import org.json.simple.JSONObject;

import java.io.IOException;

public interface Edge<T> {
    T getSource();
    T getDestination();
    double getWeight();
    JSONObject toJsonObject();
    String toJson() throws IOException;
}
