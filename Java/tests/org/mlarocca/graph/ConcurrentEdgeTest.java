package org.mlarocca.graph;

import org.junit.Test;

import static org.junit.Assert.*;

public class ConcurrentEdgeTest {
    @Test
    public void testHashCode() throws Exception {
        ConcurrentEdge<Integer> v = new ConcurrentEdge<>(0, 0);
        assertEquals(0, v.hashCode());
        v = new ConcurrentEdge<>(0, 1);
        assertNotEquals(0, v.hashCode());
        v = new ConcurrentEdge<>(1, 0);
        assertNotEquals(0, v.hashCode());
        v = new ConcurrentEdge<>(-1, 44);
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
        ConcurrentEdge<Double> e = new ConcurrentEdge<>(source, dest, weight);
        // Notice how labels, which are printed as strings, have a  dot instead of a comma as separator
        assertEquals("Edge(3.14159, 0.12, 2,718)", e.toString());
    }

}