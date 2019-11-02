from scipy.spatial import KDTree
from typing import Optional, List, Tuple

NOISE = -1


def dbscan(points: List[Tuple], eps: float, min_points: int) -> List[int]:
    """Template for k-means method: it takes a partitioning function as input.

    Args:
        points: A list of points to cluster.
        eps: The radius `epsilon` of the dense regions.
        min_points: The minimum number of points that needs to be within a distance `eps` for a point to be a core point.

    Returns:
        A list of the cluster indices for each point.
    """
    n = len(points)
    cluster_indices: List[Optional[int]] = [None] * n
    current_index = 0
    kd_tree = KDTree(points)
    for i in range(n):
        if cluster_indices[i] is not None:
            continue
        process_set = {i}
        cluster_indices[i] = NOISE
        current_index += 1
        while len(process_set) > 0:
            j = process_set.pop()
            neighbors = kd_tree.query(points[j], k=None, distance_upper_bound=eps)
            if len(neighbors) < min_points:
                continue
            cluster_indices[j] = current_index
            process_set |= filter(lambda p: cluster_indices[p] is None or (p != j and cluster_indices[p] == NOISE),
                                  neighbors)
    return cluster_indices
