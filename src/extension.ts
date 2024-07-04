import * as vscode from 'vscode';

import { ExtensionID } from './constants';
import { Client } from './client/openai';
import { SlidevPage } from './model/slidev';

export function activate(context: vscode.ExtensionContext) {
	const apiKey:string = vscode.workspace.getConfiguration(ExtensionID).get('apiKey') || '';
	const baseUrl:string|null = vscode.workspace.getConfiguration(ExtensionID).get('baseUrl') || null;
	const client = new Client(apiKey, baseUrl, vscode.env.language);

	let disposable = vscode.commands.registerCommand('slidaiv.generateContents', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Generating Slidev contents',
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0, message: 'Parsing Slidev contents'});
			const position = editor.selection.active;

			let slidevPage: SlidevPage;
			let page: string;
			// parse text and generate contents from LLM
			try {
				slidevPage = await SlidevPage.init(
					editor.document.getText(),
					editor.document.fileName,
					position.line
				);
				progress.report({ increment: 10, message: 'Generating Slidev contents'});
				const llmModel: string = vscode.workspace.getConfiguration(ExtensionID).get('model') || '';
				page = await slidevPage.rewriteByLLM(client, llmModel);
			} catch (e: any) {
				vscode.window.showErrorMessage(`failed to generate Slidev content: ${e.message}`);
				progress.report({ increment: 100 });
				return;
			}
			
			progress.report({ increment: 40, message: 'Replace the slide contents'});

			// apply the generated contents to the editor
			try {
				const range = new vscode.Range(slidevPage.start, 0, slidevPage.end, 0);
				const edit = new vscode.WorkspaceEdit();
				edit.replace(editor.document.uri, range , page);
				const isEdited = await vscode.workspace.applyEdit(edit);
				if (!isEdited) {
					vscode.window.showErrorMessage('Failed to replace the slide contents');
					progress.report({ increment: 10 });
					return;
				}
				progress.report({ increment: 50 });
			} catch (e: any) {
				vscode.window.showErrorMessage(`failed to apply content: ${e.message}`);
				progress.report({ increment: 100 });
				return;
			}
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
