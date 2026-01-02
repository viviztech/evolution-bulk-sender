import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { MessageSquare } from 'lucide-react';

export default memo(({ id, data }) => {
    const { setNodes } = useReactFlow();

    const onChange = (evt) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    node.data = { ...node.data, label: evt.target.value };
                }
                return node;
            })
        );
    };

    return (
        <div className="glass" style={{
            padding: '0',
            borderRadius: '16px',
            minWidth: '280px',
            border: '1px solid hsl(var(--primary) / 0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ background: 'hsl(var(--primary))', padding: '6px', borderRadius: '8px', color: 'black' }}>
                    <MessageSquare size={16} />
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Send Message</div>
            </div>

            <div style={{ padding: '16px' }}>
                <textarea
                    className="nodrag"
                    value={data.label}
                    onChange={onChange}
                    placeholder="Type your message..."
                    rows={3}
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px',
                        fontSize: '12px',
                        resize: 'none',
                        outline: 'none'
                    }}
                />
                <div style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    Supports specialized formatting
                </div>
            </div>

            <Handle type="target" position={Position.Left} style={{ background: '#fff', width: '10px', height: '10px' }} />
            <Handle type="source" position={Position.Right} style={{ background: 'hsl(var(--primary))', width: '10px', height: '10px' }} />
        </div>
    );
});
