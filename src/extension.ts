// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import type {SlidevMarkdown, SourceSlideInfo} from '@slidev/types';
import {parse} from '@slidev/parser';

import {ExtensionID} from './constants';
import {Client} from './client/openai';
import { obj2frontmatter } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "demo-webpack" is now active!');

	const apiKey:string = vscode.workspace.getConfiguration(ExtensionID).get('apiKey') || '';
	const baseUrl:string|null = vscode.workspace.getConfiguration(ExtensionID).get('baseUrl') || null;

	const client = new Client(apiKey, baseUrl);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
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
