import unittest
import random

from mlarocca.datastructures.heap.dway_heap import DWayHeap

BRANCHING_FACTORS_TO_TEST = [2, 3, 4, 5, 6]


class HeapTest(unittest.TestCase):
    def test_init(self):
        heap = DWayHeap(branching_factor=2)
        self.assertEqual(0, len(heap))

        for b in [1, 0, -1]:
            with self.assertRaises(ValueError) as context:
                DWayHeap(branching_factor=b)

            self.assertTrue(f'Branching factor ({b}) must be greater than 1.' in str(context.exception))

        with self.assertRaises(ValueError) as context:
            DWayHeap(priorities=[1.0])
        error_str = 'The length of the elements list (0) must match the length of the priorities list (1).'
        self.assertTrue(error_str in str(context.exception))

        heap = DWayHeap(elements=['A', 'B', 'C', 'D'], priorities=[0.1, -0.1, 1., -2.], branching_factor=2)

        self.assertEqual(4, len(heap))
        self.assertTrue(heap._validate())

    def test_heapify(self):
        for b in BRANCHING_FACTORS_TO_TEST:
            size = 4 + random.randint(0, 20)
            elements = [chr(i) for i in range(ord('A'), ord('Z'))[:size]]
            priorities = [random.random() for _ in range(size)]
            heap = DWayHeap(elements=elements, priorities=priorities, branching_factor=b)

            self.assertEqual(size, len(heap))
            self.assertTrue(heap._validate())

    def test_clear(self):
        for b in BRANCHING_FACTORS_TO_TEST:
            heap = DWayHeap(branching_factor=b)
            with self.assertRaises(RuntimeError) as context:
                heap.peek()
            self.assertTrue('Method peek called on an empty heap.' in str(context.exception))

            heap.insert('First', -1e14)

            self.assertEqual('First', heap.peek())

            heap.insert("b", 0)
            heap.insert("c", 0.99)
            heap.insert("second", 1)
            heap.insert("a", -11)

            self.assertEqual('second', heap.peek())

    def test_insert_top(self):
        for b in BRANCHING_FACTORS_TO_TEST:
            heap = DWayHeap(branching_factor=b)
            with self.assertRaises(RuntimeError) as context:
                heap.peek()
            self.assertTrue('Method peek called on an empty heap.' in str(context.exception))

            heap.insert('First', -1e14)

            self.assertEqual('First', heap.top())
            self.assertTrue(heap.is_empty())

            heap.insert("b", 0)
            heap.insert("c", 0.99)
            heap.insert("second", 1)
            heap.insert("a", -11)

            self.assertEqual('second', heap.top())
            self.assertEqual(3, len(heap))

            for i in range(0, 10):
                heap.insert(str(i), random.random())

            while not heap.is_empty():
                self.assertTrue(heap._validate())
                heap.top()


if __name__ == '__main__':
    unittest.main()
