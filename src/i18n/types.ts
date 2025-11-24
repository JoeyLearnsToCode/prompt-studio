/**
 * i18n 类型定义
 * 定义支持的语言和翻译数据结构
 */

/**
 * 支持的语言代码
 * 当前支持：简体中文、美式英文
 */
export type Locale = 'zh-CN' | 'en-US';

/**
 * 语言配置
 */
export interface LocaleConfig {
  /** 语言代码 */
  code: Locale;
  /** 语言的显示名称（用于UI） */
  name: string;
  /** 语言的原生名称 */
  nativeName: string;
}

/**
 * 所有支持的语言配置
 */
export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: '中文',
    nativeName: '简体中文',
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English (US)',
  },
};

/**
 * 默认语言
 */
export const DEFAULT_LOCALE: Locale = 'en-US';

/**
 * 翻译数据的完整类型定义
 * 使用嵌套对象结构，按功能模块组织
 */
export interface TranslationData {
  /** 通用文本 */
  common: {
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    close: string;
    edit: string;
    create: string;
    search: string;
    settings: string;
    export: string;
    import: string;
    back: string;
    next: string;
    finish: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    switchLanguage: string;

    /** 语言切换器 */
    languageSwitcher: {
      tooltip: string;
      chinese: string;
      english: string;
    };
  };

  /** 页面文本 */
  pages: {
    /** 主视图 */
    mainView: {
      title: string;
      noProject: string;
      noProjectHint: string;
      versionName: string;
      versionNamePlaceholder: string;
      attachments: string;
    };

    /** 设置页 */
    settings: {
      title: string;
      
      local: {
        title: string;
        exportZip: string;
        exportDescription: string;
        importZip: string;
        unsupportedFormat: string;
        importSuccess: string;
        importFailed: string;
        exportFailed: string;
      };

      webdav: {
        title: string;
        serverUrl: string;
        username: string;
        password: string;
        testConnection: string;
        testing: string;
        connected: string;
        connectionSuccess: string;
        connectionFailed: string;
        configureFirst: string;
        backupToWebdav: string;
        restoreFromWebdav: string;
        backingUp: string;
        loading: string;
        backupSuccess: string;
        backupFailed: string;
        restoreSuccess: string;
        restoreFailed: string;
        confirmRestore: string;
        restoreModalTitle: string;
        noBackups: string;
        restore: string;
        delete: string;
        confirmDelete: string;
        deleteSuccess: string;
        deleteFailed: string;
      };

      errors: {
        unknown: string;
        loadBackupsFailed: string;
      };
    };

    /** 代码片段库 */
    snippetLibrary: {
      title: string;
      createSnippet: string;
      editSnippet: string;
      deleteSnippet: string;
      snippetName: string;
      snippetContent: string;
      noSnippets: string;
    };
  };

  /** 组件文本 */
  components: {
    /** 编辑器 */
    editor: {
      placeholder: string;
    };

    /** 工具栏 */
    toolbar: {
      saveNew: string;
      saveInPlace: string;
      compare: string;
      export: string;
      snippets: string;
    };

    /** 侧边栏 */
    sidebar: {
      projects: string;
      createProject: string;
      createFolder: string;
      renameProject: string;
      deleteProject: string;
      noProjects: string;
      projectName: string;
      folderName: string;
      expandSidebar: string;
      collapseSidebar: string;
    };

    /** 版本画布 */
    canvas: {
      search: string;
      searchPlaceholder: string;
      noResults: string;
      selectProject: string;
      prevResult: string;
      nextResult: string;
      clearSearch: string;
      closeSearch: string;
      compare: string;
      exitCompare: string;
      enterCompare: string;
      deleteVersion: string;
      confirmDelete: string;
      deleteFailed: string;
      zoomIn: string;
      zoomOut: string;
      resetView: string;
    };

    /** 版本卡片 */
    versionCard: {
      createdAt: string;
      updatedAt: string;
      duplicate: string;
      delete: string;
      compare: string;
      emptyContent: string;
      leafNode: string;
    };

    /** 对比模态框 */
    compareModal: {
      title: string;
      source: string;
      target: string;
      close: string;
      noDifference: string;
      similarity: string;
      score: string;
      notes: string;
    };

    /** 附件画廊 */
    attachmentGallery: {
      upload: string;
      delete: string;
      noAttachments: string;
      unsupportedType: string;
      fileTooLarge: string;
      uploadFailed: string;
      confirmDelete: string;
      deleteFailed: string;
      fileMissing: string;
      downloadFailed: string;
      clickToUpload: string;
      imageVideo: string;
      maxSize: string;
      attachmentMissing: string;
      preview: string;
      download: string;
    };

    /** 版本元数据卡片 */
    versionMeta: {
      clearScore: string;
      noNotes: string;
      addNotes: string;
      done: string;
    };
  };

  /** 示例数据 */
  sampleData: {
    projectName: string;
    versions: {
      root: {
        name: string;
        content: string;
      };
      branch1: {
        name: string;
        content: string;
      };
      branch2: {
        name: string;
        content: string;
      };
    };
  };

  /** 错误消息 */
  errors: {
    generic: string;
    saveFailed: string;
    loadFailed: string;
    deleteFailed: string;
    exportFailed: string;
    importFailed: string;
  };
}