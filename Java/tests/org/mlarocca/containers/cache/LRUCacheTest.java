package org.mlarocca.containers.cache;

import com.google.common.collect.ImmutableMap;
import org.junit.Test;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.IntStream;

import static org.junit.Assert.*;


public class LRUCacheTest {
    private static final Random rnd = new Random();

    private LRUCache<String, String> cache;

    @Test
    public void size() throws Exception {
        cache = new LRUCache<>(5);
        assertEquals("size() should be 0 for an empty cache", 0, cache.size());

        cache.set("test", "prova");
        assertEquals("size() should account for added elements", 1, cache.size());
        cache.set("cache", "cache");
        assertEquals("size() should account for added elements", 2, cache.size());

        cache.set("test", "prueba");
        assertEquals("Size shouldn't grow when replacing existing elements", 2, cache.size());

        cache.set("this", "este");
        cache.set("is", "es");
        cache.set("a", "un");
        assertEquals(5, cache.size());

        cache.set("about", "sobre");
        assertEquals("Size shouldn't grow over the maximum", 5, cache.size());
    }

    @Test
    public void set() throws Exception {
        cache = new LRUCache<>(6);
        assertEquals(0, cache.size());

        cache.set("test", "prova");
        assertEquals(1, cache.size());
        assertEquals("Should set the correct values in cache", "prova", cache.get("test").get());

        cache.set("test", "prueba");
        assertEquals("Should override values in cache", "prueba", cache.get("test").get());

        ImmutableMap<String, String> items = ImmutableMap.of(
                "this", "questo",
                "is", "e'",
                "a", "un",
                "cache", "cache",
                "test", "esperimento"
        );

        for (ImmutableMap.Entry<String, String> entry : items.entrySet()) {
            cache.set(entry.getKey(), entry.getValue());
        }

        for (ImmutableMap.Entry<String, String> entry : items.entrySet()) {
            assertEquals(cache.get(entry.getKey()).get(), entry.getValue());
        }
    }

    @Test
    public void get() throws Exception {
        cache = new LRUCache<>(3);
        assertEquals(0, cache.size());

        cache.set("test", "prova");
        assertEquals("Should retrieve the correct values in cache", "prova", cache.get("test").get());

        assertEquals("Should return empty() if the key is not in cache", Optional.empty(), cache.get("bogus"));
    }

    @Test
    public void evictOneEntry() throws Exception {
        int maxSize = 3;
        cache = new LRUCache<>(maxSize);
        assertEquals(0, cache.size());
        assertFalse("evictOneEntry should fail on empty cache", cache.evictOneEntry());

        cache.set("test", "prova");
        assertEquals(1, cache.size());
        assertEquals("prova", cache.get("test").get());

        assertTrue("evictOneEntry should succeed on non-empty cache", cache.evictOneEntry());
        assertEquals("evictOneEntry should decrease cache's size", 0, cache.size());
        assertEquals(Optional.empty(), cache.get("test"));

        ImmutableMap<String, String> items = ImmutableMap.of(
                "this", "questo",
                "is", "e'",
                "a", "un",
                "cache", "cache",
                "test", "esperimento"
        );

        for (ImmutableMap.Entry<String, String> entry : items.entrySet()) {
            cache.set(entry.getKey(), entry.getValue());
        }

        assertEquals("evictOneEntry (called from set) should remove elements when cache is full",
                maxSize, cache.size());

        cache.evictOneEntry();
        assertEquals("evictOneEntry should decrease cache's size", maxSize - 1, cache.size());
    }

    @Test
    public void LFUPolicy() throws Exception {
        int maxSize = 5;
        cache = new LRUCache<>(maxSize);
        ImmutableMap<String, String> items = ImmutableMap.of(
                "this", "questo",
                "is", "e'",
                "a", "un",
                "cache", "cache",
                "test", "prova"
        );

        for (ImmutableMap.Entry<String, String> entry : items.entrySet()) {
            cache.set(entry.getKey(), entry.getValue());
        }

        // Get every element twice from the cache, except for test
        for (ImmutableMap.Entry<String, String> entry : items.entrySet()) {
            String key = entry.getKey();
            if (!key.equals("test")) {
                assertTrue(cache.get(key).isPresent());
                assertTrue(cache.get(key).isPresent());
            }
        }

        assertEquals(maxSize, cache.size());

        assertTrue(cache.evictOneEntry());
        assertEquals(maxSize - 1, cache.size());

        assertEquals("evictOneEntry should remove the least requested entry", Optional.empty(), cache.get("test"));

        // Get every remaining element twice from the cache, except for "a"
        for (ImmutableMap.Entry<String, String> entry : items.entrySet()) {
            String key = entry.getKey();
            if (!(key.equals("a") || key.equals("test"))) {
                assertTrue(cache.get(key).isPresent());
                assertTrue(cache.get(key).isPresent());
            }
        }
        assertTrue(cache.evictOneEntry());
        assertEquals(maxSize - 2, cache.size());

        assertEquals("evictOneEntry should remove the entry requested more in the past", Optional.empty(), cache.get("a"));

        assertTrue(cache.set("new test", "nuovo test"));
        assertEquals(maxSize - 1, cache.size());
        assertEquals(Optional.of("nuovo test"), cache.get("new test"));
        assertTrue(cache.evictOneEntry());
        assertEquals(maxSize - 2, cache.size());
        assertEquals("evictOneEntry should not remove the last requested entry", Optional.of("nuovo test"), cache.get("new test"));
    }

    @Test
    public void clear() throws Exception {
        Arrays.asList(2, 3, 4, 5).forEach(maxSize -> {
            Cache<Integer, Integer> cache = new LRUCache<>(maxSize);
            int numElements = 5 + rnd.nextInt(10);
            IntStream.range(0 , numElements).forEach(i -> {
                assertTrue(cache.set(i, rnd.nextInt()));
            });
            assertEquals(Math.min(maxSize, numElements), cache.size());
            cache.clear();
            assertEquals(0, cache.size());
            assertTrue(cache.isEmpty());
            cache.set(1, -1);
            assertEquals(1, cache.size());
            assertFalse(cache.isEmpty());
        });
    }
    
    @Test
    public void testMultiThreading() throws Exception {
        int maxWait = 5;
        int maxSize = 10;
        LRUCache<String, Integer> cache = new LRUCache<>(maxSize);

        ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

        ExecutorService executor = Executors.newFixedThreadPool(10);

        List<String> englishWords = new ArrayList<>(
                Arrays.asList("this", "is", "just", "to", "test", "concurrent", "access", "for", "synchronized",
                        "cache"));

        List<String> italianWords = new ArrayList<>(
                Arrays.asList("prova", "sul", "funzionamento", "di", "una", "cache+", "condivisa", "in", "ambiente",
                        "multi-threaded"));

        Function<List<String>, Runnable> entrySetterGen = (words) -> () ->
            IntStream.range(0, words.size()).forEach(i -> {
                try {
                    String w = words.get(i);
                    cache.set(w, i);
                    counters.put(w, new AtomicInteger(1));
                    Thread.sleep(1 + rnd.nextInt(maxWait / 2));
                } catch (InterruptedException e) {
                    throw new IllegalStateException(e);
                }
            });

        Runnable englishWordsSetter = entrySetterGen.apply(englishWords);
        Runnable italianWordsSetter = entrySetterGen.apply(italianWords);

        BiFunction<List<String>, Integer, Runnable> entryGetterGen = (words, runs) -> () ->
            IntStream.range(0, words.size()).forEach(i -> {
                try {
                    String w = words.get(i);
                    IntStream.range(0 ,runs).forEach(j ->{
                        if (cache.get(w).isPresent()) {
                            counters.get(w).incrementAndGet();
                        } else {
                            counters.put(w, new AtomicInteger(0));
                        }
                    });
                    Thread.sleep(1 + rnd.nextInt(maxWait));
                } catch (InterruptedException e) {
                    throw new IllegalStateException(e);
                }
        });

        Runnable italianWordsGetter = entryGetterGen.apply(italianWords, 1);
        Runnable englishWordsGetter = entryGetterGen.apply(englishWords, 3);

        executor.execute(englishWordsSetter);
        // Make sure the first few words have been added;
        Thread.sleep(5 * maxWait);

        executor.execute(englishWordsGetter);
        executor.execute(italianWordsSetter);
        Thread.sleep(5 * maxWait);
        executor.execute(italianWordsGetter);


        // Wait till we are sure all threads are done
        try {
            executor.awaitTermination(50 * maxWait + (2 * maxSize) * (1 + maxWait), TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            throw new AssertionError("Computation was stuck");
        };

        // Now only the words with counters[word] > 0 should still be in the cache
        Predicate<String> isEntryIn = word -> counters.get(word).get() > 0 == cache.get(word).isPresent();
        englishWords.forEach(word -> assertTrue(isEntryIn.test(word)));
        italianWords.forEach(word -> assertTrue(isEntryIn.test(word)));
    }
}