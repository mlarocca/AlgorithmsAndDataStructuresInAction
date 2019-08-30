package org.mlarocca.huffman;

import org.junit.Test;
import org.mlarocca.containers.priorityqueue.PriorityQueue;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class HuffmanTest {
    private static final String Text =
            "fffeeeeeddddddcccccccbbbbbbbbbbbbbbbbbbbbbbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    private static final Map<Character, Long> ExpectedFrequenciesMap = new HashMap<>();
    private static final Map<Character, String> ExpectedEncoding = new HashMap<>();

    private static final List<Character> ExpectedSymbols = Arrays.asList('f', 'e', 'd', 'c', 'b', 'a');

    static {
        ExpectedFrequenciesMap.put('a', 57L);
        ExpectedFrequenciesMap.put('b', 22L);
        ExpectedFrequenciesMap.put('c', 7L);
        ExpectedFrequenciesMap.put('d', 6L);
        ExpectedFrequenciesMap.put('e', 5L);
        ExpectedFrequenciesMap.put('f', 3L);

        ExpectedEncoding.put('a', "0");
        ExpectedEncoding.put('b', "10");
        ExpectedEncoding.put('c', "1100");
        ExpectedEncoding.put('d', "1101");
        ExpectedEncoding.put('e', "1110");
        ExpectedEncoding.put('f', "1111");
    };

    @Test
    public void encode() throws Exception {

    }

    @Test
    public void createEncoding() throws Exception {
        Huffman.Node root = Huffman.computeFrequenciesTree(
                Huffman.createFrequenciesQueue(
                        Huffman.computeFrequencies(Text)));
        assertEquals(ExpectedEncoding, Huffman.createEncoding(root));
    }

    @Test
    public void computeFrequenciesTree() throws Exception {
        Huffman.Node root = Huffman.computeFrequenciesTree(
                Huffman.createFrequenciesQueue(
                        Huffman.computeFrequencies(Text)));

        assertEquals(Arrays.asList('a', 'b', 'c', 'd', 'e', 'f'), root.getSymbols());
        assertEquals(100.0, root.getPriority(), 0.001);
    }

    @Test
    public void createFrequenciesQueue() throws Exception {
        PriorityQueue<Huffman.Node> queue = Huffman.createFrequenciesQueue(
                Huffman.computeFrequencies(Text));
        List<Double> charFrequencies = new ArrayList<>();
        List<List<Character>> charSymbols = new ArrayList<>();
        while (!queue.isEmpty()) {
            Optional<Huffman.Node> node = queue.top();
            assertTrue(node.isPresent());
            charFrequencies.add(node.get().getPriority());
            charSymbols.add(node.get().getSymbols());
        }

        // Frequencies should be sorted from smaller to larger
        List<Double> expectedFrequencies = ExpectedFrequenciesMap.values().stream()
                .map(i -> i.doubleValue())
                .sorted()
                .collect(Collectors.toList());

        assertEquals(expectedFrequencies, charFrequencies);

        // Likewise, symbols should be sorted by their document frequency
        List<List<Character>> expectedSymbols = ExpectedFrequenciesMap.entrySet().stream()
                .sorted((o1, o2) -> o1.getValue() <= o2.getValue() ? -1 : 1)
                .map(entry -> Arrays.asList(entry.getKey()))
                .collect(Collectors.toList());
        assertEquals(expectedSymbols, charSymbols);
    }

    @Test
    public void computeFrequencies() throws Exception {
        Map<Character, Long> frequencies = Huffman.computeFrequencies(Text);
        assertEquals(ExpectedFrequenciesMap, frequencies);
    }

}