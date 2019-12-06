package org.mlarocca.containers.treap;

import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;
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
    public void add() {
        Treap<String, Double> treap = new Treap<>();
        assertEquals(treap.size(), 0);

        assertTrue(treap.add(new Treap.TreapEntry<>("d", 1.0)));
        assertEquals(1, treap.size());
        assertTrue(treap.contains(new Treap.TreapEntry<>("d", 1.0)));

        assertTrue(treap.add(new Treap.TreapEntry<>("c", 2.0)));
        assertEquals(2, treap.size());
        assertTrue(treap.contains(new Treap.TreapEntry<>("c", 2.0)));

        assertTrue(treap.add(new Treap.TreapEntry<>("c", 2.0)));
        assertEquals(3, treap.size());
        assertTrue(treap.contains(new Treap.TreapEntry<>("c", 2.0)));

        assertTrue(treap.add(new Treap.TreapEntry<>("e", -1.0)));
        assertEquals(4, treap.size());
        assertTrue(treap.contains(new Treap.TreapEntry<>("e", -1.0)));

        assertTrue(treap.add(new Treap.TreapEntry<>("f", 0.0)));
        assertEquals(5, treap.size());
        assertTrue(treap.contains(new Treap.TreapEntry<>("f", 0.0)));

        assertTrue(treap.add(new Treap.TreapEntry<>("a", 2.0)));
        assertEquals(6, treap.size());
        assertTrue(treap.contains(new Treap.TreapEntry<>("a", 2.0)));

        assertTrue(treap.add(new Treap.TreapEntry<>("a", 123.0)));
        assertEquals(7, treap.size());
        assertTrue(treap.contains(new Treap.TreapEntry<>("a", 123.0)));
    }

    @Test
    public void updatePriority() {
        Treap<String, Integer> treap = initTreap(Arrays.asList("a", "b", "c", "d", "e", "f", "g"),
                java.util.stream.IntStream.rangeClosed(0, 6).boxed().collect(Collectors.toList()));

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
        final List<Integer> keys = IntStream.rangeClosed(0, 8).boxed().collect(Collectors.toList());
        final List<Double> priorities = keys.stream().map(i -> rnd.nextDouble()).collect(Collectors.toList());
        Treap<Integer, Double> treap = initTreap(keys, priorities);

        assertEquals(keys.size(), treap.size());

        Collections.shuffle(keys);
        keys.stream().forEach(i -> {
            int size = treap.size();
            assertTrue("Remove should succeed", treap.remove(new Treap.TreapEntry<>(i, priorities.get(i))));
            assertEquals("Treap's size should decrease 1 unit", size - 1, treap.size());
            assertFalse("Element should have been removed", treap.contains(new Treap.TreapEntry<>(i, priorities.get(i))));
        });
    }

    @Test
    public void removeKey() {
        final List<Integer> keys = IntStream.rangeClosed(0, 8).boxed().collect(Collectors.toList());
        final List<Double> priorities = keys.stream().map(i -> rnd.nextDouble()).collect(Collectors.toList());
        final Treap<Integer, Double> treap = initTreap(keys, priorities);

        assertEquals(keys.size(), treap.size());

        Collections.shuffle(keys);
        keys.stream().forEach(i -> {
            int size = treap.size();
            assertTrue("Remove should succeed", treap.removeKey(i));
            assertEquals("Treap's size should decrease 1 unit", size - 1, treap.size());
            assertFalse("Element should have been removed", treap.contains(new Treap.TreapEntry<>(i, priorities.get(i))));
        });

        // Should also handle duplicates
        final Treap<Integer, Double> treap2 = initTreap(keys, priorities);
        treap2.add(new Treap.TreapEntry<>(0, -10.));
        assertEquals(keys.size() + 1, treap2.size());

        assertTrue(treap2.removeKey(0));
        assertEquals(keys.size(), treap2.size());
        assertTrue("A copy of the duplicate key should still be stored", treap2.search(0).isPresent());

        assertTrue(treap2.removeKey(0));
        assertEquals(keys.size() - 1, treap2.size());
        assertTrue("All copies of key 0 should be removed", treap2.search(0).isEmpty());
    }

    @Test
    public void clear() {
        Treap<Integer, Double> treap = new Treap<>();
        int numElements = 5 + rnd.nextInt(10);
        IntStream.range(0, numElements).forEach(i -> {
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
    public void size() {
        Treap<String, Double> treap = new Treap<>();
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
    public void height() {
        Treap<String, Double> treap = new Treap<>();
        assertEquals("An empty treap must have height==0", 0, treap.height());

        treap.add(new Treap.TreapEntry<>("d", 1.0));
        assertEquals(1, treap.height());

        treap.add(new Treap.TreapEntry<>("c", 2.0));
        assertEquals(2, treap.height());

        treap.remove(new Treap.TreapEntry<>("c", 2.0));
        assertEquals(1, treap.height());

        treap.add(new Treap.TreapEntry<>("e", -1.0));
        assertEquals(2, treap.height());

        treap.add(new Treap.TreapEntry<>("f", 0.0));
        assertEquals(2, treap.height());

        treap.add(new Treap.TreapEntry<>("c", 2.0));
        assertEquals(3, treap.height());

        treap.add(new Treap.TreapEntry<>("x", 4.0));
        assertEquals(3, treap.height());

        treap.add(new Treap.TreapEntry<>("y", 5.0));
        assertEquals(4, treap.height());

        treap.add(new Treap.TreapEntry<>("w", 6.0));
        assertEquals(4, treap.height());

        treap.add(new Treap.TreapEntry<>("z", 7.0));
        assertEquals(5, treap.height());

        treap.add(new Treap.TreapEntry<>("xy", 7.0));
        assertEquals(5, treap.height());
    }

    @Test
    public void isEmpty() {
        Treap<Integer, Double> treap = new Treap<>();
        assertTrue(treap.isEmpty());

        assertTrue(treap.add(new Treap.TreapEntry<>(1, 1.1)));
        assertFalse(treap.isEmpty());

        assertTrue(treap.add(new Treap.TreapEntry<>(2, -1.1)));
        assertFalse(treap.isEmpty());

        assertTrue(treap.add(new Treap.TreapEntry<>(1, 1.1)));
        assertFalse(treap.isEmpty());

        assertTrue(treap.remove(new Treap.TreapEntry<>(1, 1.1)));
        assertFalse(treap.isEmpty());

        assertTrue(treap.remove(new Treap.TreapEntry<>(2, -1.1)));
        assertFalse(treap.isEmpty());

        assertTrue(treap.remove(new Treap.TreapEntry<>(1, 1.1)));
        assertTrue(treap.isEmpty());
    }

    @Test
    public void min() {
        List<String> keys = Arrays.asList("a", "b", "c", "d", "e", "f", "g");
        Collections.shuffle(keys);
        Treap<String, Integer> treap = initTreap(keys, java.util.stream.IntStream.rangeClosed(0, 6).boxed().collect(Collectors.toList()));

        assertEquals("a", treap.min().get());
    }

    @Test
    public void max() {
        List<String> keys = Arrays.asList("a", "b", "c", "d", "e", "f", "g");
        Collections.shuffle(keys);
        Treap<String, Integer> treap = initTreap(keys, java.util.stream.IntStream.rangeClosed(0, 6).boxed().collect(Collectors.toList()));

        assertEquals("g", treap.max().get());
    }

    @Test
    public void search() {
        Treap<String, Double> treap = initTreap(Arrays.asList("a", "b", "c", "d", "e", "f", "g"),
                java.util.stream.IntStream.rangeClosed(0, 6).boxed().map(i -> rnd.nextDouble()).collect(Collectors.toList()));

        // Search by key only
        assertEquals("Should find an existing entry", "d", treap.search("d").get());
        assertTrue("Should not fail on miss", treap.search("z").isEmpty());
    }

    @Test
    public void contains() {
        final List<Double> priorities = IntStream.rangeClosed(0, 6).boxed().map(i -> rnd.nextDouble()).collect(Collectors.toList());
        Treap<String, Double> treap = initTreap(Arrays.asList("a", "b", "c", "d", "e", "f", "g"),
                priorities);

        // Search by key only
        assertTrue("Should find an existing entry", treap.contains(new Treap.TreapEntry<>("d", priorities.get(3))));
        assertFalse("Should not fail on miss", treap.contains(new Treap.TreapEntry<>("d", -3.1415)));
        assertFalse("Should not fail on miss", treap.contains(new Treap.TreapEntry<>("z", 1.1)));
    }

    private <K extends Comparable<K>, P extends Comparable<P>> Treap<K, P> initTreap(List<K> keys, List<P> priorities) {
        if (keys.size() != priorities.size()) {
            throw new IllegalArgumentException("Both lists must have the same length");
        }

        Treap<K, P> treap = new Treap<>();
        for (int i = 0; i < keys.size(); i++) {
            treap.add(new Treap.TreapEntry<>(keys.get(i), priorities.get(i)));
        }
        return treap;
    }
}