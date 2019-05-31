package org.mlarocca.huffman;

import com.google.common.annotations.VisibleForTesting;
import org.mlarocca.containers.priorityqueue.Heap;
import org.mlarocca.containers.priorityqueue.PriorityQueue;

import java.util.*;

public class Huffman {

    private Huffman() {

    }

    public static Map<String, String> encode(String text) {
        return createEncoding(computeFrequenciesTree(createFrequenciesQueue(computeFrequencies(text))));
    }

    @VisibleForTesting
    protected static Map<String, String> createEncoding(Node frequenciesTree) {
        return frequenciesTree.createEncoding();
    }

    @VisibleForTesting
    protected static Node computeFrequenciesTree(PriorityQueue<Node> frequenciesQueue) {
        while (frequenciesQueue.size() > 1) {
            Optional<Node> right = frequenciesQueue.top();
            Optional<Node> left = frequenciesQueue.top();
            List<String> symbols = new ArrayList<>(left.map(n -> n.symbols).orElse(Collections.EMPTY_LIST));
            symbols.addAll(right.map(n -> n.symbols).orElse(Collections.EMPTY_LIST));
            Double priority = left.map(n -> n.priority).orElse(0.) + right.map(n -> n.priority).orElse(0.);
            frequenciesQueue.add(new Node(symbols, priority, left, right), priority);
        }

        return frequenciesQueue.top().get();
    }

    @VisibleForTesting
    protected static PriorityQueue<Node> createFrequenciesQueue(Map<String, Long> frequencies) {
        List<Node> elements = new ArrayList<>();
        List<Double> priorities = new ArrayList<>();

        for (Map.Entry<String, Long> entry : frequencies.entrySet()) {
            double priority = entry.getValue().doubleValue();
            elements.add(new Node(Arrays.asList(entry.getKey()), priority, Optional.empty(), Optional.empty()));
            priorities.add(priority);
        }

        return new Heap<>(elements, priorities, 3);
    }

    @VisibleForTesting
    protected static Map<String, Long> computeFrequencies(String text) {
        Map<String, Long> frequencyMap = new HashMap<>();
        for (Character c : text.toCharArray()) {
            frequencyMap.putIfAbsent(c.toString(), 0L);
            frequencyMap.compute(c.toString(), (key, freq) -> freq + 1);
        }

        return frequencyMap;
    }

    @VisibleForTesting
    protected static class Node {
        private final List<String> symbols;
        private final Double priority;
        private final Optional<Node> left;
        private final Optional<Node> right;

        public Node(List<String> symbols, Double priority, Optional<Node> left, Optional<Node> right) {
            this.symbols = symbols;
            this.priority = priority;
            this.left = left;
            this.right = right;
        }

        public Map<String, String> createEncoding() {

            Map<String, String> leftEncodingTable = left.map(Node::createEncoding).orElse(Collections.EMPTY_MAP);
            Map<String, String> rightEncodingTable = right.map(Node::createEncoding).orElse(Collections.EMPTY_MAP);

            Map<String, String> encodingTable = new HashMap<>();

            for (Map.Entry<String, String> entry : leftEncodingTable.entrySet()) {
                encodingTable.put(entry.getKey(), encodeLeftPath(entry.getValue()));
            }
            for (Map.Entry<String, String> entry : rightEncodingTable.entrySet()) {
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
    }
}