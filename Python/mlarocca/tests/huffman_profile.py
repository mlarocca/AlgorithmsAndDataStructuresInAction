import base64
import cProfile
import pstats
import unittest

from typing import Any, List, Tuple

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


def run_test(file_name: str, read_func: Any):
    file_content = read_func(file_name)
    huffman.create_encoding(file_content)


class HuffmanProfile(unittest.TestCase):
    TestCases = {
        'text': ('data/alice.txt', read_text, 1000),
        'image': ('data/best_selling.bmp', read_image, 100)
    }
    BranchingFactors = range(2, 7)
    OutputFileName = 'data/stats.csv'

    @staticmethod
    def write_header(f) -> None:
        f.write('test_case,branching_factor,method_name,total_time,cumulative_time\n')

    @staticmethod
    def write_row(f, test_case: str, branching_factor: int, method_name: str, total_time: float,
                  cumulative_time: float) -> None:
        f.write(f'{test_case},{branching_factor},{method_name},{total_time},{cumulative_time}\n')

    @staticmethod
    def get_running_times(st: pstats.Stats) -> List[Tuple[str, float]]:
        ps = st.strip_dirs().stats

        # takes methods frequency_table_to_heap, heap_to_tree, and _heapify
        keys = list(filter(lambda k: 'heap' in k[2], ps.keys()))
        # cc, nc, tt, ct, callers = ps[key]
        #  ps[key][2] -> tt -> total time
        #  ps[key][3] -> ct -> cumulative time
        return [(key[2], ps[key][2], ps[key][3]) for key in keys]

    def test_profile_huffman(self) -> None:
        self._runs_counter = 0

        with open(HuffmanProfile.OutputFileName, 'w') as f:
            HuffmanProfile.write_header(f)
            for test_case, (file_name, read_func, runs) in HuffmanProfile.TestCases.items():
                for b in HuffmanProfile.BranchingFactors:
                    for _ in range(runs):
                        pro = cProfile.Profile()
                        pro.runctx(f'run_test("{file_name}", {read_func.__name__})', globals(), locals())
                        st = pstats.Stats(pro)
                        # st.strip_dirs().sort_stats('cumulative').print_stats(20)

                        for method_name, total_time, cumulative_time in HuffmanProfile.get_running_times(st):
                            HuffmanProfile.write_row(f, test_case, b, method_name, total_time, cumulative_time)


if __name__ == '__main__':
    unittest.main()
