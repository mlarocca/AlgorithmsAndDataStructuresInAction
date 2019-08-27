import base64
import cProfile
import pstats
import unittest

from typing import List, Tuple

from mlarocca.datastructures.huffman import huffman


def read_text(file_name: str) -> str:
    with open(file_name, 'r') as f:
        text = f.read()
    return text


def read_image(file_name: str) -> str:
    with open(file_name, 'rb') as f:
        # Read an image bytes and encodes them using base64 encoding, to treat it as text
        text = str(base64.b64encode(f.read()))
    return text


class HuffmanProfile(unittest.TestCase):
    TestCases = {
        'text': (['data/alice.txt', 'data/candide.txt',
                  'data/gullivers_travels.txt'], read_text, 1000),
        'image': (['data/best_selling.bmp'], read_image, 200)
    }
    BranchingFactors = range(2, 24)
    OutputFileName = 'data/stats_huffman.csv'

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
    def get_running_times(st: pstats.Stats) -> List[Tuple[str, float, float, float]]:
        ps = st.strip_dirs().stats

        # Takes methods frequency_table_to_heap, heap_to_tree, and _heapify
        def is_heap_method(k):
            return 'heap' in k[2] or 'create_encoding' in k[2] or \
                   ('dway_heap.py' in k and ('top' in k[2] or 'insert' in k[2] or
                                             '_push_down' in k[2] or '_bubble_up' in k[2] or
                                             '_highest_priority_child_index' in k[2]))

        keys = list(filter(is_heap_method, ps.keys()))
        # cc, nc, tt, ct, callers = ps[key]
        #  ps[key][2] -> tt -> total time
        #  ps[key][3] -> ct -> cumulative time
        return [(key[2], ps[key][2], ps[key][3], ps[key][3] / ps[key][1]) for key in keys]

    def test_profile_huffman(self) -> None:
        with open(HuffmanProfile.OutputFileName, 'w') as f:
            HuffmanProfile.write_header(f)
            for test_case, (file_names, read_func, runs) in HuffmanProfile.TestCases.items():
                file_contents = [read_func(file_name) for file_name in file_names]
                for _ in range(runs):
                    for b in HuffmanProfile.BranchingFactors:
                        pro = cProfile.Profile()
                        for file_content in file_contents:
                            pro.runcall(huffman.create_encoding, file_content, b)

                        st = pstats.Stats(pro)
                        # st.strip_dirs().sort_stats('cumulative').print_stats(20)

                        for method_name, total_time, cumulative_time, per_call_time in HuffmanProfile.get_running_times(
                                st):
                            HuffmanProfile.write_row(f, test_case, b, method_name, total_time, cumulative_time,
                                                     per_call_time)


if __name__ == '__main__':
    unittest.main()
