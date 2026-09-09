# Improve a measured cost

Follow [Start](../start.md). Define the user-visible cost and a measurable target before optimizing: startup, first use, steady-state latency, memory, process count, network work, or model-context cost.

Measure a reproducible baseline in a disposable environment with a representative workload. Record host/runtime versions, loaded extensions, cold versus warm state, and variance. Use the host's available profiling facilities before building a harness. Keep measurements free of private prompts or credentials.

Trace the expensive path and identify the work that causes the measured cost. Consider deletion, reduced I/O, bounded output, or existing platform support before caching, concurrency, or custom scheduling. Consult [Pi resources](../../resources/pi.md) for lifecycle and deferred-loading behavior relevant to the target's version.

Test one hypothesis at a time. Compare baseline and treatment under the same conditions, with enough repeated measurements to distinguish noise. Verify the complete user path: deferring import can improve startup while breaking or slowing first use; reducing model-visible context can remove necessary information.

Use [Verify](../verify/test.md) to preserve correctness, cancellation, cleanup, and recovery. Report the metric, method, measured change, trade-offs, and limitations. Do not call an unmeasured rewrite a performance improvement. Stop when the agreed target is met or evidence shows a different bottleneck.
