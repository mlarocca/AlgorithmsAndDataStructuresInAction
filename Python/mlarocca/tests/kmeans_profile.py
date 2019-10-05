import math
import cProfile
import pstats
import unittest

from typing import List, Tuple
from random import randrange, random, sample

import mlarocca.datastructures.clustering.kmeans as kmeans


class KmeansProfile(unittest.TestCase):
    OutputFileName = 'data/stats_kmeans.csv'
    OutputFileNameInc = 'data/stats_kmeans_inc.csv'

    @staticmethod
    def write_header(f) -> None:
        """Write the header of the output csv file for stats"""
        f.write('algorithm,n,k,method_name,total_time,cumulative_time,per_call_time\n')

    @staticmethod
    def write_row(f, algorithm: str, n: int, k:int, method_name: str, total_time: float,
                  cumulative_time: float, per_call_time: float) -> None:
        """Add a row of data to the stats csv file"""
        f.write(f'{algorithm},{n},{k},{method_name},{total_time},{cumulative_time},{per_call_time}\n')

    @staticmethod
    def get_running_times(st: pstats.Stats) -> List[Tuple[str, float, float, float]]:
        ps = st.strip_dirs().stats

        def tracked_method(k):
            return 'k_means_' in k[2] or '__partition_points' in k[2]

        keys = list(filter(tracked_method, ps.keys()))
        # cc, nc, tt, ct, callers = ps[key]
        #  ps[key][2] -> tt -> total time
        #  ps[key][3] -> ct -> cumulative time
        return [(key[2], ps[key][2], ps[key][3], ps[key][3] / ps[key][1]) for key in keys]

    @staticmethod
    def create_random_cluster(centroid, radius, n_points):
        def random_point_in_circle():
            alpha = random() * 2 * math.pi
            r = radius * math.sqrt(random())
            # r is dim-dimensional root of radius

            x = centroid[0] + r * math.cos(alpha)
            y = centroid[1] + r * math.sin(alpha)
            return x, y

        return [random_point_in_circle() for _ in range(n_points)]

    @staticmethod
    def random_point(radius):
        return random() * radius - radius / 2, random() * radius - radius / 2

    @staticmethod
    def createRandomDataset(n, k, radius=10):
        data_centroids = [KmeansProfile.random_point(radius) for _ in range(k)]
        data_clusters = [KmeansProfile.create_random_cluster(P, 0.25 + random(), randrange(n//k//10, n//k + 1))
                         for P in data_centroids]
        noise = [KmeansProfile.random_point(radius) for _ in range(n//k)]

        return [p for C in data_clusters for p in C] + noise

    def test_profile_kmeans_crafted(self) -> None:
        with open(KmeansProfile.OutputFileName, 'w') as f:
            KmeansProfile.write_header(f)
               
            runs = 100
            for max_n in [1000, 10000, 100000]:
                max_iter = min(max_n // 10, 1000)
                for k in [5, 10, 20, 35, 50, 75, 100, 200]:
                    for _ in range(runs):
                        pro_classic = cProfile.Profile()
                        pro_boosted = cProfile.Profile()
                        pro_kd = cProfile.Profile()

                        dataset = KmeansProfile.createRandomDataset(randrange(max(k * 10, max_n // 10), max_n + 1), k)
                        n = len(dataset)
                        pro_classic.runcall(kmeans.k_means_classic, dataset, k, max_iter)
                        pro_boosted.runcall(kmeans.k_means_boosted, dataset, k, max_iter)
                        pro_kd.runcall(kmeans.k_means_kd_tree, dataset, k, max_iter)

                        st_classic = pstats.Stats(pro_classic)
                        st_boosted = pstats.Stats(pro_boosted)
                        st_kd = pstats.Stats(pro_kd)
                        # st_classic.strip_dirs().sort_stats('cumulative').print_stats(20)
                        # st_kd.strip_dirs().sort_stats('cumulative').print_stats(20)

                        for method_name, total_time, cumulative_time, per_call_time in KmeansProfile.get_running_times(
                                st_classic):
                            KmeansProfile.write_row(f, 'classic', n, k, method_name, total_time, cumulative_time,
                                                    per_call_time)

                        for method_name, total_time, cumulative_time, per_call_time in KmeansProfile.get_running_times(
                                st_boosted):
                            KmeansProfile.write_row(f, 'boosted', n, k, method_name, total_time, cumulative_time,
                                                    per_call_time)

                        for method_name, total_time, cumulative_time, per_call_time in KmeansProfile.get_running_times(
                                st_kd):
                            KmeansProfile.write_row(f, 'kdtree', n, k, method_name, total_time, cumulative_time,
                                                    per_call_time)


    def test_profile_kmeans(self) -> None:
        with open(KmeansProfile.OutputFileNameInc, 'w') as f:
            KmeansProfile.write_header(f)

            n = 1000
            runs = 10
            dataset = [KmeansProfile.random_point(100) for _ in range(n)]

            step = 100
            for n in range(len(dataset), 10000, step):
                for _ in range(step):
                    dataset.append(KmeansProfile.random_point(1000))

                max_iter = 10
                for k in [5, 10, 20, 35, 50, 75, 100, 200]:
                    pro_classic = cProfile.Profile()
                    pro_boosted = cProfile.Profile()
                    pro_kd = cProfile.Profile()

                    for _ in range(runs):
                        n = len(dataset)
                        # pro_classic.runcall(kmeans.k_means_classic, dataset, k, max_iter)
                        pro_boosted.runcall(kmeans.k_means_boosted, dataset, k, max_iter)
                        pro_kd.runcall(kmeans.k_means_kd_tree, dataset, k, max_iter)

                        # st_classic = pstats.Stats(pro_classic)
                        st_boosted = pstats.Stats(pro_boosted)
                        st_kd = pstats.Stats(pro_kd)
                    # st_classic.strip_dirs().sort_stats('cumulative').print_stats(20)
                    # st_boosted.strip_dirs().sort_stats('cumulative').print_stats(20)
                    # st_kd.strip_dirs().sort_stats('cumulative').print_stats(20)

                    # for method_name, total_time, cumulative_time, per_call_time in KmeansProfile.get_running_times(
                    #         st_classic):
                    #     KmeansProfile.write_row(f, 'classic', n, k, method_name, total_time, cumulative_time,
                    #                             per_call_time)
                    #
                    for method_name, total_time, cumulative_time, per_call_time in KmeansProfile.get_running_times(
                            st_boosted):
                        KmeansProfile.write_row(f, 'boosted', n, k, method_name, total_time, cumulative_time,
                                                per_call_time)

                    for method_name, total_time, cumulative_time, per_call_time in KmeansProfile.get_running_times(
                            st_kd):
                        KmeansProfile.write_row(f, 'kdtree', n, k, method_name, total_time, cumulative_time,
                                                per_call_time)

                    f.flush()


if __name__ == '__main__':
    unittest.main()
