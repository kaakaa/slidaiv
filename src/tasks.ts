import * as vscode from 'vscode';

import { Client } from "./client/openai";
import { Logger } from "./logger";

export const getTaskDecorateContent = (client: Client, logger: Logger) => {
    return async (progress: vscode.Progress<any>) => {
        logger.info('Decorating contents');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (!selection || selection.isEmpty) {
            vscode.window.showErrorMessage('No selection');
            return;
        }
        const highlighted = editor.document.getText(selection);
        logger.debug(`selection: \n${highlighted}`);
        progress.report({ increment: 10 });

        logger.info('Call LLM to decorate the contents');
        const decorated = await client.decorateContents(highlighted);
        logger.debug(`decorated: \n${decorated}`);
        if (!decorated) {
            progress.report({ increment: 90 });
            throw new Error('Failed to decorate the contents');
        }
        progress.report({ increment: 80 });

        logger.info('Write the slide contents');
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, selection, decorated);
        const isEdited = await vscode.workspace.applyEdit(edit);
        if (!isEdited) {
            progress.report({ increment: 10 });
            throw new Error('Failed to replace the slide contents');
        }
        progress.report({ increment: 10 });
    }
}