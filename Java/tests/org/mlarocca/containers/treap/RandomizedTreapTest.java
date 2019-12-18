package org.mlarocca.containers.treap;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.Assert.*;

public class RandomizedTreapTest {
    // Note: most tests (all except `treeMustBeBalanced`) are guaranteed to succeed because of the unit tests on Treap.
    // However, having this extra tests can allow changing RandomizedSearchTree's implementation and moving away from using a Treap,
    // without breaking any code using RandomizedSearchTree.
    private static final Random rnd = new Random();

    @Test
    public void add() {
        RandomizedTreap<String> rst = new RandomizedTreap<>();
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
        RandomizedTreap<Integer> rst = new RandomizedTreap();

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
        RandomizedTreap<Integer> rst = new RandomizedTreap<>();
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
        RandomizedTreap<String> rst = new RandomizedTreap<>();
        for (String str : keys) {
            rst.add(str);
        }
        assertEquals("a", rst.min().get());
    }

    @Test
    public void max() {
        List<String> keys = Arrays.asList("a", "b", "c", "d", "e", "f", "g");
        Collections.shuffle(keys);
        RandomizedTreap<String> rst = new RandomizedTreap<>();
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
        RandomizedTreap<String> rst = new RandomizedTreap<>();
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
        RandomizedTreap<Integer> rst = new RandomizedTreap<>();
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
        RandomizedTreap<String> rst = new RandomizedTreap<>();
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
        RandomizedTreap<String> rst = new RandomizedTreap<>();
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
        assertTrue(rst.height() >= 2);

        rst.add("g");
        assertTrue(rst.height() >= 3);

        rst.add("x");
        assertTrue(rst.height() >= 3);

        rst.add("y");
        assertTrue(rst.height() >= 3);

        rst.add("w");
        assertTrue(rst.height() >= 3);

        rst.add("z");
        assertTrue(rst.height() >= 4);

        rst.add("xyz");
        assertTrue(rst.height() >= 4);
    }

    @Test
    public void treeMustBeBalanced() {
        RandomizedTreap<Integer> rst = new RandomizedTreap<>();
        int size = 2000 + rnd.nextInt(1000);
        List<Integer> keys = IntStream.range(0, size).boxed().collect(Collectors.toList());
        //Collections.shuffle(keys);
        // Test the worst possible insertion sequence: a sorted list
        for (int i = 0; i < size; i++) {
           assertTrue(rst.add(keys.get(i)));
           assertTrue(rst.checkBSTInvariants());
           assertTrue(rst.checkTreapInvariants());
        }
        assertEquals(size, rst.size());
        assertTrue("The tree should be balanced after a statistically relevant number of insertions",
                isApproximatelyBalanced(rst));

        //List<Integer> keys = IntStream.range(0, size).boxed().collect(Collectors.toList());
        Collections.shuffle(keys);

        for (int i = 0; i < size / 2; i++) {
            rst.remove(keys.get(i));
            assertTrue("The tree should keep balanced after deleting entries", isApproximatelyBalanced(rst));
        }
    }

    private <T extends Comparable<T>> boolean isApproximatelyBalanced(RandomizedTreap<T> rst) {
        // Use a relaxed condition to check if a tree is balanced: it's enough that the height is proportional
        // to the logarithm of the number of elements (within a factor 3, in particular)
        int n = rst.size();
        int h = rst.height();
        if (n == 0) {
            return true;
        }
        // log_{b}(n) = log_{a}(n) / log_{a}(b)
        return h <= 3 * Math.log10(n) / Math.log10(2);
    }
}