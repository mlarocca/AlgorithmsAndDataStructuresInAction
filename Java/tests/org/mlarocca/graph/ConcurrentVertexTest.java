package org.mlarocca.graph;

import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Created by marce on 28/11/2017.
 */
public class ConcurrentVertexTest {

    @Test
    public void addEdgeTo() throws Exception {

    }

    @Test
    public void addEdge() throws Exception {

    }

    @Test
    public void getEdgeTo() throws Exception {

    }

    @Test
    public void getOutEdges() throws Exception {

    }

    @Test
    public void deleteEdgeTo() throws Exception {

    }

    @Test
    public void testHashCode() throws Exception {
        ConcurrentVertex<Integer> v = new ConcurrentVertex<>(0, 0);
        assertEquals(0, v.hashCode());
        v = new ConcurrentVertex<>(1, 0);
        assertNotEquals(0, v.hashCode());
        v = new ConcurrentVertex<>(-1, 44);
        assertNotEquals(0, v.hashCode());
        ConcurrentVertex<String> u = new ConcurrentVertex<>("", 0);
        assertEquals(0, u.hashCode());
        u = new ConcurrentVertex<>("0", 0);
        assertNotEquals(0, u.hashCode());
        u = new ConcurrentVertex<>("AA", 44);
        assertNotEquals(0, u.hashCode());
    }

    @Test
    public void testEquals() throws Exception {

    }

    @Test
    public void testToString() throws Exception {
        Double label = 3.14159;
        ConcurrentVertex<Double> v = new ConcurrentVertex<>(label, label);
        assertEquals("Vertex(3.14159, 3,142)", v.toString());
    }

    @Test
    public void testToJson() throws Exception {
        ConcurrentVertex<Double> v = new ConcurrentVertex<>(3.14159, -0.2);
        assertEquals("{\"weight\":-0.2,\"label\":3.14159}", v.toJson());
        ConcurrentVertex<String> u = new ConcurrentVertex<String>("I'm a vertex", 1e-10);
        assertEquals("{\"weight\":1.0E-10,\"label\":\"I'm a vertex\"}", u.toJson());
    }
}