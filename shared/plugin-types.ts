// ---- plugin:itinerary_risk_categorization_1 ----
// ============================================================
// 插件 itinerary_risk_categorization_1 (行程风险分类检测) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface ItineraryRiskCategorizationOneInput {
  /** 待检测的行程、跟团、酒店相关文本内容 */
  itinerary_text: string;
}

/**
 * capabilityClient.load('itinerary_risk_categorization_1').call<ItineraryRiskCategorizationOneOutput>('aiCategorize', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { categories } = result;
 * 返回值形如：
 *   {"categories":["示例文本"]}
 */
export interface ItineraryRiskCategorizationOneOutput {
  /** [object Object] */
  categories: string[];
}
// ---- end:itinerary_risk_categorization_1 ----

// ---- plugin:travel_risk_report_generate_1 ----
// ============================================================
// 插件 travel_risk_report_generate_1 (行程风险报告生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================
// ---- end:travel_risk_report_generate_1 ----

// ---- plugin:physique_test_result_generate_1 ----
// ============================================================
// 插件 physique_test_result_generate_1 (体质测试结果生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================
// ---- end:physique_test_result_generate_1 ----

// ---- plugin:travel_itinerary_web_crawler_1 ----
// ============================================================
// 插件 travel_itinerary_web_crawler_1 (旅游行程网页内容爬取) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface TravelItineraryWebCrawlerOneInput {
  /** 旅游行程/产品网页链接（支持携程、马蜂窝、抖音、小红书等平台） */
  travel_page_url: string;
}

/**
 * capabilityClient.load('travel_itinerary_web_crawler_1').callStream<TravelItineraryWebCrawlerOneOutput>('crawlWebPage', input)
 * 每个 chunk 就是下面这个扁平对象，字段名与 TravelItineraryWebCrawlerOneOutput 一致，外面没有 data / choices / message 包装：
 *   {"content":"示例文本"}
 * 返回值可能是 AsyncIterable<chunk>，也可能是 { output: AsyncIterable<chunk> }，取流前先归一化。
 * 逐段累加：
 *   for await (const chunk of stream) { result += chunk.content ?? ''; }
 */
export interface TravelItineraryWebCrawlerOneOutput {
  /** [object Object] */
  content: string;
}
// ---- end:travel_itinerary_web_crawler_1 ----

// ---- plugin:destination_pitfall_search_summary_1 ----
// ============================================================
// 插件 destination_pitfall_search_summary_1 (目的地避坑信息检索) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface DestinationPitfallSearchSummaryOneInput {
  /** 需要检索避坑信息的旅游目的地名称 */
  destination: string;
}

/**
 * capabilityClient.load('destination_pitfall_search_summary_1').callStream<DestinationPitfallSearchSummaryOneOutput>('searchSummary', input)
 * 每个 chunk 就是下面这个扁平对象，字段名与 DestinationPitfallSearchSummaryOneOutput 一致，外面没有 data / choices / message 包装：
 *   {"summary":"示例文本"}
 * 返回值可能是 AsyncIterable<chunk>，也可能是 { output: AsyncIterable<chunk> }，取流前先归一化。
 * 逐段累加：
 *   for await (const chunk of stream) { result += chunk.summary ?? ''; }
 */
export interface DestinationPitfallSearchSummaryOneOutput {
  /** [object Object] */
  summary: string;
}
// ---- end:destination_pitfall_search_summary_1 ----

// ---- plugin:itinerary_risk_routine_categorization_1 ----
// ============================================================
// 插件 itinerary_risk_routine_categorization_1 (行程风险套路分类识别) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface ItineraryRiskRoutineCategorizationOneInput {
  /** 待分类的行程文本内容 */
  itinerary_text: string;
  /** 套路库分类参考列表 */
  routine_categories: string[];
  /** 自定义分类补充要求（可选） */
  custom_classify_requirements?: string;
}

/**
 * capabilityClient.load('itinerary_risk_routine_categorization_1').call<ItineraryRiskRoutineCategorizationOneOutput>('aiCategorize', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { categories } = result;
 * 返回值形如：
 *   {"categories":["示例文本"]}
 */
export interface ItineraryRiskRoutineCategorizationOneOutput {
  /** [object Object] */
  categories: string[];
}
// ---- end:itinerary_risk_routine_categorization_1 ----