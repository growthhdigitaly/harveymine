import React, { useRef, useEffect } from 'react';
import { useHarvey } from '../../context/HarveyContext';

export const ControlsTab: React.FC = () => {
  const { isRunning, startHarvey, stopHarvey, logs } = useHarvey();
  const logViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logViewerRef.current) {
      logViewerRef.current.scrollTop = logViewerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="section active" id="controls">
      <div className="section-head">
        <div>
          <h2>Controls</h2>
          <p>
            Start or stop Harvey, and see what the background autonomous engine is doing right now.
          </p>
        </div>
      </div>

      <div className="control-panel">
        {/* Process Status Card */}
        <div className="card">
          <div className="status-big">
            <span className={`dot ${isRunning ? 'running' : 'stopped'}`} />
            <span className={`label ${isRunning ? 'running' : 'stopped'}`}>
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>

          <div className="status-meta muted" style={{ marginBottom: 16 }}>
            {isRunning
              ? 'PID 4892 &middot; Harvey wakes every few minutes, detects signals, writes tailored emails, and handles replies.'
              : 'Harvey is paused. No new prospects will be discovered or emails dispatched.'}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {isRunning ? (
              <button className="btn btn-secondary btn-sm" onClick={stopHarvey}>
                Stop Harvey
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={startHarvey}>
                Start Harvey
              </button>
            )}
          </div>
        </div>

        {/* Live Logs Viewer */}
        <div className="card flush">
          <div className="card-head">
            <h3>Live Process Log</h3>
            <span className="meta">{logs.length} entries</span>
          </div>
          <div
            ref={logViewerRef}
            className="log-viewer"
            style={{
              padding: 16,
              background: '#0B0B0D',
              color: '#C9C9D1',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              lineHeight: 1.7,
              height: 400,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {logs.join('\n')}
          </div>
        </div>
      </div>
    </div>
  );
};
