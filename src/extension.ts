import * as vscode from 'vscode';

import { CommandIdDecorateContents, CommandIdGenerateContents, CommandIdOpenSettingsApiKey, CommandIdSetApiKey, ExtensionID, ExtensionName, MessageSelectionSetApiKey, MessageSetApiKey, PreferenceIdApiKey } from '@/constants';
import { SecretTokenStore as SecretApiKeyStore } from '@/secret';
import { Logger } from '@/logger';
import { doTaskWithProgress, getTaskDecorateContent, getTaskGenerateContents } from '@/tasks';
import { readConfiguration } from '@/model/config';
import { LLMClientFactory, UnconfiguredClient } from '@/client/llmClient';
import type { LLMClient } from '@/client/llmClient';

async function initialize(): Promise<LLMClient> {
	const config = await readConfiguration();
	Logger.isDebug = config.isDebug;
	return LLMClientFactory.create(config, vscode.env.language);
}

async function setApiKey() {
	const message = new vscode.MarkdownString(MessageSetApiKey);
	message.isTrusted = true;
	const sel = await vscode.window.showWarningMessage(message.value, MessageSelectionSetApiKey);
	if (sel === MessageSelectionSetApiKey) {
		vscode.commands.executeCommand(CommandIdSetApiKey);
	}
}

// TODO: enable to select llm client type
export async function activate(context: vscode.ExtensionContext) {
	Logger.init(vscode.window.createOutputChannel(ExtensionName).appendLine);
	SecretApiKeyStore.init(context);

	let client: LLMClient = UnconfiguredClient.instance;

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (e) => {
		if (!e.affectsConfiguration(ExtensionID)) {
			return; // ignore other changes
		}
		client = await initialize();
	}));

	context.subscriptions.push(vscode.commands.registerCommand(CommandIdOpenSettingsApiKey, async () => {
		Logger.debug("Open settings");
		await vscode.commands.executeCommand('workbench.action.openSettings', PreferenceIdApiKey);
	}));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIdSetApiKey, async () => {
		const input: string = await vscode.window.showInputBox({
			placeHolder: 'Input your OpenAI API Key',
			password: true,
		}) ?? '';

		await SecretApiKeyStore.instance.store(input);
		if (!input) {
			client = UnconfiguredClient.instance;
			const message = new vscode.MarkdownString(MessageSetApiKey);
			message.isTrusted = true;
			vscode.window.showWarningMessage(message.value);
			return;
		}

		client = await initialize();
		vscode.window.showInformationMessage("API Key is updated.");
	}));

	const apiKey = await SecretApiKeyStore.instance.get();
	if (apiKey) {
		client = await initialize();
	} else {
		// Need to call this after 'slidaiv.command.setApiKey' is registered.
		setApiKey();
	}

	context.subscriptions.push(vscode.commands.registerCommand(CommandIdGenerateContents, async () => {
		doTaskWithProgress("Generating Slidev contents", getTaskGenerateContents(client));
	}));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIdDecorateContents, async () => {
		doTaskWithProgress("Decorating Slidev contents", getTaskDecorateContent(client));
	}));


	Logger.info('Slidaiv is now active');
}

// This method is called when your extension is deactivated
export function deactivate() { }
