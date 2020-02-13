package org.mlarocca.graph;

import org.mlarocca.containers.priorityqueue.heap.Heap;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ConcurrentGraph<T> implements Graph<T> {

    private Map<T, ConcurrentVertex<T>> vertices;
    private ReentrantReadWriteLock readWriteLock = new ReentrantReadWriteLock();
    private ReentrantReadWriteLock.ReadLock readLock = readWriteLock.readLock();
    private ReentrantReadWriteLock.WriteLock writeLock = readWriteLock.writeLock();

    public ConcurrentGraph() {
        vertices = new ConcurrentHashMap<>();
    }

    public ConcurrentGraph(Collection<T> labels) throws IllegalArgumentException {
        this();
        labels.forEach(label -> {
            addVertex(label);
        });
    }

    public ConcurrentGraph(Collection<Vertex<T>> vertices, Collection<Edge<T>> edges) throws IllegalArgumentException {
        this();
        for (Vertex<T> vertex : vertices) {
            addVertex(vertex.getLabel(), vertex.getWeight());
        }
        for (Edge<T> edge : edges) {
            addEdge(edge.getSource(), edge.getDestination());
        }
    }

    @Override
    public void addVertex(T label, double weight) throws IllegalArgumentException {
        writeLock.lock();
        try {
            this.vertices.put(label, new ConcurrentVertex<>(label, weight));
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Optional<Vertex<T>> deleteVertex(T label) {
        writeLock.lock();
        try {
            // First removes all edges to label
            vertices.values().forEach(vertex -> {
                if (!vertex.getLabel().equals(label)) {
                    vertex.deleteEdgeTo(label);
                }
            });
            // Now it is safe to remove the vertex itself
            return Optional.ofNullable(vertices.remove(label));
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Optional<Vertex<T>> getVertex(T label) {
        readLock.lock();
        try {
            return Optional.ofNullable(vertices.get(label));
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean hasVertex(T label) {
        readLock.lock();
        try {
            return this.vertices.containsKey(label);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean addEdge(T source, T destination, double weight) throws IllegalArgumentException {
        if (!this.vertices.containsKey(destination)) {
            throw new IllegalArgumentException(vertexErrorMessage(destination));
        }
        writeLock.lock();
        try {
            return this.vertices.get(source).addEdgeTo(destination, weight);
        } catch (NullPointerException npe) {
            throw new IllegalArgumentException(vertexErrorMessage(source));
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Collection<Vertex<T>> getVertices() {
        return new HashSet<>(this.vertices.values());
    }

    @Override
    public Optional<Edge<T>> getEdge(T source, T destination) {
        readLock.lock();
        try {
            return Optional.ofNullable(vertices.get(source)).flatMap(vertex -> vertex.getEdgeTo(destination));
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean hasEdge(T source, T destination) {
        readLock.lock();
        try {
            return this.getVertex(source)
                    .flatMap(vertex -> vertex.getEdgeTo(destination))
                    .isPresent();
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Optional<Edge<T>> deleteEdge(T source, T destination) {
        writeLock.lock();
        try {
            return getVertex(source).flatMap(vertex -> ((ConcurrentVertex<T>) vertex).deleteEdgeTo(destination));
        } finally {
            writeLock.unlock();
        }
    }

    @Override
    public Collection<Edge<T>> getEdges() {
        readLock.lock();
        try {
            return vertices.values()
                    .stream()
                    .flatMap(vertex -> vertex.getOutEdges().stream())
                    .collect(Collectors.toSet());
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Collection<Edge<T>> getEdgesFrom(T source) {
        readLock.lock();
        try {
            return getVertex(source).map(Vertex::getOutEdges).orElse(new HashSet<>());
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Collection<Edge<T>> getEdgesTo(T destination) {
        readLock.lock();
        try {
            return vertices.values()
                    .stream()
                    .map(vertex -> vertex.getEdgeTo(destination))
                    .filter(Optional::isPresent)
                    .map(o -> o.get())
                    .collect(Collectors.toSet());
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Map<Vertex<T>, GraphSearchResult<T>> BFS(T source) throws NoSuchElementException {
        readLock.lock();
        try {
            return allDestinationsSearch(source, v -> false, edge -> 1.);
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public GraphSearchResult<T> BFS(T source, T destination) throws NoSuchElementException {
        readLock.lock();
        try {
            Vertex<T> destinationVertex = getVertex(destination).get();
            return singleDestinationSearch(source, destinationVertex, v -> v.equals(destinationVertex), edge -> 1.);
        } finally {
            readLock.unlock();
        }
    }


    @Override
    public Map<Vertex<T>, GraphSearchResult<T>> Dijkstra(T source) throws NoSuchElementException {
        readLock.lock();
        try {
            return allDestinationsSearch(source, v -> false, edge -> edge.getWeight());
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public GraphSearchResult<T> Dijkstra(T source, T destination) throws NoSuchElementException {
        readLock.lock();
        try {
            Vertex<T> destinationVertex = getVertex(destination).get();
            return singleDestinationSearch(
                    source,
                    destinationVertex,
                    v -> v.equals(destinationVertex),
                    edge -> edge.getWeight());
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public List<Vertex<T>> topologicalSort() {
        readLock.lock();
        try {
            Map<Vertex<T>, Integer> exitTime = DFS();
            return exitTime.entrySet()
                    .stream()
                    .sorted((o1, o2) -> Integer.compare(o1.getValue(), o2.getValue()))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean isAcyclic() {
        readLock.lock();
        try {
            // TODO
            return false;
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean isConnected() {
        readLock.lock();
        try {
            // TODO
            return false;
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean isStronglyConnected() {
        readLock.lock();
        try {
            Set<Set<Vertex<T>>> sccs = stronglyConnectedComponents();
            // iff there is only 1 Strongly Connected Component, and it contains all the vertices
            return sccs.size() == 1
                    && sccs.stream().findFirst().get().size() == this.vertices.size();
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public ConcurrentGraph<T> transpose() {
        readLock.lock();
        try {
            Stream<ConcurrentEdge<T>> transposedEdges = getEdges().stream()
                    .map(edge -> new ConcurrentEdge(
                            edge.getDestination(),
                            edge.getSource(),
                            edge.getWeight()));
            return new ConcurrentGraph<T>(this.getVertices(), transposedEdges.collect(Collectors.toSet()));
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public Set<Set<Vertex<T>>> stronglyConnectedComponents() {
        readLock.lock();
        try {
            final Set<Set<Vertex<T>>> components = new HashSet<>();
            final Set<Vertex<T>> visited = new HashSet<>();
            final AtomicBoolean isCyclic = new AtomicBoolean(false);
            final AtomicInteger currentTime = new AtomicInteger(this.vertices.size());

            final Graph<T> transpose = this.transpose();
            List<Vertex<T>> topologicalOrder = transpose.topologicalSort();

            // call DFS for every scc starting from the next remaining sink
            topologicalOrder.forEach(vT -> {
                // topologicalOrder contains vertices from the transpose graph
                // INVARIANT vT in GT => v in G
                Vertex<T> v = getVertex(vT.getLabel()).get();

                if (currentTime.get() > 0 && !visited.contains(vT)) {
                    // We don't actually need exit times here, so we reuse the map to keep track of the elements added at each call
                    final Map<Vertex<T>, Integer> exitTime = new HashMap<>();
                    DFS(v, visited, exitTime, currentTime, isCyclic);
                    Set<Vertex<T>> newComponent = exitTime.keySet();
                    if (newComponent.size() > 1) {
                        components.add(newComponent);
                    }
                }
            });

            return components;
        } finally {
            readLock.unlock();
        }
    }

    private String vertexErrorMessage(T label) {
        return "Unknown vertex " + label;
    }

    private Map<Vertex<T>, Integer> DFS() {
        final Set<Vertex<T>> visited = new HashSet<>();
        final Map<Vertex<T>, Integer> exitTime = new HashMap<>();
        final AtomicBoolean isCyclic = new AtomicBoolean(false);
        final AtomicInteger currentTime = new AtomicInteger(this.vertices.size());

        this.getVertices().forEach(v  -> {
            if (currentTime.get() > 0 && !visited.contains(v)) {
                DFS(v, visited, exitTime, currentTime, isCyclic);
            }
        });
        return exitTime;
    }

    /**
     * Explicit stack implementation.
     *
     * @param first
     * @param visited
     * @param exitTime
     * @param currentTime
     * @param isCyclic
     */
    void DFS(final Vertex<T> first,
            final Set<Vertex<T>> visited,
            final Map<Vertex<T>, Integer> exitTime,
            final AtomicInteger currentTime,
            final AtomicBoolean isCyclic) {

        if (visited.contains(first)) {
            // Safety check (never trust callers :D)
            return;
        }

        final Set<Vertex<T>> popped = new HashSet<>();
        final Stack<Vertex<T>> stack = new Stack<>();
        stack.push(first);

        do {
            Vertex<T> current = stack.pop();
            if (popped.contains(current)) {
                // We are popping the vertex for the second time, so we have already DFS-ed all its neighbours
                exitTime.put(current, currentTime.decrementAndGet());
                continue;
            } else {
                visited.add(current);
                popped.add(current);
                stack.push(current);
            }

            current.getOutEdges().forEach(edge -> {
                // INVARIANT: if (v, u) is in G, then both u and v are in G
                Vertex<T> u = getVertex(edge.getDestination()).get();
                if (!visited.contains(u)) {
                    visited.add(u);
                    stack.push(u);
                } else if (!exitTime.containsKey(u)) {
                    // There is a cycle!
                    isCyclic.set(true);
                }
            });
        } while (!stack.empty());
    }

    private GraphSearchResult<T> singleDestinationSearch(
            T source,
            Vertex<T> destinationVertex,
            Predicate<Vertex<T>> terminationCondition,
            Function<Edge<T>, Double> computeDistance) {

        Vertex<T> sourceVertex = getVertex(source).get();
        IntermediateSearchResult intermediateResult =
                search(sourceVertex, terminationCondition, computeDistance);
        return makeSearchResult(sourceVertex, destinationVertex, intermediateResult);
    }

    private Map<Vertex<T>, GraphSearchResult<T>> allDestinationsSearch(
            T source,
            Predicate<Vertex<T>> terminationCondition,
            Function<Edge<T>, Double> computeDistance) {

        Vertex<T> sourceVertex = getVertex(source).get();

        IntermediateSearchResult intermediateResult =
                search(sourceVertex, terminationCondition, computeDistance);
        // Now maps, using parallel streams, each vertex in the graph into a search result
        return this.vertices.values()
                .stream()
                .parallel()
                .collect(
                    Collectors.toMap(
                        Function.identity(),
                        destVertex -> makeSearchResult(sourceVertex, destVertex, intermediateResult)));
    }

    private IntermediateSearchResult search(
            Vertex<T> source,
            Predicate<Vertex<T>> terminationCondition,
            Function<Edge<T>, Double> computeDistance) {

        Heap<HeapEntry<T>> queue = new Heap<>();
        int n = this.vertices.size();
        final Map<Vertex<T>, Vertex<T>> predecessors = new HashMap<>(n);
        final Map<Vertex<T>, Double> distances = new HashMap<>(n);
        final Set<T> dequeued = new HashSet<T>(n);

        predecessors.put(source, null);
        distances.put(source, 0.);
        queue.add(new HeapEntry<>(source, 0.));

        do {
            // INVARIANT: queue is not empty
            Vertex<T> current = queue.top().get().getVertex();
            if (terminationCondition.test(current)) {
                // We have found what we were looking for!
                break;
            }
            // INVARIANT: all queued vertices have an entry in the queue
            double currentDistance = distances.get(current);

            for (Edge<T> edge : current.getOutEdges()) {
                // If a vertex contains already been dequeued, we have already found its distance
                if (dequeued.contains(edge.getDestination())) {
                    continue;
                }
                // INVARIANT: edge belongs to G, so edge.destination MUST belong to G
                Vertex<T> dest = this.getVertex(edge.getDestination()).get();
                double newDistance = currentDistance + computeDistance.apply(edge);
                if (newDistance < distances.getOrDefault(dest, Double.POSITIVE_INFINITY)){
                    distances.put(dest, newDistance);
                    predecessors.put(dest, current);
                    queue.add(new HeapEntry<>(dest, newDistance));
                }
            }
        } while (!queue.isEmpty());

        return new IntermediateSearchResult(predecessors, distances);
    }

    private GraphSearchResult<T> makeSearchResult(
            final Vertex<T> source,
            final Vertex<T> destination,
            final IntermediateSearchResult intermediateResult) {

        Optional<List<Edge<T>>> path = reconstructPath(destination, intermediateResult.predecessors);

        return new GraphSearchResult<T>() {
            @Override
            public Vertex<T> source() {
                return source;
            }

            @Override
            public Vertex<T> destination() {
                return destination;
            }

            @Override
            public Optional<List<Edge<T>>> path() {
                return path;
            }

            @Override
            public Double distance() {
                return intermediateResult.distances.getOrDefault(destination, Double.POSITIVE_INFINITY);
            }
        };
    }

    private Optional<List<Edge<T>>> reconstructPath(
            Vertex<T> destination,
            final Map<Vertex<T>, Vertex<T>> predecessors) {
        // No path. We know that predecessor(source) == null, so source would be in the map
        if (!predecessors.containsKey(destination)) {
            return Optional.empty();
        }
        List<Edge<T>> path = new ArrayList<>();

        while (true) {
            // INVARIANT: this loop will terminate because v != predecessors(v) for all v, and predecessor(source) == null
            Vertex<T> predecessor = predecessors.get(destination);
            if (predecessor == null) {
                break;
            }
            // INVARIANT: b/c of how predecessors is constructed, there MUST be an edge predecessor -> destination
            path.add(getEdge(predecessor.getLabel(), destination.getLabel()).get());
            destination = predecessor;
        }
        Collections.reverse(path);
        return Optional.of(path);
    }

    private class IntermediateSearchResult {
        final Map<Vertex<T>, Vertex<T>> predecessors;
        final Map<Vertex<T>, Double> distances;

        IntermediateSearchResult(Map<Vertex<T>, Vertex<T>> predecessors, Map<Vertex<T>, Double> distances) {
            this.predecessors = predecessors;
            this.distances = distances;
        }
    }

    private class HeapEntry<T> implements Comparable<HeapEntry<T>> {
        private Vertex<T> vertex;
        private double distance;

        public HeapEntry(Vertex<T> vertex, double distance) {
            this.vertex = vertex;
            this.distance = distance;
        }

        public Vertex<T> getVertex() {
            return vertex;
        }

        @Override
        public int compareTo(HeapEntry<T> o) {
            if (o == null) {
                return -1;
            }
            return Double.compare(this.distance, o.distance);
        }
    }
}
