import { ApiError } from './api-error';
import { isSuccessResponse, type ApiResponse } from './api-response';

import type { ZodType } from 'zod';

// API呼び出し関数をラップして、React Queryが期待する形式のqueryFnを返す高階関数
export function createApiQuery<TApiData, TFinalData = TApiData, TArgs extends unknown[] = []>(
  config: {
    api: (...args: TArgs) => Promise<ApiResponse<TApiData>>;
    schema: ZodType<TApiData>;
    transform?: (data: TApiData) => Promise<TFinalData> | TFinalData;
  },
  ...args: TArgs
): () => Promise<TFinalData> {
  // `queryFn` として実行される関数本体を返す
  return async () => {
    const response = await config.api(...args);
    if (!isSuccessResponse(response)) {
      throw new ApiError(response.error);
    }

    const data = response.data as unknown as TApiData;
    const parsedData = config.schema ? config.schema.parse(data) : data;

    // 2. transform 関数が提供されていれば、それを適用
    if (config.transform) {
      return await config.transform(parsedData);
    }

    // 3. transform がなければ、最初のデータをそのまま返す
    return parsedData as unknown as TFinalData;
  };
}
