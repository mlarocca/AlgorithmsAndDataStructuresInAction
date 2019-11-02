import heapq

from scipy.spatial import KDTree
from typing import Optional, List, Tuple

NOISE = -1


def optics(points: List[Tuple], eps: float, min_points: int) -> Tuple[List[float], List[int]]:
    """OPTICS clustering.

    Args:
        points: A list of points to cluster.
        eps: The radius `epsilon` of the dense regions.
        min_points: The minimum number of points that needs to be within a distance `eps` for a point to be a core point.

    Returns:
        A list of points indices, and their reachability distance. The first list is an ordering on `points`,
        while the second list follows the order of the elements of `points`.
        So
    """

    def core_distance(distances: List[float]) -> Optional[float]:
        if len(distances) < min_points:
            return None
        return distances[min_points - 1]

    def update(neighbors: List[int], distances: List[float], p: int, seeds: List[Tuple[float, int]]) -> \
            List[Tuple[float, int]]:
        core_dist = core_distance(distances)
        n_d = zip(neighbors, distances)

        for q, dist in n_d:
            if not processed[q]:
                new_r_dist = max(core_dist, dist)
                old_r_dist = reachability_distances[q]
                if old_r_dist is None:
                    reachability_distances[q] = new_r_dist
                    heapq.heappush(seeds, (new_r_dist, q))
                elif new_r_dist < old_r_dist:
                    reachability_distances[q] = new_r_dist
                    for i in range(len(seeds)):
                        if seeds[i][1] == q:
                            seeds[i] = (new_r_dist, q)
                    # It would be more efficient with an implementation of a "update priority"
                    heapq.heapify(seeds)
        return seeds

    n = len(points)
    processed = [False] * n
    reachability_distances: List[Optional[float]] = [None] * n
    kd_tree = KDTree(points)
    ordered_list = []

    for p in range(n):
        if processed[p]:
            continue

        ordered_list.append(p)
        processed[p] = True
        p_distances, p_neighbors = kd_tree.query(points[p], k=None, distance_upper_bound=eps)

        if core_distance(p_distances) is not None:
            #reachability_distances[p] = core_distance(p_distances)
            seeds: List[Tuple[float, int]] = []
            seeds = update(p_neighbors, p_distances, p, seeds)
            while len(seeds) > 0:
                (_, q) = heapq.heappop(seeds)
                q_distances, q_neighbors = kd_tree.query(points[q], k=None, distance_upper_bound=eps)
                processed[q] = True
                ordered_list.append(q)
                if core_distance(q_distances) is not None:
                    seeds = update(q_neighbors, q_distances, q, seeds)

    return reachability_distances, ordered_list


def optics_to_clusters(ordering: List[int], reachability_distances: List[float], eps: float):
    """ Take the results from OPTICS clustering algorithm and a threshold for epsilon, and form clusters.
        To form the clusters, scans the dataset's reachability distances in the same order as they were processed
        by OPTICS; points are added to the same cluster until a point with reachability distance > eps (or equal to
        None) is found.
    Args:
        ordering: An indirect ordering array: the order in which points in the dataset where processed by OPTICS.
        reachability_distances: The list of reachability distances for each point in the dataset. This array has the
        same ordering as points in the dataset.
        eps: Cutoff value for the reachability distance: points with larger values will be considered outliers.

    Returns:
        An array with the cluster index for each point in the original dataset.
    """
    n = len(ordering)
    cluster_indices = [NOISE] * n
    current_cluster = 0
    increment_cluster_index = False
    for i in range(n):
        r_dist = reachability_distances[ordering[i]]
        if r_dist is not None and r_dist <= eps:
            if increment_cluster_index:
                current_cluster += 1
                # the first point of a cluster will always have r_dist == None
                cluster_indices[ordering[i - 1]] = current_cluster
            cluster_indices[ordering[i]] = current_cluster
            increment_cluster_index = False
        else:
            increment_cluster_index = True
    return cluster_indices