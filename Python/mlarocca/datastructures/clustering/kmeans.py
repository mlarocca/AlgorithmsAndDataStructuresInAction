from collections import Counter
from itertools import groupby
from random import random, sample
from scipy.spatial import KDTree
from statistics import mean
from operator import itemgetter
from typing import Callable, List, Tuple


def __euclidean_squared_distance(p: Tuple, q: Tuple) -> float:
    """The square of Euclidean distance between 2 points.

    Args:
        p: One of the points whose distance will be computed.
        q: One of the points whose distance will be computed.

    Returns:
        A floating point value for the Euclidean distance between the two arguments.
    """
    dim = len(p)
    return sum([(p[i] - q[i]) ** 2 for i in range(dim)])


def __group_points_by_cluster(points: List[Tuple], cluster_indices: List[int]) -> List[List[Tuple]]:
    """Takes a list of points and another list with their cluster_indices, groups the points by cluster_indices and
       returns the list of points.

    Args:
        points: The list of points to group.
        cluster_indices: The list of cluster indices for the points. Must reflect the order of `points`.

    Returns:
        A list of clusters, where each cluster is a list of points.
    """
    n = len(points)
    get_point_label = lambda i: cluster_indices[i]
    clusters = groupby(sorted(range(n), key=get_point_label), key=get_point_label)
    return [[points[i] for i in group] for _, group in clusters]


def __update_centroids(points: List[Tuple], cluster_indices: List[int]) -> List[Tuple]:
    """Update the centroids for each cluster, by computing the center of mass for the cluster.

    Args:
        points: The list of points to group.
        cluster_indices: The list of cluster indices for the points. Must reflect the order of `points`.

    Returns:
        The list of centroids for each cluster. The point at index `i` is the centroid for the `i`-th cluster.
    """
    dim = len(points[0])
    clusters = __group_points_by_cluster(points, cluster_indices)
    return [tuple(mean([p[j] for p in C]) for j in range(dim)) for C in clusters]


def __partition_points_compact(points: List[Tuple], centroids: List[Tuple]) -> List[int]:
    return [min(enumerate(map(lambda c: __euclidean_squared_distance(p, c), centroids)), key=itemgetter(1)) for p in points]


def __partition_points(points: List[Tuple], centroids: List[Tuple]) -> List[int]:
    """Finds the closest centroid to each point by going through all (centroid, data point) pairs and for each computing
       the distance between the two points.

    Args:
        points: The list of points to partition.
        centroids: The list of centroids to which the points will be assigned.

    Returns:
        A list of indices: for each point, the index of the closest centroid.
    """
    n = len(points)
    k = len(centroids)
    result = [0] * n

    for j in range(n):
        min_distance = float('inf')
        index = 0
        for i in range(k):
            distance = __euclidean_squared_distance(points[j], centroids[i])
            if distance < min_distance:
                min_distance = distance
                index = i

        result[j] = index
    return result


def __partition_points_kd_tree(points: List[Tuple], centroids: List[Tuple]) -> List[int]:
    """Finds the closest centroid to each point by creating a k-d tree and querying it for each point's NN.
    Note: kd_tree.query returns a tuple (distance, index), where index is the index of the closest point in k-d tree's
          data array, that has the same order than the initialization list.

    Args:
        points: The list of points to partition.
        centroids: The list of centroids to which the points will be assigned.

    Returns:
        A list of indices: for each point, the index of the closest centroid.
    """
    kd_tree = KDTree(centroids)
    return [kd_tree.query(p)[1] for p in points]


def __add_or_subtract_random_five_percent(p: Tuple[float]):
    """Given a point (a tuple of floats), adds +/- 5% to each of its coordinates.
       This allows to get a random point close to a given one.

    Args:
        p: A point to be used as reference.

    Returns:
        A random point close to the point in input (within 5% of each coordinate)
    """
    return [x * (0.95 + random() / 10) for x in p]


def __random_centroid_init(points, k):
    """ Randomly initialize the centroids.
        Chooses k points from the dataset, then for each of them
        and for each coordinate adds or subtracts a random value, within 5% of the coordinate value.
    """
    return [__add_or_subtract_random_five_percent(p) for p in sample(points, k)]


def k_means(points: List[Tuple], num_centroids: int, max_iter: int, partitioning_function: Callable) -> \
        Tuple[List[Tuple[float]], List[int]]:
    """Template for k-means method: it takes a partitioning function as input.

    Args:
        points: A list of points to cluster.
        num_centroids: The desired number of clusters.
        max_iter: The maximum number of iterations of k-mean's main cycle allowed.
        partitioning_function: The function to be used to partition points based on centroids. It is passed as
                               an argument just to profile k-d trees vs. brute force (in finding the closest centroid
                               to each point)

    Returns:
        A list of the centroids, and a list of the indices for each point.
    """
    centroids = __random_centroid_init(points, num_centroids)
    cluster_indices = []
    for _ in range(max_iter):
        new_cluster_indices = partitioning_function(points, centroids)
        # Comparing two lists... be aware of the hidden overhead of this implementation!
        # (hint: takes between 2n and 3n operations, instead of just between 1 and n)
        if Counter(new_cluster_indices) == Counter(cluster_indices):
            # no update from last iteration: the algorithm converged to a (local) minimum
            break
        else:
            # update cluster_indices
            cluster_indices = new_cluster_indices
        centroids = __update_centroids(points, cluster_indices)
    return centroids, cluster_indices


def k_means_classic(points: List[Tuple], num_centroids: int, max_iter: int) -> Tuple[List[Tuple[float]], List[int]]:
    return k_means(points, num_centroids, max_iter, __partition_points)


def k_means_kd_tree(points: List[Tuple], num_centroids: int, max_iter: int) -> Tuple[List[Tuple[float]], List[int]]:
    return k_means(points, num_centroids, max_iter, __partition_points_kd_tree)


def k_means_compact(points: List[Tuple], num_centroids: int, max_iter: int) -> Tuple[List[Tuple[float]], List[int]]:
    return k_means(points, num_centroids, max_iter, __partition_points_compact)
