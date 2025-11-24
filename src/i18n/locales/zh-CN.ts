/**
 * 中文（简体）翻译
 */

import type { TranslationData } from '../types';

export const zhCN: TranslationData = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    confirm: '确认',
    close: '关闭',
    edit: '编辑',
    create: '创建',
    search: '搜索',
    settings: '设置',
    export: '导出',
    import: '导入',
    back: '返回',
    next: '下一步',
    finish: '完成',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    switchLanguage: '切换语言',

    languageSwitcher: {
      tooltip: '这里可以切换语言',
      chinese: '中文',
      english: 'English',
    },
  },

  pages: {
    mainView: {
      title: 'Prompt Studio',
      noProject: '请先选择或创建项目',
      noProjectHint: '点击左侧"创建项目"按钮开始',
      versionName: '版本名称',
      versionNamePlaceholder: '(可选) 为版本添加名称',
      attachments: '附件',
    },

    settings: {
      title: '设置',
      
      local: {
        title: '本地导入导出',
        exportZip: '导出为 ZIP',
        exportDescription: '将所有项目和版本导出为 ZIP 文件',
        importZip: '从 ZIP 导入',
        unsupportedFormat: '不支持的文件格式',
        importSuccess: '导入成功',
        importFailed: '导入失败',
        exportFailed: '导出失败',
      },

      webdav: {
        title: 'WebDAV 配置',
        serverUrl: '服务器地址',
        username: '用户名',
        password: '密码',
        testConnection: '测试连接',
        testing: '测试中...',
        connected: '已连接',
        connectionSuccess: '连接成功',
        connectionFailed: '连接失败',
        configureFirst: '请先配置 WebDAV',
        backupToWebdav: '备份到 WebDAV',
        restoreFromWebdav: '从 WebDAV 恢复',
        backingUp: '备份中...',
        loading: '加载中...',
        backupSuccess: '备份成功',
        backupFailed: '备份失败',
        restoreSuccess: '恢复成功',
        restoreFailed: '恢复失败',
        confirmRestore: '确定要恢复此备份吗？当前数据将被覆盖！',
        restoreModalTitle: '选择要恢复的备份',
        noBackups: '暂无备份',
        restore: '恢复',
        delete: '删除',
        confirmDelete: '确定要删除此备份吗？',
        deleteSuccess: '删除成功',
        deleteFailed: '删除失败',
      },

      errors: {
        unknown: '未知错误',
        loadBackupsFailed: '加载备份列表失败',
      },
    },

    snippetLibrary: {
      title: '代码片段库',
      createSnippet: '创建片段',
      editSnippet: '编辑片段',
      deleteSnippet: '删除片段',
      snippetName: '片段名称',
      snippetContent: '片段内容',
      noSnippets: '暂无代码片段',
    },
  },

  components: {
    editor: {
      placeholder: '在此输入提示词...',
    },

    toolbar: {
      saveNew: '保存新版本',
      saveInPlace: '原地保存',
      compare: '对比',
      export: '导出',
      snippets: '片段',
    },

    sidebar: {
      projects: '项目',
      createProject: '创建项目',
      createFolder: '创建文件夹',
      renameProject: '重命名',
      deleteProject: '删除',
      noProjects: '暂无项目',
      projectName: '项目名称',
      folderName: '文件夹名称',
      expandSidebar: '展开侧边栏',
      collapseSidebar: '折叠侧边栏',
    },

    canvas: {
      search: '搜索',
      searchPlaceholder: '搜索版本...',
      noResults: '未找到匹配的版本',
      selectProject: '请选择一个项目',
      prevResult: '上一个结果 (Shift+Enter)',
      nextResult: '下一个结果 (Enter)',
      clearSearch: '清空搜索',
      closeSearch: '关闭搜索 (ESC)',
      compare: '对比',
      exitCompare: '退出对比',
      enterCompare: '点击对比进入对比选择模式',
      deleteVersion: '删除此版本',
      confirmDelete: '确定删除此版本吗？子版本将连接到父版本。',
      deleteFailed: '删除失败',
      zoomIn: '放大',
      zoomOut: '缩小',
      resetView: '重置视图',
    },

    versionCard: {
      createdAt: '创建时间',
      updatedAt: '更新时间',
      duplicate: '重复',
      delete: '删除',
      compare: '对比',
      emptyContent: '空内容',
      leafNode: '叶子节点（可原地更新）',
    },

    compareModal: {
      title: '版本对比',
      source: '源版本',
      target: '目标版本',
      close: '关闭',
      noDifference: '两个版本内容相同',
      similarity: '相似度',
      score: '评分',
      notes: '备注',
    },

    attachmentGallery: {
      upload: '上传附件',
      delete: '删除',
      noAttachments: '暂无附件',
      unsupportedType: '不支持的文件类型',
      fileTooLarge: '文件超过 50MB 限制',
      uploadFailed: '上传失败',
      confirmDelete: '确定删除此附件吗？',
      deleteFailed: '删除失败',
      fileMissing: '附件文件已丢失或损坏',
      downloadFailed: '下载失败',
      clickToUpload: '点击上传',
      imageVideo: '图片/视频',
      maxSize: '最大50MB',
      attachmentMissing: '附件丢失',
      preview: '预览',
      download: '下载',
    },

    versionMeta: {
      clearScore: '清除评分',
      noNotes: '暂无备注',
      addNotes: '添加备注...',
      done: '完成',
    },
  },

  sampleData: {
    projectName: '示例项目',
    versions: {
      root: {
        name: '小狗嬉戏',
        content: '一只可爱的小狗在春意盎然的公园草地上嬉戏',
      },
      branch1: {
        name: '帅气小狗',
        content: '一只威风凛凛帅气的德牧在春意盎然的公园草地上嬉戏',
      },
      branch2: {
        name: '冬日小狗',
        content: '一只可爱的小狗在冬季白雪覆盖的公园草地上嬉戏',
      },
    },
  },

  errors: {
    generic: '发生错误',
    saveFailed: '保存失败',
    loadFailed: '加载失败',
    deleteFailed: '删除失败',
    exportFailed: '导出失败',
    importFailed: '导入失败',
  },
};