import React from 'react';
import { useProjectStore } from '@/store/projectStore';

const ProjectList: React.FC = () => {
  const { projects, currentProjectId, setCurrentProject, deleteProject, loadProjects } =
    useProjectStore();

  const handleDeleteProject = async (id: string, name: string) => {
    if (confirm(`确定要删除项目 "${name}" 吗？所有版本和附件将被删除。`)) {
      await deleteProject(id);
      await loadProjects();
    }
  };

  if (projects.length === 0) {
    return (
      <div className="p-4 text-center text-surface-onVariant">
        <p>还没有项目</p>
        <p className="text-sm mt-2">点击上方按钮创建第一个项目</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`p-3 rounded-m3-small cursor-pointer transition-colors ${
            currentProjectId === project.id
              ? 'bg-primary-container text-primary-onContainer'
              : 'hover:bg-surface hover:shadow-m3-1'
          }`}
          onClick={() => setCurrentProject(project.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{project.name}</h3>
              <p className="text-xs opacity-70 mt-1">
                更新: {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.id, project.name);
              }}
              className="ml-2 p-1 hover:bg-error-container hover:text-error rounded"
              aria-label="删除项目"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
