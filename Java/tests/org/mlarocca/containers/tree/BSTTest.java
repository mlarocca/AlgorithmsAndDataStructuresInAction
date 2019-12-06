package org.mlarocca.containers.tree;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.Assert.*;

public class BSTTest {
    // Note: most tests (all except `treeMustBeBalanced`) are guaranteed to succeed because of the unit tests on Treap.
    // However, having this extra tests can allow changing BST's implementation and moving away from using a Treap,
    // without breaking any code using BST.
    private static final Random rnd = new Random();

    @Test
    public void add() {
        BST<String> rst = new BST<>();
        assertEquals(rst.size(), 0);

        assertTrue(rst.add("d"));
        assertEquals(1, rst.size());
        assertTrue(rst.search("d").isPresent());

        assertTrue(rst.add("c"));
        assertEquals(2, rst.size());
        assertTrue(rst.search("c").isPresent());

        assertTrue("Should add duplicate keys", rst.add("c"));
        assertEquals(3, rst.size());
        assertTrue(rst.search("c").isPresent());

        assertTrue(rst.add("e"));
        assertEquals(4, rst.size());
        assertTrue(rst.search("e").isPresent());

        assertTrue(rst.add("f"));
        assertEquals(5, rst.size());
        assertTrue(rst.search("f").isPresent());

        assertTrue(rst.add("a"));
        assertEquals(6, rst.size());
        assertTrue(rst.search("a").isPresent());

        assertTrue(rst.add("a"));
        assertEquals(7, rst.size());
        assertTrue(rst.search("a").isPresent());
    }

    @Test
    public void remove() {
        final List<Integer> keys = IntStream.rangeClosed(0, 8).boxed().collect(Collectors.toList());
        BST<Integer> rst = new BST();

        keys.stream().forEach(i -> rst.add(i));

        assertEquals(keys.size(), rst.size());

        Collections.shuffle(keys);
        keys.stream().forEach(i -> {
            int size = rst.size();
            assertTrue("Remove should succeed", rst.remove(i));
            assertEquals("Treap's size should decrease 1 unit", size - 1, rst.size());
            assertFalse("Element should have been removed", rst.search(i).isPresent());
        });
    }

    @Test
    public void clear() {
        BST<Integer> rst = new BST<>();
        int numElements = 5 + rnd.nextInt(10);
        IntStream.range(0, numElements).forEach(i -> {
            assertTrue(rst.add(rnd.nextInt()));
        });
        assertEquals(numElements, rst.size());
        rst.clear();
        assertEquals(0, rst.size());
        assertTrue(rst.isEmpty());
        rst.add(1);
        assertEquals(1, rst.size());
        assertFalse(rst.isEmpty());
    }

    @Test
    public void min() {
        List<String> keys = Arrays.asList("a", "b", "c", "d", "e", "f", "g");
        Collections.shuffle(keys);
        BST<String> rst = new BST<>();
        for (String str : keys) {
            rst.add(str);
        }
        assertEquals("a", rst.min().get());
    }

    @Test
    public void max() {
        List<String> keys = Arrays.asList("a", "b", "c", "d", "e", "f", "g");
        Collections.shuffle(keys);
        BST<String> rst = new BST<>();
        for (String str : keys) {
            rst.add(str);
        }
        assertEquals("g", rst.max().get());
    }

    @Test
    public void search() {
        List<String> keys = Arrays.asList("a", "b", "c", "d", "e", "f", "g");
        Collections.shuffle(keys);
        final List<Double> priorities = IntStream.rangeClosed(0, 6).boxed().map(i -> rnd.nextDouble()).collect(Collectors.toList());
        BST<String> rst = new BST<>();
        for (String str : keys) {
            rst.add(str);
        }

        // Search by key only
        assertTrue("Should find an existing entry", rst.search("d").isPresent());
        assertFalse("Should return Optional.empty on miss", rst.search("aa").isPresent());
        assertFalse("Should return Optional.empty on miss", rst.search("z").isPresent());
    }

    @Test
    public void isEmpty() {
        BST<Integer> rst = new BST<>();
        assertTrue(rst.isEmpty());

        assertTrue(rst.add(1));
        assertFalse(rst.isEmpty());

        assertTrue(rst.add(2));
        assertFalse(rst.isEmpty());

        assertTrue(rst.add(1));
        assertFalse(rst.isEmpty());

        assertTrue(rst.remove(1));
        assertFalse(rst.isEmpty());

        assertTrue(rst.remove(2));
        assertFalse(rst.isEmpty());

        assertTrue(rst.remove(1));
        assertTrue(rst.isEmpty());
    }

    @Test
    public void size() {
        BST<String> rst = new BST<>();
        assertEquals("Size should be 0 on empty Heap", 0, rst.size());

        rst.add("a");
        rst.add("bcd");
        assertEquals("Size should change on add", 2, rst.size());
        rst.add("a");
        assertEquals("Size should change even when trying to add existing elements", 3, rst.size());
        rst.add("c");
        rst.add("d");
        assertEquals("Size should change on add more than 2 elements", 5, rst.size());
        assertTrue(rst.remove("d"));
        assertEquals("Size should change on remove", 4, rst.size());
        rst.remove("bcd");
        assertEquals("Size should change on remove", 3, rst.size());
    }

    @Test
    public void height() {
        BST<String> rst = new BST<>();
        assertEquals("An empty rst must have height==0", 0, rst.height());

        rst.add("d");
        assertEquals(1, rst.height());

        rst.add("c");
        assertEquals(2, rst.height());

        rst.remove("c");
        assertEquals(1, rst.height());

        rst.add("e");
        assertEquals(2, rst.height());

        rst.add("f");
        assertTrue(rst.height() == 3);

        rst.add("g");
        assertTrue(rst.height() == 4);

        rst.add("x");
        assertTrue(rst.height() == 5);

        rst.add("y");
        assertTrue(rst.height() == 6);

        rst.add("w");
        assertTrue(rst.height() == 6);

        rst.add("z");
        assertTrue(rst.height() == 7);

        rst.add("xyz");
        assertTrue(rst.height() == 7);

        rst.add("a");
        assertTrue(rst.height() == 7);
    }
}