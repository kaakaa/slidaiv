import * as vscode from 'vscode';

import { ExtensionID } from './constants';
import { Client } from './client/openai';
import { Logger } from './logger';
import { getTaskDecorateContent, getTaskGenerateContents } from './tasks';

export function activate(context: vscode.ExtensionContext) {
	// TODO: make this configurable
	const debugMode = true;
	const logger = new Logger(vscode.window.createOutputChannel('Slidaiv'), debugMode);
	logger.info('Slidaiv is now active');

	const apiKey: string = vscode.workspace.getConfiguration(ExtensionID).get('apiKey') || '';
	const baseUrl: string | null = vscode.workspace.getConfiguration(ExtensionID).get('baseUrl') || null;
	const llmModel: string = vscode.workspace.getConfiguration(ExtensionID).get('model') || '';
	const client = new Client(apiKey, baseUrl, llmModel, vscode.env.language);
	logger.info(`#{baseUrl: ${baseUrl}, model: ${llmModel}, locale: ${vscode.env.language}`)


	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.generateContents', async () => {
		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Generating Slidev contents',
				cancellable: false
			}, getTaskGenerateContents(client, logger));
		} catch (e: any) {
			vscode.window.showErrorMessage(`failed to generate content: ${e.message}`);
			logger.error(`failed to generate content: ${e.message}`)
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.decorateContents', async () => {
		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Decorating Slidev contents',
				cancellable: false
			}, getTaskDecorateContent(client, logger));
		} catch (e: any) {
			vscode.window.showErrorMessage(`failed to decorate content: ${e.message}`);
		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() { }
