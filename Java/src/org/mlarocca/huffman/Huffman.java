package org.mlarocca.huffman;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.heap.Heap;
import org.mlarocca.containers.priorityqueue.PriorityQueue;

import java.util.*;

public class Huffman {

    private Huffman() {
    }

    public static Map<Character, String> encode(String text) {
        return createEncoding(computeFrequenciesTree(createFrequenciesQueue(computeFrequencies(text))));
    }

    @VisibleForTesting
    protected static Map<Character, String> createEncoding(Node frequenciesTree) {
        return frequenciesTree.createEncoding();
    }

    @VisibleForTesting
    protected static Node computeFrequenciesTree(PriorityQueue<Node> frequenciesQueue) {
        while (frequenciesQueue.size() > 1) {
            Optional<Node> right = frequenciesQueue.top();
            Optional<Node> left = frequenciesQueue.top();
            List<Character> symbols = new ArrayList<>(left.map(n -> n.symbols).orElse(Collections.EMPTY_LIST));
            symbols.addAll(right.map(n -> n.symbols).orElse(Collections.EMPTY_LIST));
            Double priority = left.map(n -> n.priority).orElse(0.) + right.map(n -> n.priority).orElse(0.);
            frequenciesQueue.add(new Node(symbols, priority, left, right));
        }

        return frequenciesQueue.top().get();
    }

    @VisibleForTesting
    protected static PriorityQueue<Node> createFrequenciesQueue(Map<Character, Long> frequencies) {
        List<Node> elements = new ArrayList<>();
        List<Double> priorities = new ArrayList<>();

        for (Map.Entry<Character, Long> entry : frequencies.entrySet()) {
            double priority = entry.getValue().doubleValue();
            elements.add(new Node(Arrays.asList(entry.getKey()), priority, Optional.empty(), Optional.empty()));
            priorities.add(priority);
        }

        return new Heap<>(elements, 3);
    }

    @VisibleForTesting
    protected static Map<Character, Long> computeFrequencies(String text) {
        Map<Character, Long> frequencyMap = new HashMap<>();
        for (Character c : text.toCharArray()) {
            frequencyMap.putIfAbsent(c, 0L);
            frequencyMap.compute(c, (key, freq) -> freq + 1L);
        }

        return frequencyMap;
    }

    @VisibleForTesting
    protected static class Node implements Comparable<Node> {
        private final List<Character> symbols;
        private final Double priority;
        private final Optional<Node> left;
        private final Optional<Node> right;

        public Node(List<Character> symbols, Double priority, Optional<Node> left, Optional<Node> right) {
            this.symbols = symbols;
            this.priority = priority;
            this.left = left;
            this.right = right;
        }

        @VisibleForTesting
        protected List<Character> getSymbols() {
            // Make a copy to avoid leaking access to internal fields;
            return new ArrayList<>(this.symbols);
        }

        @VisibleForTesting
        protected double getPriority() {
            // Auto unboxing
            return this.priority;
        }

        public Map<Character, String> createEncoding() {

            Map<Character, String> leftEncodingTable = left.map(Node::createEncoding).orElse(Collections.EMPTY_MAP);
            Map<Character, String> rightEncodingTable = right.map(Node::createEncoding).orElse(Collections.EMPTY_MAP);

            Map<Character, String> encodingTable = new HashMap<>();

            for (Map.Entry<Character, String> entry : leftEncodingTable.entrySet()) {
                encodingTable.put(entry.getKey(), encodeLeftPath(entry.getValue()));
            }
            for (Map.Entry<Character, String> entry : rightEncodingTable.entrySet()) {
                encodingTable.put(entry.getKey(), encodeRightPath(entry.getValue()));
            }

            if (this.symbols.size() == 1) {
                encodingTable.put(symbols.get(0), "");
            }

            return encodingTable;
        }

        private static String encodeLeftPath(String innerPath) {
            return "0" + innerPath;
        }

        private static String encodeRightPath(String innerPath) {
            return "1" + innerPath;
        }

        @Override
        public int compareTo(Node o) {
            if (o == null) {
                return -1;
            }
            return Double.compare(this.priority, o.priority);
        }
    }
}