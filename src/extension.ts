import * as vscode from 'vscode';

import { ExtensionID } from '@/constants';
import { Client } from '@/client/openai';
import { Logger } from '@/logger';
import { getTaskDecorateContent, getTaskGenerateContents } from '@/tasks';
import { readConfiguration } from '@/model/config';

export function activate(context: vscode.ExtensionContext) {
	let config = readConfiguration();
	const logger = new Logger(vscode.window.createOutputChannel('Slidaiv'));
	let client = new Client(config.apiKey, config.baseUrl, config.model, vscode.env.language);

	logger.info('Slidaiv is now active');

	vscode.workspace.onDidChangeConfiguration((e) => {
		if (!e.affectsConfiguration(ExtensionID)) {
			return; // ignore other changes
		}

		config = readConfiguration();
		logger.isDebug = config.isDebug;
		client = new Client(config.apiKey, config.baseUrl, config.model, vscode.env.language);
	});

	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.generateContents', async () => {
		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Generating Slidev contents',
				cancellable: true
			}, getTaskGenerateContents(client, logger));
		} catch (e: any) {
			vscode.window.showErrorMessage(`failed to generate content: ${e.message}`);
			logger.error(`failed to generate content: ${e.message}`);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.decorateContents', async () => {
		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Decorating Slidev contents',
				cancellable: true
			}, getTaskDecorateContent(client, logger));
		} catch (e: any) {
			vscode.window.showErrorMessage(`failed to decorate content: ${e.message}`);
			logger.error(`failed to decorate content: ${e.message}`);
		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() { }
