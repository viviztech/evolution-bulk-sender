
export class WorkflowRunner {
    constructor(flow, instanceName, api) {
        this.nodes = flow.nodes;
        this.edges = flow.edges;
        this.instanceName = instanceName;
        this.api = api;
        this.running = false;
        this.logs = [];
        this.cancelFlag = false;
    }

    log(msg, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { time: timestamp, msg, type };
        this.logs.unshift(logEntry); // Newest first
        // We can emit an event here if we want real-time UI updates, 
        // but for now the caller can check .logs or we passed a callback?
        if (this.onLog) this.onLog(logEntry);
        console.log(`[Workflow ${this.instanceName}] ${msg}`);
    }

    stop() {
        this.cancelFlag = true;
        this.running = false;
        this.log('Flow execution stopped by user', 'error');
    }

    getNextNodes(nodeId) {
        const connectedEdges = this.edges.filter(e => e.source === nodeId);
        return connectedEdges.map(e => this.nodes.find(n => n.id === e.target));
    }

    async run(targetNumber) {
        if (!targetNumber) {
            this.log('Target number is required', 'error');
            return;
        }

        this.running = true;
        this.cancelFlag = false;
        this.log(`Starting flow for ${targetNumber} on ${this.instanceName}`, 'success');

        // Find trigger or start nodes
        // If specific trigger logic is needed (e.g. keyword match), the caller should handle that 
        // and tell us WHICH node triggered. For manual test, we start with any Start/Trigger node.
        const startNodes = this.nodes.filter(n => n.type === 'triggerNode' || n.type === 'startNode');

        if (startNodes.length === 0) {
            this.log('No Start or Trigger node found in flow', 'error');
            return;
        }

        // For simplicity in testing, run from the first found start node
        // In a real multi-trigger scenario, we'd pick the relevant one
        try {
            await this.processNode(startNodes[0], targetNumber);
            if (!this.cancelFlag) this.log('Flow execution finished successfully', 'success');
        } catch (error) {
            this.log(`Flow execution failed: ${error.message}`, 'error');
        } finally {
            this.running = false;
        }

        return this.logs;
    }

    async processNode(node, targetNumber) {
        if (this.cancelFlag || !node) return;

        // this.log(`Step: ${node.type} (${node.id.split('-')[0]})`);

        try {
            switch (node.type) {
                case 'messageNode':
                    const text = node.data.label;
                    if (text) {
                        this.log(`Sending message: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
                        await this.api.sendText(this.instanceName, targetNumber, text);
                        // Store delay options?
                    } else {
                        this.log('Skipping empty message node', 'warning');
                    }
                    break;

                case 'delayNode':
                    const delaySec = parseInt(node.data.delay || 5);
                    this.log(`Waiting ${delaySec} seconds...`);
                    // Sleep loop to allow cancellation
                    for (let i = 0; i < delaySec * 10; i++) {
                        if (this.cancelFlag) return;
                        await new Promise(r => setTimeout(r, 100));
                    }
                    break;

                case 'triggerNode':
                case 'startNode':
                    // Entry points, nothing to execute
                    break;

                default:
                    this.log(`Unknown node type: ${node.type}`, 'warning');
            }
        } catch (e) {
            throw e; // Propagate up
        }

        // Move to next nodes
        const nextNodes = this.getNextNodes(node.id);
        if (nextNodes.length > 0) {
            // Parallel execution for split paths
            await Promise.all(nextNodes.map(n => this.processNode(n, targetNumber)));
        }
    }
}
