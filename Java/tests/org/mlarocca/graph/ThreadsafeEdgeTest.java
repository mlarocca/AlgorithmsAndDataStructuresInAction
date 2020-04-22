package org.mlarocca.graph;

import org.junit.Test;

import static org.junit.Assert.*;

public class ThreadsafeEdgeTest {
    @Test
    public void testHashCode() throws Exception {
        ThreadsafeEdge<Integer> v = new ThreadsafeEdge<>(0, 0);
        assertEquals(0, v.hashCode());
        v = new ThreadsafeEdge<>(0, 1);
        assertNotEquals(0, v.hashCode());
        v = new ThreadsafeEdge<>(1, 0);
        assertNotEquals(0, v.hashCode());
        v = new ThreadsafeEdge<>(-1, 44);
        assertNotEquals(0, v.hashCode());
    }

    @Test
    public void testEquals() throws Exception {

    }

    @Test
    public void testToString() throws Exception {
        Double source = 3.14159;
        Double dest = 0.12;
        Double weight = Math.E;
        ThreadsafeEdge<Double> e = new ThreadsafeEdge<>(source, dest, weight);
        // Notice how labels, which are printed as strings, have a  dot instead of a comma as separator
        assertEquals("Edge(3.14159 -> 0.12 | 2,718)", e.toString());
    }
    @Test
    public void testToJson() throws Exception {
        ThreadsafeEdge<Double> e1 = new ThreadsafeEdge<>(3.14159, -0.2);
        assertEquals("{\"destination\":{\"weight\":1.0,\"label\":-0.2},\"weight\":1.0,\"source\":{\"weight\":1.0,\"label\":3.14159}}", e1.toJson());
        ThreadsafeEdge<String> e2 = new ThreadsafeEdge<String>("u", "v", 1.4);
        assertEquals("{\"destination\":{\"weight\":1.0,\"label\":\"v\"},\"weight\":1.4,\"source\":{\"weight\":1.0,\"label\":\"u\"}}", e2.toJson());
    }
}