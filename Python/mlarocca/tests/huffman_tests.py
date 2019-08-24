import unittest

from mlarocca.datastructures.huffman import huffman


class HuffmanTest(unittest.TestCase):
    Text = "fffeeeeeddddddcccccccbbbbbbbbbbbbbbbbbbbbbbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

    def test_huffman(self):
        self.assertEqual({'a': '0', 'b': '10', 'c': '1100', 'd': '1101', 'e': '1110', 'f': '1111'},
                         huffman.create_encoding(HuffmanTest.Text))

    def test_create_frequency_table(self):
        self.assertEqual({'a': 57, 'b': 22, 'c': 7, 'd': 6, 'e': 5, 'f': 3},
                         huffman._create_frequency_table(HuffmanTest.Text))

    def test_frequency_table_to_heap(self):
        heap = huffman._frequency_table_to_heap(huffman._create_frequency_table(HuffmanTest.Text))
        self.assertTrue(heap._validate())

    def test_heap_to_tree(self):
        heap = huffman._frequency_table_to_heap(huffman._create_frequency_table(HuffmanTest.Text))
        tree = huffman._heap_to_tree(heap)

        self.assertTrue(tree._validate())
        print(tree)