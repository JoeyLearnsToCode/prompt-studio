import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVersionStore } from '@/store/versionStore';
import DiffViewer from '@/components/version/DiffViewer';
import { Button } from '@/components/common/Button';

const DiffView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const leftId = searchParams.get('left');
  const rightId = searchParams.get('right');

  const { versions } = useVersionStore();
  
  const leftVersion = versions.find((v) => v.id === leftId);
  const rightVersion = versions.find((v) => v.id === rightId);

  const [mode, setMode] = useState<'side-by-side' | 'inline'>('side-by-side');

  if (!leftVersion || !rightVersion) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-xl mb-4">无效的版本对比请求</p>
          <Button onClick={() => navigate('/')}>返回主页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* 顶部工具栏 */}
      <header className="bg-primary text-onPrimary px-6 py-4 shadow-m3-1 flex items-center justify-between">
        <h1 className="text-xl font-bold">版本对比</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              size="small"
              variant={mode === 'side-by-side' ? 'filled' : 'outlined'}
              onClick={() => setMode('side-by-side')}
            >
              并排对比
            </Button>
            <Button
              size="small"
              variant={mode === 'inline' ? 'filled' : 'outlined'}
              onClick={() => setMode('inline')}
            >
              行内对比
            </Button>
          </div>
          <Button variant="outlined" size="small" onClick={() => navigate('/')}>
            关闭
          </Button>
        </div>
      </header>

      {/* Diff 视图 */}
      <div className="flex-1 overflow-hidden">
        <DiffViewer
          leftContent={leftVersion.content}
          rightContent={rightVersion.content}
          leftLabel={`版本 ${new Date(leftVersion.createdAt).toLocaleString()}`}
          rightLabel={`版本 ${new Date(rightVersion.createdAt).toLocaleString()}`}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default DiffView;
