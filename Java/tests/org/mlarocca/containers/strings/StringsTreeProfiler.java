package org.mlarocca.containers.strings;

import org.everit.json.schema.Schema;
import org.everit.json.schema.ValidationException;
import org.everit.json.schema.loader.SchemaLoader;
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

public class StringsTreeProfiler {
    public static final String WORDS_JSON = "words_dictionary.json";

    @Test
    public void profileTrieMemory() throws FileNotFoundException {
        Trie trie = new Trie();

        InputStream inputStream = new FileInputStream(WORDS_JSON);
        try {
            JSONObject json = new JSONObject(new JSONTokener(inputStream));
            for (String key : json.keySet()) {
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
            JSONObject json = new JSONObject(new JSONTokener(inputStream));
            for (String key : json.keySet()) {
                tst.add(key);
            }
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
}
