package org.mlarocca.graph;

import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Created by marce on 28/11/2017.
 */
public class ThreadsafeVertexTest {

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
        ThreadsafeVertex<Integer> v = new ThreadsafeVertex<>(0, 0);
        assertEquals(0, v.hashCode());
        v = new ThreadsafeVertex<>(1, 0);
        assertNotEquals(0, v.hashCode());
        v = new ThreadsafeVertex<>(-1, 44);
        assertNotEquals(0, v.hashCode());
        ThreadsafeVertex<String> u = new ThreadsafeVertex<>("", 0);
        assertEquals(0, u.hashCode());
        u = new ThreadsafeVertex<>("0", 0);
        assertNotEquals(0, u.hashCode());
        u = new ThreadsafeVertex<>("AA", 44);
        assertNotEquals(0, u.hashCode());
    }

    @Test
    public void testEquals() throws Exception {

    }

    @Test
    public void testToString() throws Exception {
        Double label = 3.14159;
        ThreadsafeVertex<Double> v = new ThreadsafeVertex<>(label, label);
        assertEquals("Vertex(3.14159, 3,142)", v.toString());
    }

    @Test
    public void testToJson() throws Exception {
        ThreadsafeVertex<Double> v = new ThreadsafeVertex<>(3.14159, -0.2);
        assertEquals("{\"weight\":-0.2,\"label\":3.14159}", v.toJson());
        ThreadsafeVertex<String> u = new ThreadsafeVertex<String>("I'm a vertex", 1e-10);
        assertEquals("{\"weight\":1.0E-10,\"label\":\"I'm a vertex\"}", u.toJson());
    }
}