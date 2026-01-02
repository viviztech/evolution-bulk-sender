import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Clock } from 'lucide-react';

export default memo(({ id, data }) => {
    const { setNodes } = useReactFlow();

    const onChange = (evt) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    node.data = { ...node.data, delay: evt.target.value };
                }
                return node;
            })
        );
    };

    return (
        <div className="glass" style={{
            padding: '0',
            borderRadius: '16px',
            minWidth: '200px',
            border: '1px solid #f59e0b',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ background: '#f59e0b', padding: '6px', borderRadius: '8px', color: 'black' }}>
                    <Clock size={16} />
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Wait Delay</div>
            </div>

            <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="number"
                        className="nodrag"
                        value={data.delay || 5}
                        onChange={onChange}
                        style={{
                            width: '60px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            padding: '8px',
                            textAlign: 'center',
                            outline: 'none'
                        }}
                    />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>seconds</span>
                </div>
            </div>

            <Handle type="target" position={Position.Left} style={{ background: '#fff', width: '10px', height: '10px' }} />
            <Handle type="source" position={Position.Right} style={{ background: '#f59e0b', width: '10px', height: '10px' }} />
        </div>
    );
});
