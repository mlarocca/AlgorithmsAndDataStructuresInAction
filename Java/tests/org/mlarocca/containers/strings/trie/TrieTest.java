package org.mlarocca.containers.strings.trie;

import org.junit.Test;

import java.util.*;
import java.util.function.Function;
import java.util.stream.IntStream;

import static org.junit.Assert.*;

public class TrieTest {
    private static final Random rnd = new Random();

    private static Trie mockedExample() {
        Trie trie = new Trie();

        trie.add("end");
        trie.add("and");
        trie.add("anti");
        trie.add("be");
        trie.add("top");
        trie.add("so");
        trie.add("tor");
        trie.add("torus");
        trie.add("bee");
        trie.add("bees");
        trie.add("beat");

        assertEquals(trie.size(), 11);

        return trie;
    }

    @Test
    public void add() {
        Trie trie = new Trie();
        assertEquals(trie.size(), 0);

        assertTrue(trie.add("d"));
        assertEquals(1, trie.size());
        assertTrue(trie.search("d").isPresent());

        assertTrue(trie.add("c"));
        assertEquals(2, trie.size());
        assertTrue(trie.search("c").isPresent());

        assertFalse("Duplicate keys are irrelevant", trie.add("c"));
        assertEquals(2, trie.size());
        assertTrue(trie.search("c").isPresent());

        assertTrue("Keys should be case-sensitive", trie.add("C"));
        assertEquals(3, trie.size());
        assertTrue(trie.search("C").isPresent());

        assertTrue(trie.add("de"));
        assertTrue(trie.add("decor"));
        assertTrue(trie.add("demo"));
        assertEquals("Should add suffixes of existing keys", 6, trie.size());
        assertTrue(trie.search("c").isPresent());
        assertTrue(trie.search("C").isPresent());
        assertTrue(trie.search("d").isPresent());
        assertTrue(trie.search("de").isPresent());
        assertTrue(trie.search("demo").isPresent());
        assertTrue(trie.search("decor").isPresent());

        assertFalse(trie.search("dem").isPresent());
        assertTrue("Prefixes should be added correctly", trie.add("dem"));
        assertEquals(7, trie.size());
        assertTrue(trie.search("dem").isPresent());

        assertFalse(trie.add("de"));
        assertEquals(7, trie.size());
    }

    @Test(expected = IllegalArgumentException.class)
    public void addEmptyString() {
        Trie trie = new Trie();
        trie.add("");
    }

    @Test
    public void remove() {
        Trie trie = new Trie();
        assertEquals(trie.size(), 0);
        assertFalse("Remove should fail on an empty trie", trie.remove("x"));

        trie = mockedExample();

        assertFalse("Remove should fail when the argument is not in the trie", trie.remove("x"));
        assertFalse("Remove should fail when the argument is not in the trie", trie.remove("toss"));
        assertFalse("Remove should fail with a prefix of a key stored (if the prefix is not in the trie",
                trie.remove("to"));
        assertEquals(trie.size(), 11);

        trie.add("to");
        assertEquals(trie.size(), 12);
        assertTrue(trie.search("tor").isPresent());
        assertTrue("Remove should succeed for existing keys", trie.remove("tor"));
        assertFalse(trie.search("tor").isPresent());
        assertEquals(trie.size(), 11);

        assertFalse("Can't remove keys twise", trie.remove("tor"));

        assertTrue(trie.search("be").isPresent());
        assertTrue(trie.remove("be"));
        assertFalse(trie.search("be").isPresent());
        assertTrue("Remove should not have affected suffixes of removed words", trie.search("bee").isPresent());
        assertTrue("Remove should not have affected suffixes of removed words", trie.search("bees").isPresent());
        assertEquals(trie.size(), 10);

        assertTrue(trie.search("torus").isPresent());
        assertTrue(trie.remove("torus"));
        assertFalse(trie.search("torus").isPresent());
        assertTrue("Remove should not have affected prefixes of removed words", trie.search("to").isPresent());
        assertEquals(trie.size(), 9);

        assertFalse("It should handle the empty string", trie.remove(""));
    }

    @Test
    public void clear() {
        Trie trie = new Trie();
        int numElements = 5 + rnd.nextInt(10);
        IntStream.range(0, numElements).forEach(i -> {
            assertTrue(trie.add("" + rnd.nextInt()));
        });
        assertEquals(numElements, trie.size());
        trie.clear();
        assertEquals(0, trie.size());
        assertTrue(trie.isEmpty());
        trie.add("A");
        assertEquals(1, trie.size());
        assertFalse(trie.isEmpty());
    }

    @Test
    public void search() {
        List<String> keys = Arrays.asList("a", "ab", "abc", "ac", "aca", "f", "g");
        Collections.shuffle(keys);

        Trie trie = new Trie();
        assertTrue("Search on an empty tst should not crash", trie.search("").isEmpty());

        for (String str : keys) {
            trie.add(str);
        }

        // Search by key only
        assertTrue("Should find an existing entry", trie.search("abc").isPresent());
        assertFalse("Should return Optional.empty on miss", trie.search("aa").isPresent());
        assertFalse("Should return Optional.empty on miss", trie.search("z").isPresent());
    }

    @Test
    public void isEmpty() {
        Trie trie = new Trie();
        assertTrue(trie.isEmpty());

        assertTrue(trie.add("1"));
        assertFalse(trie.isEmpty());

        assertTrue(trie.add("abc"));
        assertFalse(trie.isEmpty());

        assertTrue(trie.remove("1"));
        assertFalse(trie.isEmpty());

        assertTrue(trie.remove("abc"));
        assertTrue(trie.isEmpty());
    }

    @Test
    public void size() {
        Trie trie = new Trie();
        assertEquals("Size should be 0 on empty trie", 0, trie.size());

        trie.add("abc");
        trie.add("abcd");
        assertEquals("Size should account for # of keys added", 2, trie.size());
        trie.add("abc");
        assertEquals("Size should not change when duplicates are added", 2, trie.size());
        trie.add("c");
        trie.add("ac");
        trie.add("abacus");
        assertEquals("Size should account for # of keys added", 5, trie.size());
        assertTrue(trie.remove("ac"));
        assertEquals("Size should change on remove", 4, trie.size());
        trie.remove("abc");
        assertEquals("Size should change on remove", 3, trie.size());
    }

    @Test
    public void height() {
        Trie trie = new Trie();
        assertEquals("An empty trie must have height==0", 0, trie.height());

        trie.add("d");
        assertEquals(1, trie.height());

        trie.add("c");
        assertEquals(1, trie.height());

        trie.remove("d");
        assertEquals(1, trie.height());

        trie.add("e");
        assertEquals(1, trie.height());

        trie.add("f");
        assertEquals(1, trie.height());

        trie.add("g");
        assertEquals(1, trie.height());

        trie.add("ch");
        assertEquals(2, trie.height());

        trie.add("chaos");
        assertEquals(5, trie.height());

        trie.add("era");
        assertEquals(5, trie.height());

        trie.add("erasmus");
        assertEquals(7, trie.height());

        trie.remove("erasmus");
        assertEquals(5, trie.height());

        trie.remove("chaos");
        assertEquals(3, trie.height());

        trie.remove("era");
        assertEquals(2, trie.height());
    }

    @Test
    public void keys() {
        Trie trie = new Trie();

        Function<Iterable<String>, Set<String>> toSet = iterable -> {
            HashSet<String> keys = new HashSet<>();
            iterable.forEach(s -> keys.add(s));
            return keys;
        };

        Set<String> result = toSet.apply(trie.keys());
        assertTrue("The result should be empty on an empty trie", result.isEmpty());

        trie = mockedExample();
        result = toSet.apply(trie.keys());

        Set<String> expected =
                toSet.apply(
                        Arrays.asList("end", "and", "anti", "be", "top", "so", "tor", "torus", "bee", "bees", "beat"));

        assertEquals("It should return all keys in the trie", expected, result);
    }

    @Test
    public void min() {
        Trie trie = new Trie();

        assertTrue("min() of an empty trie is empty", trie.min().isEmpty());

        trie = mockedExample();
        assertFalse("min() of an non-empty trie exists", trie.min().isEmpty());
        assertEquals("and", trie.min().get());

        assertTrue(trie.remove("and"));
        assertTrue(trie.remove("anti"));
        assertEquals("min returns the shortest string", "be", trie.min().get());
    }

    @Test
    public void max() {
        Trie trie = new Trie();

        assertTrue("max() of an empty trie is empty", trie.max().isEmpty());

        trie = mockedExample();
        assertFalse("max() of an non-empty trie exists", trie.max().isEmpty());
        assertEquals("max returns the longest string", "torus", trie.max().get());

        assertTrue(trie.remove("torus"));
        assertEquals("tor", trie.max().get());
    }

    @Test
    public void keysWithPrefix() {
        Trie trie = new Trie();

        Function<Iterable<String>, Set<String>> toSet = iterable -> {
            HashSet<String> keys = new HashSet<>();
            iterable.forEach(s -> keys.add(s));
            return keys;
        };

        Set<String> result = toSet.apply(trie.keysWithPrefix(""));
        assertTrue("The result should be empty on an empty trie", result.isEmpty());

        trie = mockedExample();
        result = toSet.apply(trie.keysWithPrefix(""));
        Set<String> expected =
                toSet.apply(
                        Arrays.asList("end", "and", "anti", "be", "top", "so", "tor", "torus", "bee", "bees", "beat"));

        assertEquals("Using an empty string as prefix, it should return all keys", expected, result);

        result = toSet.apply(trie.keysWithPrefix("tor"));
        expected =
                toSet.apply(
                        Arrays.asList("tor", "torus"));

        assertEquals("The result should include the prefix, if stored", expected, result);

        result = toSet.apply(trie.keysWithPrefix("to"));
        expected =
                toSet.apply(
                        Arrays.asList("top", "tor", "torus"));

        assertEquals("It should work also when the prefix is not in the trie", expected, result);

        result = toSet.apply(trie.keysWithPrefix("b"));
        expected =
                toSet.apply(
                        Arrays.asList("be", "bee", "bees", "beat"));

        assertEquals(expected, result);

        result = toSet.apply(trie.keysWithPrefix("geek"));
        assertTrue("The result should be empty for a prefix not in the trie", result.isEmpty());
    }

    @Test
    public void longestPrefixOf() {
        Trie trie = new Trie();
        assertTrue(trie.longestPrefixOf("").isEmpty());

        trie.add("she");
        trie.add("sells");
        trie.add("sea");
        trie.add("shells");
        trie.add("on");
        trie.add("the");
        trie.add("shore");

        assertTrue("No prefix for the empty string", trie.longestPrefixOf("").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the trie", trie.longestPrefixOf("s").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the trie", trie.longestPrefixOf("sh").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the trie", trie.longestPrefixOf("t").isEmpty());
        assertTrue("Should be empty when no prefix is stored in the trie", trie.longestPrefixOf("th").isEmpty());

        assertEquals("Should return the longest prefix when it's a perfect match",
                "she",
                trie.longestPrefixOf("she").get());
        assertEquals("Should return the longest prefix when it's a perfect match",
                "the",
                trie.longestPrefixOf("the").get());

        assertEquals("Should returns the longest prefix when it's a proper prefix",
                "she",
                trie.longestPrefixOf("shell").get());
        assertEquals("Should returns the longest prefix when it's a proper prefix",
                "she",
                trie.longestPrefixOf("shepard").get());
        assertEquals("Should returns the longest prefix when it's a proper prefix",
                "the",
                trie.longestPrefixOf("there").get());

        assertEquals("Should returns the longest matching prefix", "shells", trie.longestPrefixOf("shells").get());
        assertEquals("Should returns the longest matching prefix", "shells", trie.longestPrefixOf("shellsort").get());
    }
}