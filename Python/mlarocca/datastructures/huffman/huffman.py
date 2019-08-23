import collections
from typing import Dict, List, Optional, Type
from mlarocca.datastructures.heap.dway_heap import DWayHeap


class HuffmanNode(object):
    def __init__(self, symbols: List[str], priority: float, left: Optional['HuffmanNode'] = None,
                 right: Optional['HuffmanNode'] = None) -> None:
        self._symbols = symbols
        self._priority = priority
        self._left = left
        self._right = right

    def __repr__(self):
        return f'({self._symbols}, {self._priority})'

    def __str__(self) -> str:
        return f'{repr(self)} -> ({self._left} | {self._right})'

    def symbols(self) -> List[str]:
        return self._symbols

    def priority(self) -> float:
        return self._priority

    @staticmethod
    def encode_left_path(inner_path) -> str:
        return f'0{inner_path}'

    @staticmethod
    def encode_right_path(inner_path) -> str:
        return f'1{inner_path}'

    def _validate(self) -> bool:
        left_symbols = self._left.symbols() if self._left else []
        right_symbols = self._right.symbols() if self._right else []

        left_priority = self._left.priority() if self._left else 0.
        right_priority = self._right.priority() if self._right else 0.

        if self.symbols() != left_symbols + right_symbols:
            return False

        if self.priority() != left_priority + right_priority:
            return False

        return True

    def tree_encoding(self) -> Dict[str, str]:
        left_encoding_table = {} if self._left is None else self._left.tree_encoding()
        right_encoding_table = {} if self._right is None else self._right.tree_encoding()

        encoding_table = {}

        for key, path in left_encoding_table.items():
            encoding_table[key] = HuffmanNode.encode_left_path(path)

        for key, path in right_encoding_table.items():
            encoding_table[key] = HuffmanNode.encode_right_path(path)

        if len(self._symbols) == 1:
            encoding_table[self.symbols()[0]] = ""

        return encoding_table


def create_frequency_table(text: str) -> collections.Counter:
    return collections.Counter(text)


def frequency_table_to_heap(ft: collections.Counter, branching_factor: int = 2) -> DWayHeap:
    characters, priorities = list(zip(*ft.items()))
    # Create a node for each character; use the inverse of the frequency because DWayHeap is a max heap
    priorities = list(map(lambda p: -p, priorities))
    elements = list(map(lambda c: HuffmanNode(c, -ft[c]), characters))
    return DWayHeap(elements=elements, priorities=priorities, branching_factor=branching_factor)


def heap_to_tree(heap: DWayHeap) -> HuffmanNode:
    while len(heap) > 1:
        # Gets the first two elements
        right: HuffmanNode = heap.top()
        left: HuffmanNode = heap.top()

        # Computes the symbols list and priority for the node merging left and right subtrees
        symbols: List[str] = left.symbols() + right.symbols()
        priority: float = left.priority() + right.priority()

        heap.insert(HuffmanNode(symbols, priority, left, right), priority)

    return heap.top()


def create_encoding(text: str) -> Dict[str, str]:
    return heap_to_tree(frequency_table_to_heap(create_frequency_table(text))).tree_encoding()