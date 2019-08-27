from typing import Any, List, Optional, Tuple


class DWayHeap(object):
    """Implementation of a d-ary heap.
    The branching factor for the heap can be passed as an argument.
    It's 2 by default, which is also the minimum possible value.
    The branching factor is the maximum number of children that each internal node can have.
    For regular heaps, a node an have at most 2 children, so the branching factor is 2.
    The higher the branching factor, the shortest the height of the heap. However, when an element is
    pushed towards the leaves of the heap, at each step all children of current node must be examined,
    so a larger branching factor implies a higher number of nodes to be checked for each step of this
    operation.
    On the other hand, inserting elements only examines at most h element, where h is the height of the heap,
    so this operation is only made faster with larger branching factors.
    In general values between 3 and 5 are a good compromise and produce good performance."""

    def __init__(self, elements: List[Any] = [], priorities: List[float] = [], branching_factor: int = 2) -> None:
        """Constructor

        Args:
            elements: The elements for initializing the heap.
            priorities: The priorities of the elements above. Must have the same length as `elements`.
            branching_factor: The (max) number of children for each node in the heap. Must be at least 2.
        """
        if len(elements) != len(priorities):
            raise ValueError(f'The length of the elements list ({len(elements)})'
                             f' must match the length of the priorities list ({len(priorities)}).')
        if branching_factor < 2:
            raise ValueError(f'Branching factor ({branching_factor}) must be greater than 1.')
        self._pairs: List[Tuple[float, Any]] = []
        self.D = branching_factor

        if len(elements) > 0:
            self._heapify(elements, priorities)

    def __sizeof__(self) -> int:
        """Size of the heap.

        Returns: The number of elements in the heap.
        """
        return len(self)

    def __len__(self) -> int:
        """Size of the heap.

        Returns: The number of elements in the heap.
        """
        return len(self._pairs)

    def _validate(self) -> bool:
        """Checks that the three invariants for heaps are abided by.
        1.	Every node has at most `D` children. (Guaranteed by construction)
        2.	The heap tree is complete and left-adjusted.(Also guaranteed by construction)
        3.	Every node holds the highest priority in the subtree rooted at that node.

        Returns: True if all the heap invariants are met.
        """
        current_index = 0
        first_leaf = self.first_leaf_index()
        while current_index < first_leaf:
            current_priority: float = self._pairs[current_index][0]
            first_child = self._first_child_index(current_index)
            last_child_guard = min(first_child + self.D, len(self))
            for child_index in range(first_child, last_child_guard):
                if current_priority < self._pairs[child_index][0]:
                    return False
            current_index += 1
        return True

    def _push_down(self, index: int) -> None:
        """Pushes down the root of a sub-heap towards its leaves to reinstate heap invariants.
        If any of the children of the element has a higher priority, then it swaps current
        element with its highest-priority child C, and recursively checks the sub-heap previously rooted
        at that C.

        Args:
            index: The index of the root of the sub-heap.
        """

        # INVARIANT: 0 <= index < n
        assert (0 <= index < len(self._pairs))
        input_pair = self._pairs[index]
        input_priority = input_pair[0]
        current_index = index
        first_leaf = self.first_leaf_index()
        while current_index < first_leaf:
            child_index = self._highest_priority_child_index(current_index)
            assert (child_index is not None)
            if self._pairs[child_index][0] > input_priority:
                self._pairs[current_index] = self._pairs[child_index]
                current_index = child_index
            else:
                break

        self._pairs[current_index] = input_pair

    def _bubble_up(self, index: int) -> None:
        """Bubbles up towards the root an element, to reinstate heap's invariants.
        If the parent P of an element has lower priority, then swaps current element and its parent,
        and then recursively check the position previously held by the P.

        Args:
            index: The index of the element to bubble up.
        """
        # INVARIANT: 0 <= index < n
        assert (0 <= index < len(self._pairs))
        input_pair = self._pairs[index]
        input_priority = input_pair[0]
        while index > 0:
            parent_index = self._parent_index(index)
            parent = self._pairs[parent_index]

            if input_priority > parent[0]:
                self._pairs[index] = parent
                index = parent_index
            else:
                break

        self._pairs[index] = input_pair

    def _first_child_index(self, index) -> int:
        """Computes the index of the first child of a heap node.

        Args:
            index: The index of current node, for which we need to find children's indices.

        Returns: The index of the left-most child for current heap node.
        """
        return index * self.D + 1

    def _parent_index(self, index) -> int:
        """Computes the index of the parent of a heap node.

        Args:
            index: The index of current node, for which we need to find its parent's indices.

        Returns: The index of the parent of current heap node.

        """
        return (index - 1) // self.D

    def _highest_priority_child_index(self, index) -> Optional[int]:
        """Finds, among the children of a heap node, the one child with highest priority.
        In case multiple children have the same priority, the left-most is returned.

        Args:
            index: The index of the heap node whose children are searched.

        Returns: The index of the child of current heap node with highest priority, or None if
                 current node has no child.
        """
        first_index = self._first_child_index(index)
        size = len(self)
        last_index = min(first_index + self.D, size)

        if first_index >= size:
            return None

        highest_priority = -float('inf')
        index = first_index
        for i in range(first_index, last_index):
            if self._pairs[i][0] > highest_priority:
                highest_priority = self._pairs[i][0]
                index = i

        return index

    def first_leaf_index(self):
        return (len(self) - 2) // self.D + 1

    def _heapify(self, elements: List[Any], priorities: List[float]) -> None:
        """Initializes the heap with a list of elements and priorities.

        Args:
            elements: The list of elements to add to the heap.
            priorities: The priorities for those elements (in the same order they are presented).
        """
        assert (len(elements) == len(priorities))
        self._pairs = list(zip(priorities, elements))
        last_inner_node_index = self.first_leaf_index() - 1
        for index in range(last_inner_node_index, -1, -1):
            self._push_down(index)

    def is_empty(self) -> bool:
        """Checks if the heap is empty.

        Returns: True if the heap is empty.

        """
        return len(self) == 0

    def top(self) -> Any:
        """Removes and returns the highest-priority element in the heap.
        If the heap is empty, raises a `RuntimeError`.

        Returns: The element with highest priority in the heap.
        """
        if self.is_empty():
            raise RuntimeError('Method top called on an empty heap.')
        if len(self) == 1:
            element = self._pairs.pop()[1]
        else:
            element = self._pairs[0][1]
            self._pairs[0] = self._pairs.pop()
            self._push_down(0)

        return element

    def peek(self) -> Any:
        """Removes, WITHOUT removing it, the highest-priority element in the heap.
        If the heap is empty, raises a `RuntimeError`.

        Returns: The element with highest priority in the heap.
        """
        if self.is_empty():
            raise RuntimeError('Method peek called on an empty heap.')
        return self._pairs[0][1]

    def insert(self, element: Any, priority: float) -> None:
        """Add a new element/priority pair to the heap

        Args:
            element: The new element to add.
            priority: The priority associated with the new element
        """
        self._pairs.append((priority, element))
        self._bubble_up(len(self._pairs) - 1)