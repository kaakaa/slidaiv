import * as vscode from 'vscode';

import { Logger } from "@/logger";
import { SlidevPage } from '@/model/slidev';
import type { LLMClient } from '@/client/llmClient';

export class CustomCancellationToken {
    constructor(private readonly token: vscode.CancellationToken) { }

    onCancellationRequested(listener: () => void): vscode.Disposable {
        return this.token.onCancellationRequested(() => {
            Logger.info("User requested to cancel the task.");
            listener();
        });
    }
}

export const getTaskGenerateContents = (client: LLMClient) => {
    return async (progress: vscode.Progress<any>, token: vscode.CancellationToken) => {
        Logger.info('Generating contents');
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

        Logger.info(`Call LLM to generate the contents.`);
        const page = await slidevPage.rewriteByLLM(new CustomCancellationToken(token), client);

        progress.report({ increment: 80, message: 'Write the generated slide contents' });
        Logger.info('Write the slide contents');
        const range = new vscode.Range(slidevPage.start, 0, slidevPage.end, 0);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, range, page);
        const isEdited = await vscode.workspace.applyEdit(edit);
        if (!isEdited) {
            throw new Error('Failed to write the generated slide contents');
        }

        progress.report({ increment: 20, message: 'Done' });
    };
};

export const getTaskDecorateContent = (client: LLMClient) => {
    return async (progress: vscode.Progress<any>, token: vscode.CancellationToken) => {
        Logger.info('Decorating contents');
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
        Logger.debug(`selection: \n${highlighted}`);

        Logger.info('Call LLM to decorate the contents');
        const decorated = await client.decorateContents(new CustomCancellationToken(token), highlighted);
        Logger.debug(`decorated: \n${decorated}`);
        if (!decorated) {
            throw new Error('Failed to decorate the contents');
        }

        progress.report({ increment: 80, message: 'Write the decorated text' });
        Logger.info('Write the slide contents');
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, selection, decorated);
        const isEdited = await vscode.workspace.applyEdit(edit);
        if (!isEdited) {
            throw new Error('Failed to replace the slide contents');
        }

        progress.report({ increment: 20, message: 'Done' });
    };
};

export async function doTaskWithProgress(title: string, task: { (progress: vscode.Progress<any>, token: vscode.CancellationToken): Promise<void> }) {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: title,
            cancellable: true
        }, task);
    } catch (e: any) {
        vscode.window.showErrorMessage(`failed to task(${title}): ${e.message}`);
        Logger.error(`failed to task(${title}): ${e.message}`);

    }
}
