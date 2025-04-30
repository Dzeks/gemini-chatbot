import { openai } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";

export const openapiModel = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: customMiddleware,
});

export const openApiTurboModel = wrapLanguageModel({
  model: openai('gpt-4-turbo'),
  middleware: customMiddleware,
});
