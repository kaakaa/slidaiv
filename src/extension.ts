import * as vscode from 'vscode';

import { ExtensionID } from '@/constants';
import { SecretTokenStore as SecretApiKeyStore } from '@/secret';
import { Client } from '@/client/openai';
import { Logger } from '@/logger';
import { getTaskDecorateContent, getTaskGenerateContents } from '@/tasks';
import { readConfiguration } from '@/model/config';

async function initialize() {
	const config = await readConfiguration();
	Logger.isDebug = config.isDebug;
	const client = new Client(config, vscode.env.language);
	return { config, client };
}

export async function activate(context: vscode.ExtensionContext) {
	Logger.init(vscode.window.createOutputChannel('Slidaiv'));
	await SecretApiKeyStore.init(context);
	const apiKey = await SecretApiKeyStore.instance.get();
	if (!apiKey) {
		const sel = await vscode.window.showInformationMessage(
			'OpenAI API Key is not set. Please set it from the command palette.',
			'Set API Key'
		)
		if (sel === 'Set API Key') {
			vscode.commands.executeCommand('slidaiv.command.setApiKey');
		}
	}

	let { config, client } = await initialize();
	Logger.isDebug = config.isDebug;

	Logger.info('Slidaiv is now active');

	vscode.workspace.onDidChangeConfiguration(async (e) => {
		if (!e.affectsConfiguration(ExtensionID)) {
			return; // ignore other changes
		}
		const updated = await initialize();
		client = updated.client;
	});

	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.generateContents', async () => {
		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Generating Slidev contents',
				cancellable: true
			}, getTaskGenerateContents(client));
		} catch (e: any) {
			vscode.window.showErrorMessage(`failed to generate content: ${e.message}`);
			Logger.error(`failed to generate content: ${e.message}`);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.decorateContents', async () => {
		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Decorating Slidev contents',
				cancellable: true
			}, getTaskDecorateContent(client));
		} catch (e: any) {
			vscode.window.showErrorMessage(`failed to decorate content: ${e.message}`);
			Logger.error(`failed to decorate content: ${e.message}`);
		}
	}));

	vscode.commands.registerCommand('slidaiv.command.setApiKey', async () => {
		const input: string = await vscode.window.showInputBox({
			placeHolder: 'Input your OpenAI API Key',
			password: true,
		}) ?? '';

		await SecretApiKeyStore.instance.store(input);
		const updated = await initialize();
		client = updated.client;
		vscode.window.showInformationMessage("API Key is updated.")
	});

	vscode.commands.registerCommand('slidaiv.command.deleteApiKey', async () => {
		const key = await SecretApiKeyStore.instance.get()
		if (!key) {
			vscode.window.showWarningMessage("API Key is not set.")
			return;
		}
		await SecretApiKeyStore.instance.refresh();
		const updated = await initialize();
		client = updated.client;
		vscode.window.showInformationMessage("API Key is deleted.")
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
