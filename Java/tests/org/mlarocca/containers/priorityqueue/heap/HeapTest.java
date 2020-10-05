package org.mlarocca.containers.priorityqueue.heap;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.IntStream;

import static org.junit.Assert.*;


public class HeapTest {
    private static final Random rnd = new Random();

    private Heap<String> heap;

    @Before
    public void setUp() throws Exception {
        heap = new Heap<>();
    }

    @Test
    public void top() throws Exception {
        Arrays.asList(2, 3, 4, 5).forEach(branchingFactor -> {
            heap = new Heap<>(branchingFactor);
            Optional<String> result = heap.top();

            assertFalse("top() should return an empty optional when the heap is empty", result.isPresent());
            heap.add("primo");
            result = heap.top();
            assertTrue("top() should return an valid optional when the heap is empty", result.isPresent());
            assertEquals("top() should return the only element in the heap", "primo", result.get());

            heap.add("primo");
            heap.add("secondo");
            heap.add("a");
            heap.add("b");
            heap.add("c");
            result = heap.top();
            assertEquals("top() should return the highest priority element in the heap", "a", result.get());

            IntStream.range(0, 10).forEach(i -> {
                heap.add("" + rnd.nextInt());
                assertTrue(heap.checkHeapInvariants());
            });
            while (!heap.isEmpty()) {
                assertTrue(heap.checkHeapInvariants());
                heap.top();
            }
        });
    }

    @Test
    public void clear() throws Exception {
        Arrays.asList(2, 3, 4, 5).forEach(branchingFactor -> {
            Heap<Integer> heap = new Heap<>();
            int numElements = 5 + rnd.nextInt(10);
            IntStream.range(0, numElements).forEach(i -> {
                assertTrue(heap.add(i));
            });
            assertEquals(numElements, heap.size());
            heap.clear();
            assertEquals(0, heap.size());
            assertTrue(heap.isEmpty());
            heap.add(1);
            assertEquals(1, heap.size());
            assertFalse(heap.isEmpty());
        });
    }

    @Test
    public void peek() throws Exception {
        Optional<String> result = heap.peek();

        assertFalse("peek() should return an empty optional when the heap is empty", result.isPresent());
        heap.add("primo");
        result = heap.peek();
        assertTrue("peek() should return an valid optional when the heap is empty", result.isPresent());
        assertEquals("peek() should return the only element in the heap", "primo", result.get());

        heap.add("b");
        heap.add("a");
        heap.add("secondo");
        heap.add("c");
        result = heap.peek();
        assertEquals("peek() should return the highest priority element in the heap", "a", result.get());
    }

    @Test
    public void addHasRemove() throws Exception {
        Arrays.asList(2, 3, 4, 5).forEach(branchingFactor -> {
            heap = new Heap<>(branchingFactor);
            assertFalse("contains() should return false on a empty heap", heap.contains("any"));
            heap.add("primo");
            assertTrue("contains() should return true for an existing element", heap.contains("primo"));
            assertFalse("contains() should return false if the element is not in the heap", heap.contains("any"));

            heap.add("b");
            heap.add("a");
            heap.add("secondo");
            heap.add("c");
            assertTrue("contains() should return true for an existing element ('primo')", heap.contains("primo"));
            assertTrue("contains() should return true for an existing element ('secondo')", heap.contains("secondo"));
            assertTrue("contains() should return true for an existing element ('a')", heap.contains("a"));
            assertTrue("contains() should return true for an existing element ('b')", heap.contains("b"));
            assertTrue("contains() should return true for an existing element ('c')", heap.contains("c"));
            assertFalse("contains() should return false if the element is not in the heap", heap.contains("any"));

            heap.remove("b");
            heap.remove("c");

            assertTrue("contains() should return true for an existing element ('primo')", heap.contains("primo"));
            assertTrue("contains() should return true for an existing element ('secondo')", heap.contains("secondo"));
            assertTrue("contains() should return true for an existing element ('a')", heap.contains("a"));
            assertFalse("contains() should return false if the element is not in the heap ('c')", heap.contains("c"));
            assertFalse("contains() should return false if the element is not in the heap ('b')", heap.contains("b"));
            assertFalse("contains() should return false if the element is not in the heap ('any')", heap.contains("any"));

            heap.add("terzo");
            assertTrue("contains() should return true for an existing element ('primo')", heap.contains("primo"));
            assertTrue("contains() should return true for an existing element ('secondo')", heap.contains("secondo"));
            assertTrue("contains() should return true for an existing element ('terzo')", heap.contains("terzo"));
            assertTrue("contains() should return true for an existing element ('a')", heap.contains("a"));
            assertFalse("contains() should return false if the element is not in the heap ('c')", heap.contains("c"));
            assertFalse("contains() should return false if the element is not in the heap ('b')", heap.contains("b"));
            assertFalse("contains() should return false if the element is not in the heap ('any')", heap.contains("any"));

            heap.remove("terzo");
            assertFalse("contains() should return false after the top element contains been removed using remove()", heap.contains("terzo"));

            heap.top();
            assertFalse("contains() should return false after the top element contains been removed using top()", heap.contains("a"));
        });
    }

    @Test
    public void updatePriority() throws Exception {
        Arrays.asList(2, 3, 4, 5).forEach(branchingFactor -> {
            heap = new Heap<>(branchingFactor);
            heap.add("a");
            heap.add("b");
            heap.add("c");
            heap.add("d");
            heap.add("e");
            heap.updatePriority("c", "f");
            assertEquals("Should update priority successfully", "a", heap.top().get());
            assertEquals("Should update priority successfully", "b", heap.top().get());
            assertEquals("Should update priority successfully", "d", heap.top().get());
        });
    }

    @Test
    public void heapify() throws Exception {
        Arrays.asList(2, 3, 4, 5).forEach(branchingFactor -> {
            List<Double> elements = Arrays.asList(-1.0, 0.0, Math.E, 1.0, -3.14);
            Heap<Double> iHeap = new Heap<>(elements, branchingFactor);

            assertEquals("Size should be 0 on empty Heap", elements.size(), iHeap.size());

            List<Double> results = new ArrayList<>();
            List<Double> expected = Arrays.asList(-3.14, -1.0, 0.0, 1.0, Math.E);

            while (!iHeap.isEmpty()) {
                results.add(iHeap.top().get());
            }

            assertArrayEquals("Heap was not created correctly", results.toArray(), expected.toArray());
        });
    }

    @Test(expected = NullPointerException.class)
    public void heapifyConstructorOnNullElements() throws Exception {
        new Heap<>(null, 2);
    }

    @Test
    public void size() throws Exception {
        Assert.assertEquals("Size should be 0 on empty Heap", 0, heap.size());

        heap.add("a");
        heap.add("bcd");
        Assert.assertEquals("Size should change on add", 2, heap.size());
        heap.add("a");
        assertEquals("Size should NOT change when trying to add existing elements", 2, heap.size());
        heap.add("c");
        heap.add("d");
        assertEquals("Size should change on add more than 2 elements", 4, heap.size());
        heap.remove("d");
        assertEquals("Size should change on remove", 3, heap.size());
        heap.remove("bcd");
        assertEquals("Size should change on remove", 2, heap.size());
        heap.peek();
        assertEquals("Size should NOT change on peek", 2, heap.size());
        heap.top();
        assertEquals("Size should change on remove top", 1, heap.size());
        heap.top();
        assertEquals("Size should change on remove top", 0, heap.size());
    }

    @Test
    public void getFirstChildIndex() throws Exception {
        assertEquals("First Child, edge case", heap.getFirstChildIndex(0), 1);
        assertEquals("First Child, random", heap.getFirstChildIndex(2), 5);
        assertEquals("Parent/Child transform should be invertible", heap.getParentIndex(heap.getFirstChildIndex(2)), 2);
    }

    @Test
    public void getParentIndex() throws Exception {
        assertEquals("First Child, edge case", heap.getParentIndex(0), 0);
        assertEquals("First Child, first level", heap.getParentIndex(1), 0);
        assertEquals("First Child, first level", heap.getParentIndex(2), 0);
        assertEquals("First Child, second level", heap.getParentIndex(3), 1);
        assertEquals("First Child, second level", heap.getParentIndex(4), 1);
        assertEquals("First Child, random", heap.getParentIndex(6), 2);
        assertEquals("Child/Parent transform should NOT be invertible",
                heap.getFirstChildIndex(heap.getParentIndex(2)), 1);
    }

    @Test
    public void testMultiThreading() throws Exception {
        int maxWait = 5;
        int branchingFactor = 2 + rnd.nextInt(5);

        Heap<String> heap = new Heap<>(branchingFactor);

        ExecutorService executor = Executors.newFixedThreadPool(10);

        List<String> englishWords = new ArrayList<>(
                Arrays.asList("this", "is", "just", "to", "test", "concurrent", "access", "for", "synchronized",
                        "cache"));

        List<String> italianWords = new ArrayList<>(
                Arrays.asList("prova", "sul", "funzionamento", "di", "una", "cache+", "condivisa", "in", "ambiente",
                        "multi-threaded"));

        Function<List<String>, Runnable> heapFillerGen = (words) -> () ->
                words.forEach(w -> {
                    try {
                        heap.add(w);
                        assertTrue(heap.checkHeapInvariants());
                        Thread.sleep(1 + rnd.nextInt(maxWait / 2));
                    } catch (InterruptedException e) {
                        throw new IllegalStateException(e);
                    }
                });

        Runnable englishWordsSetter = heapFillerGen.apply(englishWords);
        Runnable italianWordsSetter = heapFillerGen.apply(italianWords);

        Function<Integer, Runnable> heapGetterGen = (runs) -> () -> {
            try {
                Thread.sleep(1 + rnd.nextInt(maxWait));
                IntStream.range(0, runs).forEach(j -> {
                    heap.top();
                    assertTrue(heap.checkHeapInvariants());
                });
            } catch (InterruptedException e) {
                throw new IllegalStateException(e);
            }
        };

        int numGets = 5;
        Runnable wordsGetter = heapGetterGen.apply(numGets);

        executor.execute(englishWordsSetter);
        executor.execute(italianWordsSetter);
        // Make sure the first few words have been added;
        Thread.sleep(2 * maxWait);

        executor.execute(wordsGetter);

        // Wait till we are sure all threads are done
        try {
            executor.awaitTermination(50 * maxWait, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            throw new AssertionError("Computation was stuck");
        }

        // Check that all elements have been added to the heap
        assertEquals("All elements should have been added",
                englishWords.size() + italianWords.size() - numGets, heap.size());

        // Check that all entries are ordered by length (b/c we used it as priority)
        String prevStr = "";
        assertTrue(heap.checkHeapInvariants());
        while (!heap.isEmpty()) {
            String word = heap.top().get();
            assertTrue(word.compareTo(prevStr) > 0);
            prevStr = word;
        }
    }
}