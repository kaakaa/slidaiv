// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

import type {SlidevMarkdown, SourceSlideInfo} from '@slidev/types';
import {parse} from '@slidev/parser';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "demo-webpack" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('demo-webpack.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from demo-webpack!');

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const position = editor.selection.active;
		parse(editor.document.getText(), editor.document.fileName).then((parsed: SlidevMarkdown) => {
			// console.log(parsed);
			parsed.slides.forEach(async (slide: SourceSlideInfo) => {
				if (slide.start <= position.line && position.line <= slide.end) {
					console.log('Current slide:', slide);
					const frontmatter = yaml.dump(slide.frontmatter);
					// TODO: Call AI/LLM service
					const content = slide.frontmatter.slidaiv?.instructions;
					const page = await generatePageContents();
					// const page = `---\n${frontmatter}---\n\n${content}\n\n`;
					// console.log('page', page);



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

const generatePageContents = async():Promise<string> => {
	// FIXME: 
	const resp = await fetch('http://127.0.0.1:4010/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer dummy-api-key',
		},
		body: JSON.stringify({
			"model": "mock-llm",
			"messages": [{
				"content":"This is a test.",
				"role": "user",
			}],
		}),
	});
	const json = await resp.json();
	if (json.choices?.length === 0) {
		return 'No response';
	}
	return json.choices[0].message.content;
}

// This method is called when your extension is deactivated
export function deactivate() {}
