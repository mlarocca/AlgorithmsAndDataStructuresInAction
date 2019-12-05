package org.mlarocca.containers.treap;

import org.junit.Test;

import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.Assert.*;

public class RandomizedSearchTreeTest {
    private static final Random rnd = new Random();

    @Test
    public void add() {
    }

    @Test
    public void remove() {
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

    @Test
    public void isEmpty() {
    }

    @Test
    public void size() {
    }

    @Test
    public void height() {
    }

    @Test
    public void treeMustBeBalanced() {
        RandomizedSearchTree<Integer> rst = new RandomizedSearchTree<>();
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

    private <T extends Comparable<T>> boolean isApproximatelyBalanced(RandomizedSearchTree<T> rst) {
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