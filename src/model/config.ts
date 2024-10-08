import * as vscode from 'vscode';

import * as Constants from '@/constants';
import { SecretTokenStore } from '@/secret';

type LLMService = "openai" | "azure-ai-inference";
export type Configuration = {
    service: LLMService;
    apiKey: string;
    baseUrl: string;
    model: string;
    promptGenerate: string;
    promptDecorate: string;
    isDebug: boolean;
};


export async function readConfiguration(): Promise<Configuration> {
    const apiKey = await SecretTokenStore.instance.get();
    const ws = vscode.workspace;
    return {
        service: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyLLMService) ?? 'openai',
        apiKey: apiKey ?? '',
        baseUrl: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyApiBaseURL) ?? '',
        model: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyLLMModel) ?? '',
        promptGenerate: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyPromptGenerate) ?? '',
        promptDecorate: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyPromptDecorate) ?? '',
        isDebug: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyDebug) ?? false,
    };
};
