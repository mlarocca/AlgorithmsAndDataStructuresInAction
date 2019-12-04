package org.mlarocca.containers.treap;

import org.junit.Test;

import java.util.Optional;
import java.util.Random;
import java.util.stream.IntStream;

import static org.junit.Assert.*;

public class TreapTest {
    private static final Random rnd = new Random();

    @Test
    public void top() {
        Treap<String, Double> treap = new Treap<>();
        Optional<Treap.Entry<String, Double>> result = treap.top();

        assertFalse("top() should return an empty optional when the treap is empty", result.isPresent());
        treap.add(new Treap.TreapEntry<>("primo", 1.0));
        result = treap.top();
        assertTrue("top() should return an valid optional when the treap is empty", result.isPresent());
        assertEquals("top() should return the only element in the treap",
                "primo",
                result.get().getKey());

        treap.add(new Treap.TreapEntry<>("primo", 1.0));
        treap.add(new Treap.TreapEntry<>("secondo", -1.0));
        treap.add(new Treap.TreapEntry<>("a", 11.0));
        treap.add(new Treap.TreapEntry<>("b", 0.0));
        treap.add(new Treap.TreapEntry<>("c", -0.99));
        result = treap.top();
        assertEquals("top() should return the highest priority element in the treap",
                "secondo",
                result.get().getKey());

        IntStream.range(0, 10).forEach(i -> {
            treap.add(new Treap.TreapEntry<>("" + rnd.nextInt(), rnd.nextDouble()));
            assertTrue(treap.checkTreapInvariants());
        });
        while (!treap.isEmpty()) {
            assertTrue(treap.checkTreapInvariants());
            treap.top();
        }
    }

    @Test
    public void peek() {
        Treap<String, Double> treap = new Treap<>();
        Optional<Treap.Entry<String, Double>> result = treap.peek();

        assertTrue("peek() should return an empty optional when the treap is empty", result.isEmpty());
        treap.add(new Treap.TreapEntry<>("primo", 1e14));
        result = treap.peek();
        assertTrue("peek() should return a valid optional when the treap is empty", result.isPresent());
        assertEquals("peek() should return the only element in the treap", "primo", result.get().getKey());

        treap.add(new Treap.TreapEntry<>("b", 0.0));
        treap.add(new Treap.TreapEntry<>("c", -0.99));
        treap.add(new Treap.TreapEntry<>("secondo", -1.0));
        treap.add(new Treap.TreapEntry<>("a", 11.0));
        result = treap.peek();
        assertEquals("peek() should return the highest priority element in the treap", "secondo", result.get().getKey());
    }

    @Test
    public void contains() {
    }

    @Test
    public void add() {
    }

    @Test
    public void updatePriority() {
        Treap<String, Integer> treap = new Treap<>();
        treap.add(new Treap.TreapEntry<>("a", 0));
        treap.add(new Treap.TreapEntry<>("b", 1));
        treap.add(new Treap.TreapEntry<>("c", 2));
        treap.add(new Treap.TreapEntry<>("d", 3));
        treap.add(new Treap.TreapEntry<>("e", 4));
        treap.add(new Treap.TreapEntry<>("f", 5));
        treap.add(new Treap.TreapEntry<>("g", 6));

        assertFalse("Should return false for keys not in the treap",
                treap.updatePriority(new Treap.TreapEntry<>("d", 2), new Treap.TreapEntry<>("d", 1)));
        assertFalse("Should return false if the priority doesn't match what's in the treap",
                treap.updatePriority(new Treap.TreapEntry<>("a", -1), new Treap.TreapEntry<>("a", 0)));
        assertFalse("Should return false if priority doesn't change",
                treap.updatePriority(new Treap.TreapEntry<>("a", 0), new Treap.TreapEntry<>("a", 0)));

        assertTrue("Should return true for legitimate update of an existing key's priority",
                treap.updatePriority(new Treap.TreapEntry<>("b", 1), new Treap.TreapEntry<>("b", 7)));
        assertTrue("Update Priority shouldn't mess treap up", treap.checkTreapInvariants());
        assertFalse("After updatePriority the new element should not be in the heap",
                treap.contains(new Treap.TreapEntry<>("b", 1)));
        assertTrue("After updatePriority the old element should be in the heap",
                treap.contains(new Treap.TreapEntry<>("b", 7)));

        assertTrue("Should return true for legitimate update of an existing key's priority",
                treap.updatePriority(new Treap.TreapEntry<>("c", 2), new Treap.TreapEntry<>("c", -1)));
        assertTrue("Update Priority shouldn't mess treap up", treap.checkTreapInvariants());
        assertEquals("Should update priority successfully", "c", treap.top().get().getKey());

        assertTrue("Should update root's priority successfully",
                treap.updatePriority(new Treap.TreapEntry<>("a", 0), new Treap.TreapEntry<>("a", 4)));
        assertTrue("Update Priority shouldn't mess treap up", treap.checkTreapInvariants());
        assertEquals("Should update root's priority successfully", "d", treap.top().get().getKey());



    }

    @Test(expected = IllegalArgumentException.class)
    public void updatePriorityFail() {
        Treap<String, Integer> treap = new Treap<>();
        treap.add(new Treap.TreapEntry<>("a", 0));
        // Should throw if the keys don't match
        treap.updatePriority(new Treap.TreapEntry<>("a", 2), new Treap.TreapEntry<>("c", 2));
    }

    @Test
    public void remove() {
    }

    @Test
    public void size() {
        Treap<String, Double> treap = new Treap<>();
        Optional<Treap.Entry<String, Double>> result = treap.peek();
        assertEquals("Size should be 0 on empty Heap", 0, treap.size());

        treap.add(new Treap.TreapEntry<>("a", 1.0));
        treap.add(new Treap.TreapEntry<>("bcd", -1.0));
        assertEquals("Size should change on add", 2, treap.size());
        treap.add(new Treap.TreapEntry<>("a", 1.0));
        assertEquals("Size should change even when trying to add existing elements", 3, treap.size());
        treap.add(new Treap.TreapEntry<>("c", 3.1415));
        treap.add(new Treap.TreapEntry<>("d", 3.1415));
        assertEquals("Size should change on add more than 2 elements", 5, treap.size());
        assertTrue(treap.remove(new Treap.TreapEntry<>("d", 3.1415)));
        assertEquals("Size should change on remove", 4, treap.size());
        treap.remove(new Treap.TreapEntry<>("bcd", -1.0));
        assertEquals("Size should change on remove", 3, treap.size());
        treap.peek();
        assertEquals("Size should NOT change on peek", 3, treap.size());
        treap.top();
        assertEquals("Size should change on remove top", 2, treap.size());
        treap.top();
        assertEquals("Size should change on remove top", 1, treap.size());
    }

    @Test
    public void isEmpty() {
    }

    @Test
    public void clear() {
        Treap<Integer, Double> treap = new Treap<>();
        int numElements = 5 + rnd.nextInt(10);
        IntStream.range(0 , numElements).forEach(i -> {
            assertTrue(treap.add(new Treap.TreapEntry(i, rnd.nextDouble())));
        });
        assertEquals(numElements, treap.size());
        treap.clear();
        assertEquals(0, treap.size());
        assertTrue(treap.isEmpty());
        treap.add(new Treap.TreapEntry(1, 0.0));
        assertEquals(1, treap.size());
        assertFalse(treap.isEmpty());
    }

    @Test
    public void min() {
    }

    @Test
    public void max() {
    }

    @Test
    public void search() {
    }
}