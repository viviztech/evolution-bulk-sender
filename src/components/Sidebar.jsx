import React from 'react';
import { MessageSquare, Clock, Zap } from 'lucide-react';

export default () => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="glass" style={{
            width: '240px',
            padding: '20px',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div className="description" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
                Drag nodes to the canvas
            </div>

            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'triggerNode')} draggable style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #10b981',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <Zap size={16} color="#10b981" />
                <span style={{ fontSize: '13px' }}>Trigger</span>
            </div>

            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'messageNode')} draggable style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid hsl(var(--primary))',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <MessageSquare size={16} className="text-primary" />
                <span style={{ fontSize: '13px' }}>Send Message</span>
            </div>

            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'delayNode')} draggable style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #f59e0b',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <Clock size={16} color="#f59e0b" />
                <span style={{ fontSize: '13px' }}>Delay</span>
            </div>
        </aside>
    );
};
