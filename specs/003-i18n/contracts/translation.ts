/**
 * 翻译函数接口契约
 * 定义翻译系统的核心接口规范
 */

/**
 * 翻译函数类型
 * @param key - 翻译键，使用点号分隔的路径（如 'common.save'）
 * @returns 翻译后的文本
 */
export type TranslationFunction = (key: string) => string;

/**
 * 翻译函数行为契约
 */
export interface TranslationFunctionContract {
  /**
   * 键查找行为：
   * 1. 将键按点号分割为路径数组
   * 2. 从当前语言的翻译对象开始，逐级查找
   * 3. 如果找到字符串值，返回该值
   * 4. 如果找不到或值不是字符串，返回键名本身作为回退
   */
  keyLookup: {
    separator: '.';
    fallback: 'key itself';
    example: {
      key: 'common.save';
      path: ['common', 'save'];
      result: '保存' | 'Save';
    };
  };

  /**
   * 错误处理：
   * - 键不存在：在控制台输出警告，返回键名
   * - 值不是字符串：返回键名
   * - 翻译对象为空：返回键名
   */
  errorHandling: {
    missingKey: 'console.warn + return key';
    invalidValue: 'return key';
    emptyTranslations: 'return key';
  };

  /**
   * 性能要求：
   * - 查找操作应为 O(n)，n 为键路径深度
   * - 不应有额外的内存分配
   * - 支持频繁调用（每次渲染可能调用数十次）
   */
  performance: {
    complexity: 'O(n) where n is key depth';
    memoryAllocation: 'minimal';
    callFrequency: 'high (dozens per render)';
  };
}

/**
 * React Hook 接口
 */
export interface UseTranslationHook {
  /**
   * 返回翻译函数
   * 必须在 I18nProvider 内部使用
   */
  (): TranslationFunction;
}

/**
 * I18n Provider 契约
 */
export interface I18nProviderContract {
  /**
   * Provider 行为：
   * 1. 订阅 i18nStore 的 currentLocale 状态
   * 2. 根据当前语言创建翻译函数
   * 3. 通过 Context 提供翻译函数给子组件
   * 4. 当语言切换时，自动触发所有使用翻译的组件重新渲染
   */
  behavior: {
    stateSubscription: 'useI18nStore((state) => state.currentLocale)';
    functionCreation: 'create t() based on current locale';
    contextProvision: 'provide t() via React Context';
    rerender: 'automatic on locale change';
  };

  /**
   * 性能优化：
   * - Context 只提供翻译函数，不存储翻译数据
   * - 翻译函数在每次渲染时重新创建（轻量级）
   * - 组件只在语言切换时重新渲染
   */
  performance: {
    contextValue: 'function only, no data';
    functionRecreation: 'on every render (lightweight)';
    componentRerender: 'only on locale change';
  };
}