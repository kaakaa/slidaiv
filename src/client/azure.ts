import { Configuration } from "@/model/config";
import createClient from "@azure-rest/ai-inference";
import type { ChatCompletionsOutput, ModelClient } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { CustomCancellationToken } from "./llmClient";
import { Logger } from "@/logger";
import { getLocaleName } from "@/utils";
import { evalPromptLiteral, getDefaultPromptDecorateContents, getDefaultPromptForGenerateContents } from "@/client/prompts";

export class AzureAIClient {
    private client: ModelClient;
    private model: string;
    private promptGenerate: string;
    private promptDecorate: string;
    private defaultLocale: string;

    constructor(config: Configuration, locale: string) {
        // TODO: to be explained about hardcoded URL
        this.client = createClient("https://models.inference.ai.azure.com", new AzureKeyCredential(config.apiKey));
        this.model = config.model;
        this.defaultLocale = locale;
        this.promptGenerate = config.promptGenerate;
        this.promptDecorate = config.promptDecorate;
    }

    async generatePageContents(token: CustomCancellationToken, prompt: string, m: string | null, locale: string | null): Promise<string | null> {
        const ac = new AbortController();
        token.onCancellationRequested(() => {
            Logger.info("User requested to cancel the task.");
            ac.abort();
        });

        const loc = getLocaleName(locale || this.defaultLocale);
        const model = m ?? this.model;
        let sysPrompt;
        if (this.promptGenerate && this.promptGenerate.length > 0) {
            sysPrompt = evalPromptLiteral(this.promptGenerate, { locale: loc });
        } else {
            Logger.info("Default prompt is used, because custom prompt is not set.");
            sysPrompt = getDefaultPromptForGenerateContents(loc);
        }
        Logger.info(`Call Azure AI Inference SDK details: model=${model}, locale=${locale}`);
        Logger.debug(`sysPrompt=${sysPrompt}`);

        const response = await this.client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: sysPrompt },
                    { role: "user", content: prompt }
                ],
                model: model,
                temperature: 1,
                max_tokens: 4096,
                top_p: 1
            },
            abortSignal: ac.signal,
        });

        Logger.info(`Request completed with ${response?.status}`);
        if (response.status !== "200") {
            if ("error" in response.body) {
                throw response.body.error;
            } else {
                throw new Error(`Request was failed with ${response.status}. Unknown error occurred.`);
            }
        }
        const output: ChatCompletionsOutput = response.body as ChatCompletionsOutput;
        Logger.debug(`  Model: ${output?.model}`);
        Logger.debug(`  Usage: ${JSON.stringify(output?.usage)}`)
        if (output?.choices?.length > 0) {
            return output.choices[0].message.content;
        }
        throw new Error(`Response from Azure model is empty or unexpected.`);    
    }

    async decorateContents(token: CustomCancellationToken, prompt: string) {
        const ac = new AbortController();
        token.onCancellationRequested(() => {
            ac.abort();
        });

        let sysPrompt;
        if (this.promptDecorate && this.promptDecorate.length > 0) {
            sysPrompt = evalPromptLiteral(this.promptDecorate, { prompt });
        } else {
            Logger.info("Default prompt is used, because custom prompt is not set.");
            sysPrompt = getDefaultPromptDecorateContents();
        }
        Logger.info(`Call Azure AI Inference SDK details: model=${this.model}`);
        Logger.debug(`sysPrompt=${sysPrompt}`);

        const response = await this.client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: sysPrompt },
                    { role: "user", content: prompt }
                ],
                model: this.model,
                temperature: 1,
                max_tokens: 4096,
                top_p: 1
            },
            abortSignal: ac.signal,
        });

        Logger.info(`Request completed with ${response?.status}`);
        if (response.status !== "200") {
            if ("error" in response.body) {
                throw response.body.error;
            } else {
                throw new Error(`Request was failed with ${response.status}. Unknown error occurred.`);
            }
        }
        const output: ChatCompletionsOutput = response.body as ChatCompletionsOutput;
        Logger.debug(`  Model: ${output?.model}`);
        Logger.debug(`  Usage: ${JSON.stringify(output?.usage)}`)
        if (output?.choices?.length > 0) {
            return output.choices[0].message.content;
        }
        throw new Error(`Response from Azure model is empty or unexpected.`);    
    }
}
