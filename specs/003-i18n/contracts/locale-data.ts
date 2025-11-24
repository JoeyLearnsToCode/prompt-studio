/**
 * 翻译数据结构接口契约
 * 定义翻译数据的组织和访问规范
 */

import type { Locale } from '@/i18n/types';

/**
 * 翻译数据结构契约
 */
export interface LocaleDataContract {
  /**
   * 数据组织：
   * - 按语言代码组织（zh-CN, en-US）
   * - 使用嵌套对象结构
   * - 按功能模块划分命名空间
   */
  organization: {
    byLocale: Record<Locale, any>;
    structure: 'nested objects';
    namespaces: ['common', 'pages', 'components', 'sampleData', 'errors'];
  };

  /**
   * 命名约定：
   * - 使用点号分隔的路径（如 'common.save'）
   * - 使用驼峰命名法（camelCase）
   * - 保持键名简洁且描述性
   */
  naming: {
    separator: '.';
    convention: 'camelCase';
    examples: ['common.save', 'pages.mainView.title', 'components.editor.placeholder'];
  };

  /**
   * 类型安全：
   * - 所有语言必须实现相同的接口
   * - 使用 TypeScript 确保结构一致性
   * - 编译时检查缺失的翻译键
   */
  typeSafety: {
    interface: 'TranslationData';
    enforcement: 'compile-time';
    consistency: 'all locales must match structure';
  };

  /**
   * 文件组织：
   * src/i18n/locales/
   * ├── zh-CN.ts    # 中文翻译
   * ├── en-US.ts    # 英文翻译
   * └── index.ts    # 导出所有语言
   */
  fileStructure: {
    directory: 'src/i18n/locales/';
    perLocale: '[locale].ts';
    index: 'index.ts exports all locales';
  };
}

/**
 * 翻译数据访问契约
 */
export interface TranslationAccessContract {
  /**
   * 访问模式：
   * 1. 通过 translations[locale] 获取语言对象
   * 2. 通过点号路径访问嵌套值
   * 3. 如果值不存在，返回键名作为回退
   */
  accessPattern: {
    step1: 'Get locale object from translations[currentLocale]';
    step2: 'Split key by "." and traverse nested object';
    step3: 'Return string value or key as fallback';
  };

  /**
   * 性能特性：
   * - 所有翻译数据在构建时打包
   * - 运行时无需加载或解析
   * - 对象属性访问为 O(1)
   */
  performance: {
    bundling: 'build-time';
    loading: 'none (pre-bundled)';
    access: 'O(1) per key segment';
  };
}

/**
 * 示例数据契约
 */
export interface SampleDataContract {
  /**
   * 示例数据国际化：
   * - 示例项目名称
   * - 示例版本名称和内容
   * - 根据当前语言生成
   */
  scope: {
    projectName: 'localized';
    versionNames: 'localized';
    versionContent: 'localized';
  };

  /**
   * 访问方式：
   * translations[currentLocale].sampleData
   */
  access: {
    path: 'sampleData';
    usage: 'in initializeSampleData service';
  };
}