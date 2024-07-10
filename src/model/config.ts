import * as vscode from 'vscode';

import {
    ConfigKeyApiBaseURL,
    ConfigKeyApiKey,
    ConfigKeyLLMModel,
    ConfigKeyDebug,
    ExtensionID,
} from '@/constants';

type Configuration = {
    apiKey: string;
    baseUrl: string | null;
    model: string;
    isDebug: boolean;
};


export function readConfiguration(): Configuration {
    const ws = vscode.workspace;
    return {
        apiKey: ws.getConfiguration(ExtensionID).get(ConfigKeyApiKey) || '',
        baseUrl: ws.getConfiguration(ExtensionID).get(ConfigKeyApiBaseURL) || null,
        model: ws.getConfiguration(ExtensionID).get(ConfigKeyLLMModel) || '',
        isDebug: ws.getConfiguration(ExtensionID).get(ConfigKeyDebug) || false,
    };
};
