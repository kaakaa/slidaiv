import * as vscode from 'vscode';

import * as Constants from '@/constants';

export type Configuration = {
    apiKey: string;
    baseUrl: string | null;
    model: string;
    promptGenerate: string;
    promptDecorate: string;
    isDebug: boolean;
};


export function readConfiguration(): Configuration {
    const ws = vscode.workspace;
    return {
        apiKey: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyApiKey) || '',
        baseUrl: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyApiBaseURL) || null,
        model: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyLLMModel) || '',
        promptGenerate: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyPromptGenerate) || '',
        promptDecorate: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyPromptDecorate) || '',
        isDebug: ws.getConfiguration(Constants.ExtensionID).get(Constants.ConfigKeyDebug) || false,
    };
};
