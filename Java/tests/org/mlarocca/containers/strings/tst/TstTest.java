package org.mlarocca.containers.strings.tst;

import org.junit.Test;
import org.mlarocca.containers.strings.trie.Trie;

import java.util.*;
import java.util.function.Function;
import java.util.stream.IntStream;

import static org.junit.Assert.*;

public class TstTest {
    private static final Random rnd = new Random();

    private static Tst mockedExample() {
        Tst tst = new Tst();

        tst.add("end");
        tst.add("and");
        tst.add("anti");
        tst.add("be");
        tst.add("top");
        tst.add("so");
        tst.add("tor");
        tst.add("torus");
        tst.add("bee");
        tst.add("bees");
        tst.add("beat");

        assertEquals(tst.size(), 11);

        return tst;
    }

    @Test
    public void add() {
        Tst tst = new Tst();
        assertEquals(tst.size(), 0);

        assertTrue(tst.add("d"));
        assertEquals(1, tst.size());
        assertTrue(tst.search("d").isPresent());

        assertTrue(tst.add("c"));
        assertEquals(2, tst.size());
        assertTrue(tst.search("c").isPresent());

        assertFalse("Duplicate keys are irrelevant", tst.add("c"));
        assertEquals(2, tst.size());
        assertTrue(tst.search("c").isPresent());

        assertTrue("Keys should be case-sensitive", tst.add("C"));
        assertEquals(3, tst.size());
        assertTrue(tst.search("C").isPresent());

        assertTrue(tst.add("de"));
        assertTrue(tst.add("decor"));
        assertTrue(tst.add("demo"));
        assertEquals("Should add suffixes of existing keys", 6, tst.size());
        assertTrue(tst.search("c").isPresent());
        assertTrue(tst.search("C").isPresent());
        assertTrue(tst.search("d").isPresent());
        assertTrue(tst.search("de").isPresent());
        assertTrue(tst.search("demo").isPresent());
        assertTrue(tst.search("decor").isPresent());

        assertFalse(tst.search("dem").isPresent());
        assertTrue("Prefixes should be added correctly", tst.add("dem"));
        assertEquals(7, tst.size());
        assertTrue(tst.search("dem").isPresent());
    }


    @Test(expected = IllegalArgumentException.class)
    public void addEmptyString() {
        Trie trie = new Trie();
        trie.add("");
    }


    @Test
    public void remove() {
        Tst tst = new Tst();
        assertEquals(tst.size(), 0);
        assertFalse("Remove should fail on an empty tst", tst.remove("x"));

        tst = mockedExample();

        assertFalse("Remove should fail when the argument is not in the tst", tst.remove("x"));
        assertFalse("Remove should fail when the argument is not in the tst", tst.remove("toss"));
        assertFalse("Remove should fail with a prefix of a key stored (if the prefix is not in the tst",
                tst.remove("to"));
        assertEquals(tst.size(), 11);

        tst.add("to");
        assertEquals(tst.size(), 12);
        assertTrue(tst.search("tor").isPresent());
        assertTrue("Remove should succeed for existing keys", tst.remove("tor"));
        assertFalse(tst.search("tor").isPresent());
        assertEquals(tst.size(), 11);

        assertFalse("Can't remove keys twise", tst.remove("tor"));

        assertTrue(tst.search("be").isPresent());
        assertTrue(tst.remove("be"));
        assertFalse(tst.search("be").isPresent());
        assertTrue("Remove should not have affected suffixes of removed words", tst.search("bee").isPresent());
        assertTrue("Remove should not have affected suffixes of removed words", tst.search("bees").isPresent());
        assertEquals(tst.size(), 10);

        assertTrue(tst.search("torus").isPresent());
        assertTrue(tst.remove("torus"));
        assertFalse(tst.search("torus").isPresent());
        assertTrue("Remove should not have affected prefixes of removed words", tst.search("to").isPresent());
        assertEquals(tst.size(), 9);
    }

    @Test
    public void clear() {
        Tst tst = new Tst();
        int numElements = 5 + rnd.nextInt(10);
        IntStream.range(0, numElements).forEach(i -> {
            assertTrue(tst.add("" + rnd.nextInt()));
        });
        assertEquals(numElements, tst.size());
        tst.clear();
        assertEquals(0, tst.size());
        assertTrue(tst.isEmpty());
        tst.add("A");
        assertEquals(1, tst.size());
        assertFalse(tst.isEmpty());
    }

    @Test
    public void search() {
        List<String> keys = Arrays.asList("a", "ab", "abc", "ac", "aca", "f", "g");
        Collections.shuffle(keys);
        Tst tst = new Tst();
        assertTrue("Search on an empty tst should not crash", tst.search("").isEmpty());

        for (String str : keys) {
            tst.add(str);
        }

        // Search by key only
        assertTrue("Should find an existing entry", tst.search("abc").isPresent());
        assertFalse("Should return Optional.empty on miss", tst.search("aa").isPresent());
        assertFalse("Should return Optional.empty on miss", tst.search("z").isPresent());
    }

    @Test
    public void isEmpty() {
        Tst tst = new Tst();
        assertTrue(tst.isEmpty());

        assertTrue(tst.add("1"));
        assertFalse(tst.isEmpty());

        assertTrue(tst.add("abc"));
        assertFalse(tst.isEmpty());

        assertTrue(tst.remove("1"));
        assertFalse(tst.isEmpty());

        assertTrue(tst.remove("abc"));
        assertTrue(tst.isEmpty());
    }

    @Test
    public void size() {
        Tst tst = new Tst();
        assertEquals("Size should be 0 on empty tst", 0, tst.size());

        tst.add("abc");
        tst.add("abcd");
        assertEquals("Size should account for # of keys added", 2, tst.size());
        tst.add("abc");
        assertEquals("Size should not change when duplicates are added", 2, tst.size());
        tst.add("c");
        tst.add("ac");
        tst.add("abacus");
        assertEquals("Size should account for # of keys added", 5, tst.size());
        assertTrue(tst.remove("ac"));
        assertEquals("Size should change on remove", 4, tst.size());
        tst.remove("abc");
        assertEquals("Size should change on remove", 3, tst.size());
    }

    @Test
    public void height() {
        Tst tst = new Tst();
        assertEquals("An empty tst must have height==0", 0, tst.height());

        tst.add("d");
        assertEquals(0, tst.height());

        tst.add("c");
        assertEquals(1, tst.height());

//        tst.remove("d");
//        assertEquals(1, tst.height());

        tst.add("e");
        assertEquals(1, tst.height());

        tst.add("f");
        assertEquals(2, tst.height());

        tst.add("g");
        assertEquals(3, tst.height());

        tst.add("ch");
        assertEquals(3, tst.height());

        tst.add("chaos");
        assertEquals(5, tst.height());

        tst.add("era");
        assertEquals(5, tst.height());

        tst.add("erasmus");
        assertEquals(7, tst.height());

        tst.remove("erasmus");
        assertEquals(5, tst.height());

        tst.remove("chaos");
        assertEquals(3, tst.height());

        tst.remove("era");
        assertEquals(3, tst.height());
    }

    @Test
    public void keys() {
        Tst tst = new Tst();

        Function<Iterable<String>, Set<String>> toSet = iterable -> {
            HashSet<String> keys = new HashSet<>();
            iterable.forEach(s -> keys.add(s));
            return keys;
        };

        Set<String> result = toSet.apply(tst.keys());
        assertTrue("The result should be empty on an empty tst", result.isEmpty());

        tst = mockedExample();
        result = toSet.apply(tst.keys());

        Set<String> expected =
                toSet.apply(
                        Arrays.asList("end", "and", "anti", "be", "top", "so", "tor", "torus", "bee", "bees", "beat"));

        assertEquals("It should return all keys in the tst", expected, result);
    }

    @Test
    public void min() {
        Tst tst = new Tst();

        assertTrue("min() of an empty tst is empty", tst.min().isEmpty());

        tst = mockedExample();
        assertFalse("min() of an non-empty tst exists", tst.min().isEmpty());
        assertEquals("and", tst.min().get());

        assertTrue(tst.remove("and"));
        assertTrue(tst.remove("anti"));
        assertEquals("min returns the shortest string", "be", tst.min().get());
    }

    @Test
    public void max() {
        Tst tst = new Tst();

        assertTrue("max() of an empty tst is empty", tst.max().isEmpty());

        tst = mockedExample();
        assertFalse("max() of an non-empty tst exists", tst.max().isEmpty());
        assertEquals("max returns the longest string", "torus", tst.max().get());

        assertTrue(tst.remove("torus"));
        assertEquals("tor", tst.max().get());
    }

    @Test
    public void keysWithPrefix() {
        Tst tst = new Tst();

        Function<Iterable<String>, Set<String>> toSet = iterable -> {
            HashSet<String> keys = new HashSet<>();
            iterable.forEach(s -> keys.add(s));
            return keys;
        };

        Set<String> result = toSet.apply(tst.keysWithPrefix(""));
        assertTrue("The result should be empty on an empty tst", result.isEmpty());

        tst = mockedExample();
        result = toSet.apply(tst.keysWithPrefix(""));
        Set<String> expected =
                toSet.apply(
                        Arrays.asList("end", "and", "anti", "be", "top", "so", "tor", "torus", "bee", "bees", "beat"));

        assertEquals("Using an empty string as prefix, it should return all keys", expected, result);

        result = toSet.apply(tst.keysWithPrefix("tor"));
        expected =
                toSet.apply(
                        Arrays.asList("tor", "torus"));

        assertEquals("The result should include the prefix, if stored", expected, result);

        result = toSet.apply(tst.keysWithPrefix("to"));
        expected =
                toSet.apply(
                        Arrays.asList("top", "tor", "torus"));

        assertEquals("It should work also when the prefix is not in the tst", expected, result);

        result = toSet.apply(tst.keysWithPrefix("b"));
        expected =
                toSet.apply(
                        Arrays.asList("be", "bee", "bees", "beat"));

        assertEquals(expected, result);

        result = toSet.apply(tst.keysWithPrefix("geek"));
        assertTrue("The result should be empty for a prefix not in the tst", result.isEmpty());
    }

    @Test
    public void longestPrefixOf() {
        Tst tst = new Tst();
        assertTrue(tst.longestPrefixOf("").isEmpty());

        tst.add("she");
        tst.add("sells");
        tst.add("sea");
        tst.add("shells");
        tst.add("on");
        tst.add("the");
        tst.add("shore");

        assertTrue("No prefix for empty string when it's not stored", tst.longestPrefixOf("").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the tst", tst.longestPrefixOf("s").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the tst", tst.longestPrefixOf("sh").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the tst", tst.longestPrefixOf("t").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the tst", tst.longestPrefixOf("th").isEmpty());

        assertEquals("Should return the longest prefix when it's a perfect match",
                "she",
                tst.longestPrefixOf("she").get());
        assertEquals("Should return the longest prefix when it's a perfect match",
                "the",
                tst.longestPrefixOf("the").get());

        assertEquals("Should returns the longest prefix when it's a proper prefix",
                "she",
                tst.longestPrefixOf("shell").get());
        assertEquals("Should returns the longest prefix when it's a proper prefix",
                "she",
                tst.longestPrefixOf("shepard").get());
        assertEquals("Should returns the longest prefix when it's a proper prefix",
                "the",
                tst.longestPrefixOf("there").get());

        assertEquals("Should returns the longest matching prefix", "shells", tst.longestPrefixOf("shells").get());
        assertEquals("Should returns the longest matching prefix", "shells", tst.longestPrefixOf("shellsort").get());
    }
}