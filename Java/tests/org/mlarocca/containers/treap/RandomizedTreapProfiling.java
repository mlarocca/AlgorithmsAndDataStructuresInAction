package org.mlarocca.containers.treap;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.junit.Test;
import org.mlarocca.containers.tree.BST;

import java.io.FileWriter;
import java.io.IOException;
import java.util.*;

import static org.junit.Assert.*;

public class RandomizedTreapProfiling {
    private static final Random rnd = new Random();
    String[] HEADERS = { "n", "height_bst", "height_rt"};
    String PROFILE_RANDOM_FILENAME = "bst_vs_rt_random_limit_";
    String PROFILE_SKEWED_FILENAME = "bst_vs_rt_worst-case.csv";

    @Test
    public void profileHeight() throws IOException {
        int runsPerSize = 100;
        List<Integer> nList = new ArrayList<>();
        List<Integer> hRSTList = new ArrayList<>();
        List<Integer> hBSTList = new ArrayList<>();

        int bound = 1000;

        for (int size = 100; size <= 100000; size *= 2) {
            for (int run = 0; run < runsPerSize; run++) {
                List<Integer> keys = new ArrayList<>();
                RandomizedTreap<Integer> rt = new RandomizedTreap<>();
                BST<Integer> bst = new BST<>();
                int actualSize = size + rnd.nextInt(size);

                for (int i = 0; i < actualSize; i++) {
                    int entry = rnd.nextInt(bound);
                    bst.add(entry);
                    rt.add(entry);
                    keys.add(entry);
                }

                for (int i = 0; i < actualSize; i++) {
                    // Alternate removing and insert keys;
                    if (rnd.nextBoolean()) {
                        // Remove an element
                        final int indexToRemove = rnd.nextInt(keys.size());
                        int entryToRemove = keys.get(indexToRemove);
                        keys.remove(indexToRemove);

                        rt.remove(entryToRemove);
                        bst.remove(entryToRemove);
                    } else {
                        int entryToAdd = rnd.nextInt(bound);
                        bst.add(entryToAdd);
                        rt.add(entryToAdd);
                        keys.add(entryToAdd);
                    }
                }

                assertEquals(bst.size(), rt.size());
                assertEquals(keys.size(), bst.size());

                // Now get the two heights and store them
                nList.add(bst.size());
                hBSTList.add(bst.height());
                hRSTList.add(rt.height());
            }

            writeToCSVFile(PROFILE_RANDOM_FILENAME + bound + ".csv", HEADERS, nList, hBSTList, hRSTList);
        }
    }

    @Test
    public void profileHeightOrderedSequence() throws IOException {
        int runsPerSize = 100;
        List<Integer> nList = new ArrayList<>();
        List<Integer> hRSTList = new ArrayList<>();
        List<Integer> hBSTList = new ArrayList<>();

        for (int size = 100; size < 100000; size *= 1.2) {
            for (int run = 0; run < runsPerSize; run++) {
                RandomizedTreap<Integer> rt = new RandomizedTreap<>();
                BST<Integer> bst = new BST<>();

                for (int i = 0; i < size + rnd.nextInt(size); i++) {
                    bst.add(i);
                    rt.add(i);
                }

                assertEquals(bst.size(), rt.size());
                assertTrue(rt.height() <= bst.height());
                // Now get the two heights and store them
                nList.add(bst.size());
                hBSTList.add(bst.height());
                hRSTList.add(rt.height());
            }
            writeToCSVFile(PROFILE_SKEWED_FILENAME, HEADERS, nList, hBSTList, hRSTList);
        }
    }

    @Test
    public void profileCPU() {
        // Run with a profiler
        int runsPerSize = 10;
        int bound = 1000;

        int size = 100000;
        for (int run = 0; run < runsPerSize; run++) {
            List<Integer> keys = new ArrayList<>();
            RandomizedTreap<Integer> rt = new RandomizedTreap<>();
            BST<Integer> bst = new BST<>();
            int actualSize = size + rnd.nextInt(size);

            for (int i = 0; i < actualSize; i++) {
                int entry = rnd.nextInt(bound);
                bst.add(entry);
                rt.add(entry);
                keys.add(entry);
            }

            for (int i = 0; i < actualSize; i++) {
                // Alternate removing and insert keys;
                if (rnd.nextBoolean()) {
                    // Remove an element
                    final int indexToRemove = rnd.nextInt(keys.size());
                    int entryToRemove = keys.get(indexToRemove);
                    keys.remove(indexToRemove);

                    rt.remove(entryToRemove);
                    bst.remove(entryToRemove);
                } else {
                    int entryToAdd = rnd.nextInt(bound);
                    bst.add(entryToAdd);
                    rt.add(entryToAdd);
                    keys.add(entryToAdd);
                }
            }

        }
    }

    @Test
    public void profileCPUOrderedSequence() {
        // Run with a profiler
        int runsPerSize = 100;

        int size = 100000;
        for (int run = 0; run < runsPerSize; run++) {
            RandomizedTreap<Integer> rt = new RandomizedTreap<>();
            BST<Integer> bst = new BST<>();
            int actualSize = size + rnd.nextInt(size);

            for (int i = 0; i < actualSize; i++) {

                bst.add(i);
                rt.add(i);
            }
        }
    }

    @Test
    public void profileMemory() {
        // Run with a profiler
        int runsPerSize = 10;

        int size = 10000;
        String start = "1000";
        for (int run = 0; run < runsPerSize; run++) {
            RandomizedTreap<String> rt = new RandomizedTreap<>();
            BST<String> bst = new BST<>();
            int actualSize = size + rnd.nextInt(size);

            for (Integer i = 0; i < actualSize; i++) {
                bst.add(start + i.toString());
                rt.add(start  + i.toString());
            }
        }
    }

    private void writeToCSVFile(String fileName, String[] headers, List<Integer> ns, List<Integer> hBSTs, List<Integer> hRSTs) throws IOException {
        FileWriter out = new FileWriter(fileName);
        try (CSVPrinter printer = new CSVPrinter(out, CSVFormat.DEFAULT
                .withHeader(headers))) {
            for (int i = 0; i < ns.size(); i++) {
                printer.printRecord(ns.get(i), hBSTs.get(i), hRSTs.get(i));
            }
        }
        out.close();
    }
}