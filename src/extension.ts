import * as vscode from 'vscode';

import { ExtensionID } from '@/constants';
import { SecretTokenStore as SecretApiKeyStore } from '@/secret';
import { Client } from '@/client/openai';
import { Logger } from '@/logger';
import { getTaskDecorateContent, getTaskGenerateContents } from '@/tasks';
import { readConfiguration } from '@/model/config';

export async function activate(context: vscode.ExtensionContext) {
	SecretApiKeyStore.init(context);
	const apiKey = SecretApiKeyStore.instance.get();
	if (!apiKey) {
		const sel = await vscode.window.showInformationMessage('OpenAI API Key is not set. Please set it from the command palette.', 'Set API Key');
		if (sel === 'Set API Key') {
			vscode.commands.executeCommand('slidaiv.command.setApiKey');
		}
	}
	// TODO: Check if api key is set. if not, show a warning message.
	let config = await readConfiguration();

	const logger = new Logger(vscode.window.createOutputChannel('Slidaiv'));
	logger.isDebug = config.isDebug;
	let client = new Client(config, vscode.env.language, logger);

	logger.info('Slidaiv is now active');

	vscode.workspace.onDidChangeConfiguration(async (e) => {
		if (!e.affectsConfiguration(ExtensionID)) {
			return; // ignore other changes
		}

		config = await readConfiguration();
		logger.isDebug = config.isDebug;
		client = new Client(config, vscode.env.language, logger);
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

	vscode.commands.registerCommand('slidaiv.command.setApiKey', async () => {
		const old: string = await SecretApiKeyStore.instance.get() ?? '';
		const input: string = await vscode.window.showInputBox({
			placeHolder: 'Input your OpenAI API Key',
			password: true,
		}) ?? '';

		if (old !== input) {
			SecretApiKeyStore.instance.store(input);
			// TODO: refactor.
			config = await readConfiguration();
			client = new Client(config, vscode.env.language, logger);
			logger.debug('API Key is updated.');
		}
	});

	vscode.commands.registerCommand('slidaiv.command.deleteApiKey', async () => {
		await SecretApiKeyStore.instance.refresh();
		config = await readConfiguration();
		client = new Client(config, vscode.env.language, logger);
		logger.debug('API Key is deleted.');
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
