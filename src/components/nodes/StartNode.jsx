import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

export default memo(({ data }) => {
    return (
        <div style={{
            padding: '12px 24px',
            borderRadius: '24px',
            background: 'hsl(var(--primary))',
            color: '#000',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold'
        }}>
            <Play size={18} fill="black" />
            <span>Start Flow</span>
            <Handle type="source" position={Position.Right} style={{ background: '#fff', width: '12px', height: '12px', right: '-6px' }} />
        </div>
    );
});
