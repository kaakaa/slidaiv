import * as vscode from 'vscode';

import type {SlidevMarkdown, SourceSlideInfo} from '@slidev/types';
import {parse} from '@slidev/parser';

import {ExtensionID} from './constants';
import {Client} from './client/openai';
import { obj2frontmatter } from './utils';

export function activate(context: vscode.ExtensionContext) {
	const apiKey:string = vscode.workspace.getConfiguration(ExtensionID).get('apiKey') || '';
	const baseUrl:string|null = vscode.workspace.getConfiguration(ExtensionID).get('baseUrl') || null;
	const client = new Client(apiKey, baseUrl);

	let disposable = vscode.commands.registerCommand('demo-webpack.helloWorld', async () => {
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
			console.log('start');
			progress.report({ increment: 0, message: 'Parsing Slidev contents'});
			const position = editor.selection.active;
			const parsed = await parse(editor.document.getText(), editor.document.fileName);
			const slide = parsed.slides.find((slide: SourceSlideInfo) => slide.start <= position.line && position.line <= slide.end );
			if (!slide) {
				vscode.window.showErrorMessage(`No slide found at line:${position.line}`);
				progress.report({ increment: 100 });
				return;
			}
			const frontmatter = obj2frontmatter(slide.frontmatter);
			const prompt = `
				- Explain the topic about Fujisawa-shi in Japan
				- location, population, famous people in Fujisawa, and famous places
			`;

			progress.report({ increment: 50, message: 'Call LLM to generate Slidev contents'});
			const model:string = vscode.workspace.getConfiguration(ExtensionID).get('model') || '';
			const content = await client.generatePageContents(prompt, model) || 'No response';
			const page = `${frontmatter}\n\n${content}\n\n`;

			progress.report({ increment: 40, message: 'Replace the slide contents'});
			const range = new vscode.Range(slide.start, 0, slide.end, 0);
			const edit = new vscode.WorkspaceEdit();
			edit.replace(editor.document.uri, range , page);
			const isEdited = await vscode.workspace.applyEdit(edit);
			if (!isEdited) {
				vscode.window.showErrorMessage('Failed to replace the slide contents');
				progress.report({ increment: 10 });
				return;
			}
			progress.report({ increment: 10 });
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
