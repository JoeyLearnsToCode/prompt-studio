/**
 * English (US) translations
 */

import type { TranslationData } from '../types';

export const enUS: TranslationData = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    settings: 'Settings',
    export: 'Export',
    import: 'Import',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    switchLanguage: 'Switch Language',

    languageSwitcher: {
      tooltip: 'Switch language here',
      chinese: '中文',
      english: 'English',
    },
  },

  pages: {
    mainView: {
      title: 'Prompt Studio',
      noProject: 'Please select or create a project',
      noProjectHint: 'Click "Create Project" button on the left to start',
      versionName: 'Version Name',
      versionNamePlaceholder: '(Optional) Add a name for this version',
      attachments: 'Attachments',
    },

    settings: {
      title: 'Settings',
      
      local: {
        title: 'Local Import/Export',
        exportZip: 'Export as ZIP',
        exportDescription: 'Export all projects and versions as a ZIP file',
        importZip: 'Import from ZIP',
        unsupportedFormat: 'Unsupported file format',
        importSuccess: 'Import successful',
        importFailed: 'Import failed',
        exportFailed: 'Export failed',
      },

      webdav: {
        title: 'WebDAV Configuration',
        serverUrl: 'Server URL',
        username: 'Username',
        password: 'Password',
        testConnection: 'Test Connection',
        testing: 'Testing...',
        connected: 'Connected',
        connectionSuccess: 'Connection successful',
        connectionFailed: 'Connection failed',
        configureFirst: 'Please configure WebDAV first',
        backupToWebdav: 'Backup to WebDAV',
        restoreFromWebdav: 'Restore from WebDAV',
        backingUp: 'Backing up...',
        loading: 'Loading...',
        backupSuccess: 'Backup successful',
        backupFailed: 'Backup failed',
        restoreSuccess: 'Restore successful',
        restoreFailed: 'Restore failed',
        confirmRestore: 'Are you sure you want to restore this backup? Current data will be overwritten!',
        restoreModalTitle: 'Select backup to restore',
        noBackups: 'No backups available',
        restore: 'Restore',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this backup?',
        deleteSuccess: 'Delete successful',
        deleteFailed: 'Delete failed',
      },

      errors: {
        unknown: 'Unknown error',
        loadBackupsFailed: 'Failed to load backup list',
      },
    },

    snippetLibrary: {
      title: 'Snippet Library',
      createSnippet: 'Create Snippet',
      editSnippet: 'Edit Snippet',
      deleteSnippet: 'Delete Snippet',
      snippetName: 'Snippet Name',
      snippetContent: 'Snippet Content',
      noSnippets: 'No snippets yet',
    },
  },

  components: {
    editor: {
      placeholder: 'Enter your prompt here...',
    },

    toolbar: {
      saveNew: 'Save New Version',
      saveInPlace: 'Save In Place',
      compare: 'Compare',
      export: 'Export',
      snippets: 'Snippets',
    },

    sidebar: {
      projects: 'Projects',
      createProject: 'Create Project',
      createFolder: 'Create Folder',
      renameProject: 'Rename',
      deleteProject: 'Delete',
      noProjects: 'No projects yet',
      projectName: 'Project Name',
      folderName: 'Folder Name',
      expandSidebar: 'Expand Sidebar',
      collapseSidebar: 'Collapse Sidebar',
    },

    canvas: {
      search: 'Search',
      searchPlaceholder: 'Search versions...',
      noResults: 'No matching versions found',
      selectProject: 'Please select a project',
      prevResult: 'Previous result (Shift+Enter)',
      nextResult: 'Next result (Enter)',
      clearSearch: 'Clear search',
      closeSearch: 'Close search (ESC)',
      compare: 'Compare',
      exitCompare: 'Exit Compare',
      enterCompare: 'Click compare to enter comparison mode',
      deleteVersion: 'Delete this version',
      confirmDelete: 'Are you sure you want to delete this version? Child versions will be connected to the parent version.',
      deleteFailed: 'Delete failed',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Reset View',
    },

    versionCard: {
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      duplicate: 'Duplicate',
      delete: 'Delete',
      compare: 'Compare',
      emptyContent: 'Empty content',
      leafNode: 'Leaf node (can be updated in place)',
    },

    compareModal: {
      title: 'Version Comparison',
      source: 'Source Version',
      target: 'Target Version',
      close: 'Close',
      noDifference: 'Both versions have the same content',
      similarity: 'Similarity',
      score: 'Score',
      notes: 'Notes',
    },

    attachmentGallery: {
      upload: 'Upload Attachment',
      delete: 'Delete',
      noAttachments: 'No attachments yet',
      unsupportedType: 'Unsupported file type',
      fileTooLarge: 'File exceeds 50MB limit',
      uploadFailed: 'Upload failed',
      confirmDelete: 'Are you sure you want to delete this attachment?',
      deleteFailed: 'Delete failed',
      fileMissing: 'Attachment file is missing or corrupted',
      downloadFailed: 'Download failed',
      clickToUpload: 'Click to upload',
      imageVideo: 'Image/Video',
      maxSize: 'Max 50MB',
      attachmentMissing: 'Attachment Missing',
      preview: 'Preview',
      download: 'Download',
    },

    versionMeta: {
      clearScore: 'Clear Score',
      noNotes: 'No notes',
      addNotes: 'Add notes...',
      done: 'Done',
    },
  },

  sampleData: {
    projectName: 'Sample Project',
    versions: {
      root: {
        name: 'Playful Puppy',
        content: 'A cute puppy playing on the lush green grass in a spring park',
      },
      branch1: {
        name: 'Majestic Dog',
        content: 'A majestic German Shepherd playing on the lush green grass in a spring park',
      },
      branch2: {
        name: 'Winter Puppy',
        content: 'A cute puppy playing on the snow-covered grass in a winter park',
      },
    },
  },

  errors: {
    generic: 'An error occurred',
    saveFailed: 'Save failed',
    loadFailed: 'Load failed',
    deleteFailed: 'Delete failed',
    exportFailed: 'Export failed',
    importFailed: 'Import failed',
  },
};