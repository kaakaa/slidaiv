import * as vscode from 'vscode';

import {
    ConfigKeyApiBaseURL,
    ConfigKeyApiKey,
    ConfigKeyLLMModel,
    ConfigKeyPromptGenerate,
    ConfigKeyDebug,
    ExtensionID,
} from '@/constants';

export type Configuration = {
    apiKey: string;
    baseUrl: string | null;
    model: string;
    isDebug: boolean;
    promptGenerate: string;
};


export function readConfiguration(): Configuration {
    const ws = vscode.workspace;
    return {
        apiKey: ws.getConfiguration(ExtensionID).get(ConfigKeyApiKey) || '',
        baseUrl: ws.getConfiguration(ExtensionID).get(ConfigKeyApiBaseURL) || null,
        model: ws.getConfiguration(ExtensionID).get(ConfigKeyLLMModel) || '',
        promptGenerate: ws.getConfiguration(ExtensionID).get(ConfigKeyPromptGenerate) || '',
        isDebug: ws.getConfiguration(ExtensionID).get(ConfigKeyDebug) || false,
    };
};
