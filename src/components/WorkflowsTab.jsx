import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    ReactFlowProvider,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Trash2, Play, Bot, Smartphone, Terminal, StopCircle } from 'lucide-react';
import MessageNode from './nodes/MessageNode';
import StartNode from './nodes/StartNode';
import TriggerNode from './nodes/TriggerNode';
import DelayNode from './nodes/DelayNode';
import Sidebar from './Sidebar';
import { WorkflowRunner } from '../services/WorkflowRunner';
import { evolutionApi } from '../services/api';

const nodeTypes = {
    messageNode: MessageNode,
    startNode: StartNode,
    triggerNode: TriggerNode,
    delayNode: DelayNode
};

const initialNodes = [
    { id: 'trigger-1', type: 'triggerNode', position: { x: 100, y: 100 }, data: { keywords: 'hi, hello' } },
];

const Flow = ({ instances, defaultInstance }) => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    // Runner State
    const [targetInstance, setTargetInstance] = useState(defaultInstance || '');
    const [testNumber, setTestNumber] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [isListening, setIsListening] = useState(false);

    const runnerRef = useRef(null);
    const processedRef = useRef(new Set()); // Track processed message IDs

    // Load from local storage
    useEffect(() => {
        const savedFlow = localStorage.getItem('evo_workflow_1');
        if (savedFlow) {
            const flow = JSON.parse(savedFlow);
            if (flow) {
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
            }
        }
    }, []);

    // Update default instance if props change
    useEffect(() => {
        if (!targetInstance && defaultInstance) setTargetInstance(defaultInstance);
    }, [defaultInstance]);

    // Polling for Auto-Response
    useEffect(() => {
        let interval;
        if (isListening && targetInstance) {
            const checkMessages = async () => {
                try {
                    // Fetch last 10 messages
                    const msgs = await evolutionApi.getMessages(targetInstance, 'status@broadcast', 10).catch(() => []) || [];
                    // Note: The API usually requires a remoteJid. Using a workaround or checking all chats is better but expensive.
                    // Assuming we can get recent messages via a different endpoint or we just pick the first chat for demo
                    // Evolution API logic: fetchChats -> then fetch messages for changed chats.
                    // For MVP: let's fetch chats, sort by updated, get last message.

                    const chats = await evolutionApi.getChats(targetInstance);
                    const updatedChats = chats.sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 5); // top 5 active chats

                    for (const chat of updatedChats) {
                        const remoteJid = chat.id;
                        const messages = await evolutionApi.getMessages(targetInstance, remoteJid, 1);
                        if (messages && messages.length > 0) {
                            const lastMsg = messages[0];
                            const msgId = lastMsg.key.id;
                            const fromMe = lastMsg.key.fromMe || false;
                            const content = lastMsg.message?.conversation || lastMsg.message?.extendedTextMessage?.text || '';
                            const sender = remoteJid.split('@')[0];

                            if (!fromMe && !processedRef.current.has(msgId) && content) {
                                // Check Trigger Keywords
                                const triggerNode = nodes.find(n => n.type === 'triggerNode');
                                if (triggerNode) {
                                    const keywords = (triggerNode.data.keywords || '').split(',').map(k => k.trim().toLowerCase());
                                    if (keywords.some(k => content.toLowerCase().includes(k))) {
                                        processedRef.current.add(msgId);
                                        addLog(`Auto-Trigger: Match "${content}" from ${sender}`, 'success');
                                        runFlow(sender); // Run the flow for this sender
                                    }
                                }
                            }
                            // Mark checked even if no match to avoid re-processing same old messages forever
                            processedRef.current.add(msgId);
                        }
                    }
                } catch (e) {
                    console.error("Poll Error", e);
                }
            };

            interval = setInterval(checkMessages, 5000); // Check every 5s
            addLog('Auto-Responder Active (Polling)', 'info');
        } else {
            if (interval) clearInterval(interval);
            if (!isListening && logs.some(l => l.msg.includes('Active'))) addLog('Auto-Responder Stopped', 'info');
        }
        return () => clearInterval(interval);
    }, [isListening, targetInstance, nodes]);


    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 } }, eds)), [setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const newNode = { id: `${type}-${Date.now()}`, type, position, data: { keywords: type === 'triggerNode' ? 'hi' : '' } };
            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );

    const saveFlow = () => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            localStorage.setItem('evo_workflow_1', JSON.stringify(flow));
            alert('Workflow saved successfully!');
        }
    };

    const clearFlow = () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            setNodes([]);
            setEdges([]);
        }
    }

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev.slice(0, 50)]);
    }

    const runFlow = async (targetOverride = null) => {
        const numberToUse = targetOverride || testNumber;
        if (!targetInstance || !numberToUse) return alert('Instance and Number required');

        setIsRunning(true);
        const flow = { nodes, edges };
        runnerRef.current = new WorkflowRunner(flow, targetInstance, evolutionApi);

        // Wire up logs
        runnerRef.current.onLog = (logEntry) => {
            setLogs(prev => [logEntry, ...prev]);
        };

        await runnerRef.current.run(numberToUse);
        setIsRunning(false);
    }

    const stopFlow = () => {
        if (runnerRef.current) runnerRef.current.stop();
        setIsRunning(false);
    }

    return (
        <div className="dndflow" style={{ width: '100%', height: 'calc(100vh - 140px)', display: 'flex' }}>
            <Sidebar />
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, display: 'flex', gap: '10px' }}>
                    <button className="btn btn-glass" onClick={clearFlow} style={{ color: '#f87171' }}><Trash2 size={16} /> Clear</button>
                    <button className="btn btn-primary" onClick={saveFlow}><Save size={16} /> Save</button>
                </div>

                {/* Runner Controls Overlay */}
                <div className="glass" style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    zIndex: 10,
                    padding: '16px',
                    borderRadius: '16px',
                    width: '320px',
                    maxHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        <Terminal size={18} className="text-primary" />
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Flow Engine</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select className="glass-input" value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px' }}>
                                <option value="">Select Instance...</option>
                                {(instances || []).map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                            </select>
                        </div>
                        {!isListening && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" placeholder="Number (e.g 91700...)" value={testNumber} onChange={e => setTestNumber(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px' }} />
                                <button className={`btn ${isRunning ? 'btn-glass' : 'btn-primary'}`} style={{ padding: '8px 12px' }} onClick={isRunning ? stopFlow : () => runFlow()}>
                                    {isRunning ? <StopCircle size={14} color="#f87171" /> : <Play size={14} />}
                                </button>
                            </div>
                        )}

                        <button
                            className={`btn ${isListening ? 'btn-primary' : 'btn-glass'}`}
                            onClick={() => setIsListening(!isListening)}
                            style={{ justifyContent: 'center', gap: '8px', fontSize: '12px', borderColor: isListening ? '#10b981' : '' }}
                        >
                            <Bot size={14} /> {isListening ? 'Auto-Responder Active' : 'Start Auto-Responder'}
                        </button>
                    </div>

                    <div style={{ flex: 1, minHeight: '100px', maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', fontSize: '10px', fontFamily: 'monospace' }}>
                        {logs.length === 0 && <span style={{ color: 'rgba(255,255,255,0.3)' }}>Logs will appear here...</span>}
                        {logs.map((l, i) => (
                            <div key={i} style={{ marginBottom: '4px', color: l.type === 'error' ? '#f87171' : l.type === 'success' ? '#10b981' : l.type === 'warning' ? '#f59e0b' : 'rgba(255,255,255,0.7)' }}>
                                <span style={{ opacity: 0.5, marginRight: '6px' }}>[{l.time}]</span>{l.msg}
                            </div>
                        ))}
                    </div>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background color="#333" gap={20} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};

export default function WorkflowsTab(props) {
    return (
        <ReactFlowProvider>
            <Flow {...props} />
        </ReactFlowProvider>
    );
}
