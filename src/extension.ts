import * as vscode from 'vscode';

import { ExtensionID } from '@/constants';
import { SecretTokenStore as SecretApiKeyStore } from '@/secret';
import { Client } from '@/client/openai';
import { Logger } from '@/logger';
import { doTaskWithProgress, getTaskDecorateContent, getTaskGenerateContents } from '@/tasks';
import { readConfiguration } from '@/model/config';
import { LLMClient, UnconfiguredClient } from './client/llmClient';

async function initialize() {
	const config = await readConfiguration();
	Logger.isDebug = config.isDebug;
	const client = new Client(config, vscode.env.language);
	return client;
}

async function setApiKey() {
	const sel = await vscode.window.showWarningMessage(
		'OpenAI API Key is not set. Please set it from the command palette.',
		'Set API Key'
	)
	if (sel === 'Set API Key') {
		vscode.commands.executeCommand('slidaiv.command.setApiKey');
	}
}

export async function activate(context: vscode.ExtensionContext) {
	Logger.init(vscode.window.createOutputChannel('Slidaiv'));
	SecretApiKeyStore.init(context);

	let client: LLMClient = UnconfiguredClient.instance;

	vscode.workspace.onDidChangeConfiguration(async (e) => {
		if (!e.affectsConfiguration(ExtensionID)) {
			return; // ignore other changes
		}
		client = await initialize();
	});

	vscode.commands.registerCommand('slidaiv.command.setApiKey', async () => {
		const input: string = await vscode.window.showInputBox({
			placeHolder: 'Input your OpenAI API Key',
			password: true,
		}) ?? '';

		if (!input) {
			client = UnconfiguredClient.instance;
			vscode.window.showErrorMessage("API Key is not set.")
			return;
		}

		await SecretApiKeyStore.instance.store(input);
		client = await initialize();
		vscode.window.showInformationMessage("API Key is updated.")
	});

	const apiKey = await SecretApiKeyStore.instance.get();
	if (apiKey) {
		client = await initialize();
	} else {
		// Need to call this after 'slidaiv.command.setApiKey' is registered.
		setApiKey();
	}

	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.generateContents', async () => {
		doTaskWithProgress("Generating Slidev contents", getTaskGenerateContents(client));
	}));
	context.subscriptions.push(vscode.commands.registerCommand('slidaiv.decorateContents', async () => {
		doTaskWithProgress("Decorating Slidev contents", getTaskDecorateContent(client));
	}));


	Logger.info('Slidaiv is now active');
}

// This method is called when your extension is deactivated
export function deactivate() { }
