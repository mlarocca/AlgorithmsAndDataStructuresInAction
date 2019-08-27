import cProfile
import pstats
import random
import unittest

from typing import List, Tuple

from mlarocca.datastructures.heap.dway_heap import DWayHeap


class HeapProfile(unittest.TestCase):
    BranchingFactors = range(2, 21)
    Runs = 5000
    OutputFileName = 'data/stats_heap.csv'
    OutputFileNameHeapify = 'data/stats_heapify.csv'
    OutputFileNameMixed = 'data/stats_heap_mixed.csv'

    @staticmethod
    def write_header(f) -> None:
        """Write the header of the output csv file for stats"""
        f.write('test_case,branching_factor,method_name,total_time,cumulative_time,per_call_time\n')

    @staticmethod
    def write_row(f, test_case: str, branching_factor: int, method_name: str, total_time: float,
                  cumulative_time: float, per_call_time: float) -> None:
        """Add a row of data to the stats csv file"""
        f.write(f'{test_case},{branching_factor},{method_name},{total_time},{cumulative_time},{per_call_time}\n')

    @staticmethod
    def get_running_times(st: pstats.Stats, method_name: str) -> List[Tuple[str, float]]:
        ps = st.strip_dirs().stats

        # Takes methods frequency_table_to_heap, heap_to_tree, and _heapify
        def is_heap_method(k):
            return method_name in k[2]

        keys = list(filter(is_heap_method, ps.keys()))
        # cc, nc, tt, ct, callers = ps[key]
        #  ps[key][2] -> tt -> total time
        #  ps[key][3] -> ct -> cumulative time
        return [(key[2], ps[key][2], ps[key][3], ps[key][3] / ps[key][1]) for key in keys]

    def test_profile_heap_methods_isolation(self) -> None:
        with open(HeapProfile.OutputFileName, 'w') as f:
            HeapProfile.write_header(f)
            for b in HeapProfile.BranchingFactors:
                heap = DWayHeap(branching_factor=b)
                for _ in range(HeapProfile.Runs):
                    pro = cProfile.Profile()
                    pro.runcall(heap.insert, random.random(), random.random())
                    st = pstats.Stats(pro)
                    # st.strip_dirs().sort_stats('cumulative').print_stats(20)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, 'insert'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, '_bubble_up'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

                while not heap.is_empty():
                    pro = cProfile.Profile()
                    pro.runcall(heap.top)
                    st = pstats.Stats(pro)
                    # st.strip_dirs().sort_stats('cumulative').print_stats(20)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, 'top'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)
                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, '_push_down'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

    def test_profile_heapify(self) -> None:
        with open(HeapProfile.OutputFileNameHeapify, 'w') as f:
            HeapProfile.write_header(f)
            for b in HeapProfile.BranchingFactors:
                for _ in range(HeapProfile.Runs):
                    n = 1000 + random.randint(0, 1000)
                    elements = [random.random() for _ in range(n)]
                    pro = cProfile.Profile()
                    pro.runcall(DWayHeap, elements, elements, b)
                    st = pstats.Stats(pro)
                    # st.strip_dirs().sort_stats('cumulative').print_stats(20)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, '_heapify'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, '_push_down'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

    def test_profile_heap_methods_interaction(self) -> None:
        with open(HeapProfile.OutputFileNameMixed, 'w') as f:
            HeapProfile.write_header(f)
            for b in HeapProfile.BranchingFactors:
                heap = DWayHeap(branching_factor=b)
                for _ in range(HeapProfile.Runs):
                    pro = cProfile.Profile()
                    pro.runcall(heap.insert, random.random(), random.random())

                    while not heap.is_empty() and random.choice([True, False]):
                        pro.runcall(heap.top)

                    st = pstats.Stats(pro)
                    # st.strip_dirs().sort_stats('cumulative').print_stats(20)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, 'insert'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, '_bubble_up'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, 'top'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)

                    for method_name, total_time, cumulative_time, per_call_time in \
                            HeapProfile.get_running_times(st, '_push_down'):
                        HeapProfile.write_row(f, 'heap', b, method_name, total_time, cumulative_time, per_call_time)


if __name__ == '__main__':
    unittest.main()
