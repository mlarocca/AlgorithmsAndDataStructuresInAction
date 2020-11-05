package org.mlarocca.containers.strings;

import org.everit.json.schema.ValidationException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Assert;
import org.junit.Test;
import org.mlarocca.containers.strings.trie.Trie;
import org.mlarocca.containers.strings.tst.Tst;
import org.mlarocca.containers.tree.BST;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class StringsTreeProfiler {
    // Download at https://github.com/dwyl/english-words/blob/master/words_dictionary.json
    public static final String WORDS_JSON = "words_dictionary.json";

    private static final Random random = new Random();

    @Test
    public void profileTrieMemory() throws FileNotFoundException {
        Trie trie = new Trie();

        InputStream inputStream = new FileInputStream(WORDS_JSON);
        try {
            List<String> keys = new ArrayList<>((new JSONObject(new JSONTokener(inputStream))).keySet());
            Collections.sort(keys);
            for (String key : keys) {
                trie.add(key);
            }
        } catch (ValidationException e) {
            Assert.fail();
        }
    }

    @Test
    public void profileTstMemory() throws FileNotFoundException {
        Tst tst = new Tst();

        InputStream inputStream = new FileInputStream(WORDS_JSON);
        try {
            List<String> keys = new ArrayList<>((new JSONObject(new JSONTokener(inputStream))).keySet());
//            Collections.shuffle(keys);
            Collections.sort(keys);
            for (String key : keys) {
                tst.add(key);
            }
            Assert.assertTrue(tst.search("english").isPresent());
            Assert.assertTrue(tst.search("arc").isPresent());
            Assert.assertTrue(tst.search("bunchbacked").isPresent());
        } catch (ValidationException e) {
            Assert.fail();
        }
    }

    @Test
    public void profileBstMemory() throws FileNotFoundException {
        BST<String> bst = new BST<>();

        InputStream inputStream = new FileInputStream(WORDS_JSON);
        try {
            JSONObject json = new JSONObject(new JSONTokener(inputStream));
            for (String key : json.keySet()) {
                bst.add(key);
            }
        } catch (ValidationException e) {
            Assert.fail();
        }
    }

    @Test
    public void profileRunningTime() throws FileNotFoundException {
        Trie trie = new Trie();
        Tst tst = new Tst();
        BST<String> bst = new BST<>();

        InputStream inputStream = new FileInputStream(WORDS_JSON);
        try {
            List<String> keys = new ArrayList<>((new JSONObject(new JSONTokener(inputStream))).keySet());
//            Collections.shuffle(keys);
            Collections.sort(keys);
            for (String key : keys) {
                trie.add(key);
                tst.add(key);
//                bst.add(key);     // Stack Overflow with sorted list
            }
            for (int i = 0; i < 1000000; i++) {
                String key = keys.get(random.nextInt(keys.size())) + randomKey(0, 10);
                trie.longestPrefixOf(key);
                tst.longestPrefixOf(key);
            }

        } catch (ValidationException e) {
            Assert.fail();
        }
    }

    private String randomKey(int minLength, int maxLength) {
        int length = (int) Math.floor(Math.random() * (maxLength - minLength)) + minLength;
        char[] chars = new char[length];
        for (int i = 0; i < length; i++) {
            chars[i] = (char) (random.nextInt(26) + 'a');
        }
        return new String(chars);
    }
}
