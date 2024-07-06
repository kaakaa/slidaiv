import * as vscode from 'vscode';

import { Client } from "@/client/openai";
import { Logger } from "@/logger";
import { SlidevPage } from '@/model/slidev';

export class CustomCancellationToken {
    private token: vscode.CancellationToken;
    private readonly logger: Logger;
    constructor(token: vscode.CancellationToken, logger: Logger) {
        this.token = token;
        this.logger = logger;
    }

    onCancellationRequested(listener: () => void): vscode.Disposable {
        return this.token.onCancellationRequested(() => {
            this.logger.info("User requested to cancel the task.")
            listener();
        });
    }
}

export const getTaskGenerateContents = (client: Client, logger: Logger) => {
    return async (progress: vscode.Progress<any>, token: vscode.CancellationToken) => {
        logger.info('Generating contents');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active editor');
        }
        const position = editor.selection.active;
        const slidevPage = await SlidevPage.init(
            editor.document.getText(),
            editor.document.fileName,
            position.line
        );

        logger.info(`Call LLM to generate the contents.`);
        logger.debug(`{baseURL: ${client.baseURL}, model: ${client.llmModel}}`);
        const page = await slidevPage.rewriteByLLM(new CustomCancellationToken(token, logger), client);

        progress.report({ increment: 80, message: 'Write the generated slide contents' });
        logger.info('Write the slide contents')
        const range = new vscode.Range(slidevPage.start, 0, slidevPage.end, 0);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, range, page);
        const isEdited = await vscode.workspace.applyEdit(edit);
        if (!isEdited) {
            throw new Error('Failed to write the generated slide contents');
        }

        progress.report({ increment: 20, message: 'Done' });
    }
}

export const getTaskDecorateContent = (client: Client, logger: Logger) => {
    return async (progress: vscode.Progress<any>, token: vscode.CancellationToken) => {
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

        logger.info('Call LLM to decorate the contents');
        const decorated = await client.decorateContents(new CustomCancellationToken(token, logger), highlighted);
        logger.debug(`decorated: \n${decorated}`);
        if (!decorated) {
            throw new Error('Failed to decorate the contents');
        }

        progress.report({ increment: 80, message: 'Write the decorated text' });
        logger.info('Write the slide contents');
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, selection, decorated);
        const isEdited = await vscode.workspace.applyEdit(edit);
        if (!isEdited) {
            throw new Error('Failed to replace the slide contents');
        }

        progress.report({ increment: 20, message: 'Done' });
    }
}