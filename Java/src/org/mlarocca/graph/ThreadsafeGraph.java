package org.mlarocca.graph;

import org.apache.commons.lang3.NotImplementedException;
import org.json.simple.JSONObject;
import org.mlarocca.containers.priorityqueue.heap.Heap;

import java.io.IOException;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ThreadsafeGraph<T> implements Graph<T> {

    private Map<T, ThreadsafeVertex<T>> vertices;
    private ReentrantReadWriteLock readWriteLock = new ReentrantReadWriteLock();
    private ReentrantReadWriteLock.ReadLock readLock = readWriteLock.readLock();
    private ReentrantReadWriteLock.WriteLock writeLock = readWriteLock.writeLock();

    public static ThreadsafeGraph<Integer> completeGraph(int n) {
        if (n < 1) {
            throw new IllegalArgumentException("n must be positive");
        }
        ThreadsafeGraph<Integer> graph = new ThreadsafeGraph<>();
        for (int i = 1; i <= n; i++) {
            graph.addVertex(i);
        }

        for (int i = 1; i <= n; i++) {
            for (int j = i + 1; j <= n; j++) {
                graph.addEdge(i, j);
                graph.addEdge(j, i);
            }
        }

        return graph;
    }

    public static ThreadsafeGraph<Integer> completeBipartiteGraph(int n, int m) {
        if (n < 1) {
            throw new IllegalArgumentException("n must be positive");
        }
        if (m < 1) {
            throw new IllegalArgumentException("m must be positive");
        }
        ThreadsafeGraph<Integer> graph = new ThreadsafeGraph<>();
        for (int i = 1; i <= n; i++) {
            graph.addVertex(i);
        }
        for (int j = 1; j <= m; j++) {
            graph.addVertex(n + j);
        }
        for (int i = 1; i <= n; i++) {
            for (int j = n + 1; j <= n + m; j++) {
                graph.addEdge(i, j);
                graph.addEdge(j, i);
            }
        }

        return graph;
    }

    public ThreadsafeGraph() {
        vertices = new ConcurrentHashMap<>();
    }

    public ThreadsafeGraph(Collection<T> labels) throws IllegalArgumentException {
        this();
        labels.forEach(label -> {
            addVertex(label);
        });
    }

    public ThreadsafeGraph(Collection<Vertex<T>> vertices, Collection<Edge<T>> edges) throws IllegalArgumentException {
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
            this.vertices.put(label, new ThreadsafeVertex<>(label, weight));
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
            return getVertex(source).flatMap(vertex -> ((ThreadsafeVertex<T>) vertex).deleteEdgeTo(destination));
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
    public Collection<Edge<T>> getSimpleEdges() {
        // getEdges is already synchronized, no need to wrap it in another lock
        return getEdges().stream().filter(e -> !e.isLoop()).collect(Collectors.toSet());
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
                    .sorted(Comparator.comparingInt(Map.Entry::getValue))
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
            final Set<Vertex<T>> visited = new HashSet<>();
            final Map<Vertex<T>, Integer> exitTime = new HashMap<>();
            final AtomicBoolean isCyclic = new AtomicBoolean(false);
            final AtomicInteger currentTime = new AtomicInteger(this.vertices.size());

            this.getVertices().forEach(v -> {
                if (currentTime.get() > 0 && !visited.contains(v)) {
                    DFS(v, visited, exitTime, currentTime, isCyclic);
                }
            });
            return !isCyclic.get();
        } finally {
            readLock.unlock();
        }
    }

    @Override
    public boolean isConnected() {
        readLock.lock();
        try {
            Set<Set<Vertex<T>>> ccs = connectedComponents();
            // iff there is only 1 Connected Component, and it contains all the vertices
            return ccs.size() == 1
                    && ccs.stream().findFirst().get().size() == this.vertices.size();
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
    public boolean isComplete() {
        int n = this.vertices.size();
        // Graphs are stored as directed graphs: this means there are two directed edges per pair of vertices
        // So the total number of possible edges is  2 * [n * (n-1) / 2] = n * (n-1)
        return this.getSimpleEdges().size() == n * (n - 1);
    }

    @Override
    public boolean isBipartite(List<Set<Vertex<T>>> partitions) {
        if (!this.isConnected()) {
            // Disconnected graphs can't be bipartite
            return false;
        }
        int n = this.vertices.size();

        if (n < 2) {
            return false;
        }

        // Make sure we check  with an undirected graph
        Graph<T> sC = this.symmetricClosure();

        Queue<Vertex<T>> queue = new LinkedBlockingDeque<>();

        final Map<Vertex<T>, Boolean> colors = new HashMap<>(n);

        Vertex<T> source = sC.getVertices().iterator().next();

        colors.put(source, false);
        queue.add(source);

        do {
            // INVARIANT: queue is not empty
            Vertex<T> current = queue.remove();
            boolean color = colors.get(current);

            for (Edge<T> edge : sC.getEdgesFrom(current.getLabel())) {
                Vertex<T> dest = sC.getVertex(edge.getDestination()).get();

                // if the destination has already been colored with the same color as current vertex, the graph
                // can't be bipartite
                if (colors.containsKey(dest)) {
                    if (colors.get(dest) == color) {
                        return false;
                    }
                } else {
                    colors.put(dest, !color);
                    queue.add(dest);
                }
            }
        } while (!queue.isEmpty());

        // If it gets here, the graph is bipartite: we can add the
        partitions.clear();
        partitions.add(sC.getVertices().stream().filter(v -> colors.get(v) == true).collect(Collectors.toSet()));
        partitions.add(sC.getVertices().stream().filter(v -> colors.get(v) == false).collect(Collectors.toSet()));
        return true;
    }

    @Override
    public boolean isCompleteBipartite() {
        List<Set<Vertex<T>>> partitions = new ArrayList<>();
        if (!isBipartite(partitions)) {
            return false;
        }
        // Invariant: if a graph is bipartite, there should be exactly two non-empty partitions
        assert (partitions.size() == 2 && partitions.get(0).size() * partitions.get(1).size() > 0);

        // Graphs are stored as directed graphs, so there are 2 directed edges for each pair of vertices in opposite partitions
        return this.bipartiteIsComplete(partitions.get(0), partitions.get(1));
    }

    /**
     * Check if a bipartite graph is also complete
     * @param partition1
     * @param partition2
     * @return
     */
    private boolean bipartiteIsComplete(Set<Vertex<T>> partition1, Set<Vertex<T>> partition2) {
        // Invariant: this is a bipartite graph
        int n = partition1.size();
        int m = partition2.size();
        return this.getSimpleEdges().size() == 2 * n * m;
    }
    /**
     * Computes the induced sub-graph of this graph, given a subset of its vertices.
     * The induced sub-graph of a graph G is a new graph, with only a subset of its vertices; only the edges in G
     * that are adjacent to vertices in the sub-graph are included.
     *
     * @return The sub-graph induced by vertices.
     */
    @Override
    public Graph<T> inducedSubGraph(Set<T> vertices) {
        if (!this.getVertices().stream().map(Vertex::getLabel).collect(Collectors.toSet()).containsAll(vertices)) {
            throw new IllegalArgumentException("Invalid sub-graph: not all vertices passed belongs to the graph");
        }
        return new ThreadsafeGraph<>(
                this.getVertices().stream().filter(v -> vertices.contains(v.getLabel())).collect(Collectors.toSet()),
                getEdges()
                        .stream()
                        .filter(e -> vertices.contains(e.getSource()) && vertices.contains(e.getDestination()))
                        .collect(Collectors.toSet()));
    }

    @Override
    public ThreadsafeGraph<T> transpose() {
        readLock.lock();
        try {
            Stream<ThreadsafeEdge<T>> transposedEdges = getEdges().stream()
                    .map(edge -> new ThreadsafeEdge(
                            edge.getDestination(),
                            edge.getSource(),
                            edge.getWeight()));
            return new ThreadsafeGraph<T>(this.getVertices(), transposedEdges.collect(Collectors.toSet()));
        } finally {
            readLock.unlock();
        }
    }

    public Graph<T> symmetricClosure() {
        var edges = this.getEdges();
        Graph symmetricClosure = new ThreadsafeGraph(this.getVertices(), edges);
        for (Edge<T> e : edges) {
            if (!symmetricClosure.hasEdge(e.getDestination(), e.getSource())) {
                symmetricClosure.addEdge(e.getDestination(), e.getSource());
            }
        }
        return symmetricClosure;
    }

    public Graph<T> transitiveClosure() {
        throw new NotImplementedException("transitive closure");
    }

    @Override
    public Set<Set<Vertex<T>>> connectedComponents() {
        readLock.lock();
        try {
            ThreadsafeGraph<T> undirectedGraph = (ThreadsafeGraph<T>) this.symmetricClosure();

            final Set<Set<Vertex<T>>> components = new HashSet<>();
            final Set<Vertex<T>> visited = new HashSet<>();
            final AtomicBoolean isCyclic = new AtomicBoolean(false);
            final AtomicInteger currentTime = new AtomicInteger(this.vertices.size());

            // call DFS for every scc starting from the next remaining sink
            this.getVertices().forEach(v -> {
                if (currentTime.get() > 0 && !visited.contains(v)) {
                    // We don't actually need exit times here, so we reuse the map to keep track of the elements added at each call
                    final Map<Vertex<T>, Integer> exitTime = new HashMap<>();
                    undirectedGraph.DFS(v, visited, exitTime, currentTime, isCyclic);
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

    /**
     * Check if a graph is planar.
     * WARNING: implements the Kuratowski's method, which is factorial in (n+m): it can be used for small graphs only,
     *          do not call this method when n+m > 15.
     * @return True iff the graph is planar
     */
    public boolean isPlanar() {
        return isPlanar(this.symmetricClosure());
    }

    public JSONObject toJsonObject() {
        readLock.lock();
        try {
            JSONObject graph = new JSONObject();
            List<JSONObject> vertices = this.getVertices().stream().map(Vertex::toJsonObject).collect(Collectors.toList());
            graph.put("vertices", vertices);
            List<JSONObject> edges = this.getEdges().stream().map(Edge::toJsonObject).collect(Collectors.toList());
            graph.put("edges", edges);
            return graph;
        } finally {
            readLock.unlock();
        }
    }

    public String toJson() throws IOException {
        readLock.lock();
        try {
            JSONObject graph = this.toJsonObject();

            StringWriter stringWriter = new StringWriter();
            graph.writeJSONString(stringWriter);

            return stringWriter.toString();
        } finally {
            readLock.unlock();
        }
    }

    private String vertexErrorMessage(T label) {
        return "Unknown vertex " + label;
    }

    public Map<Vertex<T>, Integer> DFS() {
        final int n = this.vertices.size();
        final Set<Vertex<T>> visited = new HashSet<>(n);
        final Map<Vertex<T>, Integer> exitTime = new HashMap<>(n);
        final AtomicBoolean isCyclic = new AtomicBoolean(false);
        // Starts at n and decreases it as we finish visiting a vertices. Quick check for when we are done.
        final AtomicInteger currentTime = new AtomicInteger(n);

        this.getVertices().forEach(v -> {
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
    protected void DFS(final Vertex<T> first,
                       final Set<Vertex<T>> visited,
                       final Map<Vertex<T>, Integer> exitTime,
                       final AtomicInteger currentTime,
                       final AtomicBoolean isCyclic) {

        assert (!visited.contains(first));

        final Set<Vertex<T>> popped = new HashSet<>();
        final Stack<Vertex<T>> stack = new Stack<>();
        stack.push(first);

        do {
            Vertex<T> current = stack.pop();
            if (popped.contains(current)) {
                // We are popping the vertex for the second time, so we have already DFS-ed all its neighbours
                exitTime.put(current, currentTime.decrementAndGet());
            } else {
                visited.add(current);
                popped.add(current);
                stack.push(current);

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
            }
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
                // If a vertex has already been dequeued, we have already found its distance
                if (dequeued.contains(edge.getDestination())) {
                    continue;
                }
                // INVARIANT: edge belongs to G, so edge.destination MUST belong to G
                Vertex<T> dest = this.getVertex(edge.getDestination()).get();
                double newDistance = currentDistance + computeDistance.apply(edge);
                if (newDistance < distances.getOrDefault(dest, Double.POSITIVE_INFINITY)) {
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

    /**
     * Takes an undirected graph (the symmetric closure of any directed graph) and checks if its planar.
     */
    private static <T> boolean isPlanar(Graph<T> graph) {
        // A graph is planar iff all its connected components are planar.
        return graph
                .connectedComponents()
                .stream()
                .allMatch(cc -> isPlanarConnectedComponent(
                        graph.inducedSubGraph(cc.stream().map(Vertex::getLabel).collect(Collectors.toSet()))));
    }

    /**
     * Takes a connected, undirected graph, and check if its planar (by using Kuratowski's theorem)
     */
    private static <T> boolean isPlanarConnectedComponent(Graph<T> graph) {
        // invariant: graph is a connected symmetric closure
        int n = graph.getVertices().size();
        int m = graph.getSimpleEdges().size() / 2;

        if (n < 5) {
            return true;
        }
        if (m > 3 * n - 6) {
            return false;
        }

        if (graph.isComplete()) {
            // n >= 5
            return false;
        }

        List<Set<Vertex<T>>> partitions = new ArrayList<>();
        if (graph.isBipartite(partitions)) {
            int s1 = partitions.get(0).size();
            int s2 = partitions.get(1).size();
            // Check if it's complete bipartite and if both partitions are larger than 3 vertices
            if (s1 >= 3 && s2 >= 3 && m >= s1 * s2) {
                // K_3_3 or larger
                return false;
            }
        }

        Set<T> vertexLabels = graph.getVertices().stream().map(Vertex::getLabel).collect(Collectors.toSet());
        for (Vertex<T> v : graph.getVertices()) {
            vertexLabels.remove(v.getLabel());
            if (!isPlanar(graph.inducedSubGraph(vertexLabels))) {
                return false;
            }
            vertexLabels.add(v.getLabel());
        }

        Graph<T> subG = new ThreadsafeGraph<>(graph.getVertices(), graph.getEdges());
        for (Edge<T> e : graph.getSimpleEdges()) {
            if (e.getSource().toString().compareTo(e.getDestination().toString()) < 0) {
                subG.deleteEdge(e.getSource(), e.getDestination());
                subG.deleteEdge(e.getDestination(), e.getSource());
                if (!isPlanar(subG)) {
                    return false;
                }
                // We don't care about weight here
                subG.addEdge(e.getSource(), e.getDestination());
                subG.addEdge(e.getDestination(), e.getSource());
            }
        }
        return true;
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
