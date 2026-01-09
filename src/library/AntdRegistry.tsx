'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { AntdRegistry as AntdStyledRegistry } from '@ant-design/nextjs-registry';

const AntdRegistry = ({ children }: { children: React.ReactNode }) => {
  return (
    <AntdStyledRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#3b82f6',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            colorInfo: '#3b82f6',
            borderRadius: 8,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
          components: {
            Button: {
              controlHeight: 40,
              fontSize: 15,
              borderRadius: 8,
            },
            Input: {
              controlHeight: 42,
              fontSize: 15,
              borderRadius: 8,
            },
            Card: {
              borderRadiusLG: 16,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdStyledRegistry>
  );
};

export default AntdRegistry;
