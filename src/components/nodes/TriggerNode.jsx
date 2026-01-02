import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Zap } from 'lucide-react';

export default memo(({ id, data }) => {
    const { setNodes } = useReactFlow();

    const onChange = (evt) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    node.data = { ...node.data, keywords: evt.target.value };
                }
                return node;
            })
        );
    };

    return (
        <div className="glass" style={{
            padding: '0',
            borderRadius: '16px',
            minWidth: '250px',
            border: '1px solid #10b981',
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
                <div style={{ background: '#10b981', padding: '6px', borderRadius: '8px', color: 'black' }}>
                    <Zap size={16} />
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Trigger: Keywords</div>
            </div>

            <div style={{ padding: '16px' }}>
                <input
                    type="text"
                    className="nodrag"
                    value={data.keywords || ''}
                    onChange={onChange}
                    placeholder="hi, hello, price"
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px',
                        fontSize: '12px',
                        outline: 'none'
                    }}
                />
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    Comma separated keywords
                </div>
            </div>

            <Handle type="source" position={Position.Right} style={{ background: '#10b981', width: '10px', height: '10px' }} />
        </div>
    );
});
