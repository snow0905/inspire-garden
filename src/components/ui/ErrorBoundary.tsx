// src/components/ui/ErrorBoundary.tsx
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            padding: '40px 24px',
            margin: '16px',
            borderRadius: '16px',
            background: 'rgba(255,240,240,0.9)',
            border: '1px solid rgba(237,114,110,0.3)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '16px', color: '#ed726e', marginBottom: '8px' }}>
            😥 页面加载出错
          </p>
          <p style={{ fontSize: '12px', color: '#947453', wordBreak: 'break-all' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '12px',
              padding: '8px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(237,114,110,0.4)',
              background: 'white',
              color: '#ed726e',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
