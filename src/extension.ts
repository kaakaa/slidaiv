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
	let disposable = vscode.commands.registerCommand('demo-webpack.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from demo-webpack!');
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const position = editor.selection.active;
		parse(editor.document.getText(), editor.document.fileName).then((parsed: SlidevMarkdown) => {
			// console.log(parsed);
			parsed.slides.forEach(async (slide: SourceSlideInfo) => {
				if (slide.start <= position.line && position.line <= slide.end) {
					// console.log('Current slide:', slide);
					const frontmatter = obj2frontmatter(slide.frontmatter);

					const prompt = `
					- Explain the topic about Fujisawa-shi in Japan
					- location, population, famous people in Fujisawa, and famous places
					`;

					const model:string = vscode.workspace.getConfiguration(ExtensionID).get('model') || '';
					const content = await client.generatePageContents(prompt, model) || 'No response';
					const page = `${frontmatter}\n\n${content}\n\n`;

					const range = new vscode.Range(slide.start, 0, slide.end, 0);
					const edit = new vscode.WorkspaceEdit();
					edit.replace(editor.document.uri, range , page);
					vscode.workspace.applyEdit(edit);
				}
			});
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
