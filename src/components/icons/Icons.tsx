import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * 图标使用说明：
 * 
 * 1. BaseIcon - 基础图标组件，提供统一的样式和属性
 * 2. GrayIcon - 灰色图标变体，使用较浅的线条（opacity: 0.6）
 * 3. SearchBaseIcon - 搜索图标的基础组件，可添加额外元素
 * 4. ArrowIcon - 通用箭头图标组件，支持四个方向
 * 
 * 使用示例：
 * - 普通图标：<Icons.Folder size={20} />
 * - 灰色图标：<Icons.Info size={20} /> (InfoIcon 已使用 GrayIcon)
 * - 搜索图标：<Icons.SearchPlus size={20} />
 * - 箭头图标：<Icons.UpArrow size={20} />
 */

// 基础 SVG 组件，提供统一的样式和属性
const BaseIcon: React.FC<IconProps & { children: React.ReactNode }> = ({ 
  size = 16, 
  className = '', 
  children, 
  ...props 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

// 灰色图标变体，使用较浅的线条
const GrayIcon: React.FC<IconProps & { children: React.ReactNode }> = ({ 
  size = 16, 
  className = '', 
  children, 
  ...props 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ opacity: 0.6 }}
    {...props}
  >
    {children}
  </svg>
);

// 文件夹图标
export const FolderIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </BaseIcon>
);

// 文件图标
export const FileIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </BaseIcon>
);

// 打开的文件夹图标
export const FolderOpenIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    <path d="M15 9v6" />
    <path d="M13 11h6" />
  </BaseIcon>
);

// 加号图标
export const PlusIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </BaseIcon>
);

// 通用搜索图标组件
const SearchBaseIcon: React.FC<IconProps & { 
  children?: React.ReactNode;
  className?: string;
}> = ({ 
  size = 16, 
  className = '', 
  children,
  ...props 
}) => (
  <BaseIcon size={size} className={className} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    {children}
  </BaseIcon>
);

// 搜索图标
export const SearchIcon: React.FC<IconProps> = (props) => <SearchBaseIcon {...props} />;

// 搜索加号图标（放大镜+）
export const SearchPlusIcon: React.FC<IconProps> = (props) => (
  <SearchBaseIcon {...props}>
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </SearchBaseIcon>
);

// 搜索减号图标（放大镜-）
export const SearchMinusIcon: React.FC<IconProps> = (props) => (
  <SearchBaseIcon {...props}>
    <line x1="8" y1="11" x2="14" y2="11" />
  </SearchBaseIcon>
);

// 删除图标
export const TrashIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" />
  </BaseIcon>
);

// 编辑图标
export const EditIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </BaseIcon>
);

// 查看图标（眼睛）
export const EyeIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

// 备注图标（记事本）
export const NoteIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </BaseIcon>
);

// 刷新图标
export const RefreshIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </BaseIcon>
);

// 信息图标
export const InfoIcon: React.FC<IconProps> = (props) => (
  <GrayIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </GrayIcon>
);

// 警告图标
export const WarningIcon: React.FC<IconProps> = (props) => (
  <GrayIcon {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </GrayIcon>
);

// 星标图标
export const StarIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </BaseIcon>
);

// 保存图标
export const SaveIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </BaseIcon>
);

export const SaveNewIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
    <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    <circle cx="17" cy="17" r="6" className="fill-surface-variant" stroke="none" />
    <path d="M17 12v10" />
    <path d="M12 17h10" />
  </BaseIcon>
);

// 菜单图标（汉堡菜单）
export const MenuIcon: React.FC<IconProps> = (props) => (
  <svg
    width={props.size || 20}
    height={props.size || 20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={props.className}
    {...props}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// X图标（关闭/清除）
export const XIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

// 下载图标
export const DownloadIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </BaseIcon>
);

// 包图标
export const PackageIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </BaseIcon>
);

// 对比图标（双向箭头）
export const CompareIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="5" cy="6" r="3"/>
    <path d="M12 6h5a2 2 0 0 1 2 2v7"/>
    <path d="m15 9-3-3 3-3"/>
    <circle cx="19" cy="18" r="3"/>
    <path d="M12 18H7a2 2 0 0 1-2-2V9"/>
    <path d="m9 15 3 3-3 3"/>
  </BaseIcon>
);

// 通用箭头图标组件
const ArrowIcon: React.FC<IconProps & { direction: 'up' | 'down' | 'left' | 'right' }> = ({ 
  size = 16, 
  className = '', 
  direction,
  ...props 
}) => {
  const paths = {
    up: 'M18 15l-6-6-6 6',
    down: 'M6 9l6 6 6-6',
    left: 'M15 18l-6-6 6-6',
    right: 'M9 18l6-6-6-6'
  };
  
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d={paths[direction]} />
    </BaseIcon>
  );
};

// 箭头图标
export const UpArrowIcon = (props: IconProps) => <ArrowIcon {...props} direction="up" />;
export const DownArrowIcon = (props: IconProps) => <ArrowIcon {...props} direction="down" />;
export const LeftArrowIcon = (props: IconProps) => <ArrowIcon {...props} direction="left" />;
export const RightArrowIcon = (props: IconProps) => <ArrowIcon {...props} direction="right" />;

// 关闭图标
export const CloseIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </BaseIcon>
);

// 清除图标
export const ClearIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 18L18 6M6 6l12 12" />
  </BaseIcon>
);

// GitHub图标
export const GitHubIcon: React.FC<IconProps> = (props) => (
  <svg
    width={props.size || 16}
    height={props.size || 16}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
    {...props}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

// 设置图标
export const SettingsIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </BaseIcon>
);

// 语言图标
export const LanguageIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </BaseIcon>
);

// 文本选择图标
export const TextSelectIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M14 21h1" />
    <path d="M14 3h1" />
    <path d="M19 3a2 2 0 0 1 2 2" />
    <path d="M21 14v1" />
    <path d="M21 19a2 2 0 0 1-2 2" />
    <path d="M21 9v1" />
    <path d="M3 14v1" />
    <path d="M3 9v1" />
    <path d="M5 21a2 2 0 0 1-2-2" />
    <path d="M5 3a2 2 0 0 0-2 2" />
    <path d="M7 12h10" />
    <path d="M7 16h6" />
    <path d="M7 8h8" />
    <path d="M9 21h1" />
    <path d="M9 3h1" />
  </BaseIcon>
);

// 行选择图标
export const RowSelectIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M7 5h10" />
    <path d="M7 19h10" />
    <path d="M9 12h6" />
    <path d="M6 9H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1" />
    <path d="M18 9h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" />
  </BaseIcon>
);

// 复制图标
export const CopyIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </BaseIcon>
);

// 导出所有图标
export const Icons = {
  Folder: FolderIcon,
  File: FileIcon,
  FolderOpen: FolderOpenIcon,
  Plus: PlusIcon,
  Search: SearchIcon,
  SearchPlus: SearchPlusIcon,
  SearchMinus: SearchMinusIcon,
  Trash: TrashIcon,
  Edit: EditIcon,
  Eye: EyeIcon,
  Note: NoteIcon,
  Refresh: RefreshIcon,
  Info: InfoIcon,
  Warning: WarningIcon,
  Star: StarIcon,
  Save: SaveIcon,
  SaveNew: SaveNewIcon,
  Menu: MenuIcon,
  X: XIcon,
  Download: DownloadIcon,
  Package: PackageIcon,
  Compare: CompareIcon,
  UpArrow: UpArrowIcon,
  DownArrow: DownArrowIcon,
  LeftArrow: LeftArrowIcon,
  RightArrow: RightArrowIcon,
  Close: CloseIcon,
  Clear: ClearIcon,
  GitHub: GitHubIcon,
  Settings: SettingsIcon,
  Language: LanguageIcon,
  TextSelect: TextSelectIcon,
  RowSelect: RowSelectIcon,
  Copy: CopyIcon,
  ArrowUp: UpArrowIcon,
  ArrowDown: DownArrowIcon,
  ArrowLeft: LeftArrowIcon,
  ArrowRight: RightArrowIcon,
};