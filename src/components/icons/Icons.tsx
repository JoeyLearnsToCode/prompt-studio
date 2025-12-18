import React from 'react';

// 更新 IconProps 以兼容 span 属性
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  fill?: boolean; // 支持 Material Symbols 的 FILL 轴
}

/**
 * Material Symbol 基础组件
 */
const MaterialSymbol: React.FC<IconProps & { name: string }> = ({
  name,
  size = 20, // 默认为 20px，适应大多数 UI 上下文
  fill = false,
  className = '',
  style,
  ...props
}) => {
  const computedStyle: React.CSSProperties = {
    fontSize: `${size}px`,
    // 控制填充 (FILL 轴)
    fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
    ...style,
  };

  return (
    <span
      className={`material-symbols-outlined select-none align-middle ${className}`}
      style={computedStyle}
      {...props}
    >
      {name}
    </span>
  );
};

// 文件夹图标
export const FolderIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="folder" {...props} />
);

// 文件夹+图标
export const FolderPlusIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="create_new_folder" {...props} />
);

// 文件图标
export const FileIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="description" {...props} />
);

// 文件+图标
export const FilePlusIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="note_add" {...props} />
);

// 打开的文件夹图标
export const FolderOpenIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="folder_open" {...props} />
);

// 加号图标
export const PlusIcon: React.FC<IconProps> = (props) => <MaterialSymbol name="add" {...props} />;

// 搜索图标
export const SearchIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="search" {...props} />
);

// 搜索加号图标（放大镜+，用于 Zoom In）
export const SearchPlusIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="zoom_in" {...props} />
);

// 搜索减号图标（放大镜-，用于 Zoom Out）
export const SearchMinusIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="zoom_out" {...props} />
);

// 删除图标
export const TrashIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="delete" {...props} />
);

// 编辑图标
export const EditIcon: React.FC<IconProps> = (props) => <MaterialSymbol name="edit" {...props} />;

// 查看图标（眼睛）
export const EyeIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="visibility" {...props} />
);

// 备注图标（记事本）
export const NoteIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="description" {...props} />
);

// 刷新图标 (用于 Reset View)
export const RefreshIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="restart_alt" {...props} />
);

// 信息图标
export const InfoIcon: React.FC<IconProps> = (props) => <MaterialSymbol name="info" {...props} />;

// 警告图标
export const WarningIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="warning" {...props} />
);

// 星标图标
export const StarIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="star" fill {...props} />
);

// 保存图标
export const SaveIcon: React.FC<IconProps> = (props) => <MaterialSymbol name="save" {...props} />;

export const SaveNewIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="save_as" {...props} />
);

// 菜单图标（汉堡菜单）
export const MenuIcon: React.FC<IconProps> = (props) => <MaterialSymbol name="menu" {...props} />;

// 侧边栏菜单图标
export const MenuOpenIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="menu_open" {...props} />
);
export const MenuClosedIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="menu" {...props} />
);

// X图标（关闭/清除，用于 Close button）
export const XIcon: React.FC<IconProps> = (props) => <MaterialSymbol name="close" {...props} />;

// 下载图标
export const DownloadIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="download_2" {...props} />
);
export const UploadIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="upload_2" {...props} />
);

// 包图标 (用于 Attachments header)
export const AttachmentIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="attachment" {...props} />
);

// 对比图标（双向箭头）
export const CompareIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="compare_arrows" {...props} />
);

// 箭头图标
export const UpArrowIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="keyboard_arrow_up" {...props} />
);
export const DownArrowIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="keyboard_arrow_down" {...props} />
);
export const LeftArrowIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="keyboard_arrow_left" {...props} />
);
export const RightArrowIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="keyboard_arrow_right" {...props} />
);

// 关闭图标
export const CloseIcon: React.FC<IconProps> = (props) => <MaterialSymbol name="close" {...props} />;

// 清除图标 (用于输入框清除)
export const ClearIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="clear_all" {...props} />
);

// 设置图标
export const SettingsIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="settings" {...props} />
);

// 语言图标
export const LanguageIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="language" {...props} />
);

// 文本选择图标
export const TextSelectIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="select_all" {...props} />
);

// 行选择图标
export const RowSelectIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="short_text" {...props} />
);

// 复制图标
export const CopyIcon: React.FC<IconProps> = (props) => (
  <MaterialSymbol name="content_copy" {...props} />
);

// GitHub图标 - 保留 SVG，因为 Material Symbols 没有品牌图标
export const GitHubIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...(props as any)}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// 导出所有图标
export const Icons = {
  Folder: FolderIcon,
  FolderPlus: FolderPlusIcon,
  File: FileIcon,
  FilePlus: FilePlusIcon,
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
  MenuOpen: MenuOpenIcon,
  MenuClosed: MenuClosedIcon,
  X: XIcon,
  Download: DownloadIcon,
  Upload: UploadIcon,
  Attachment: AttachmentIcon,
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
