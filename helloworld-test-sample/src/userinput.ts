/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { InputBoxOptions, MessageItem, MessageOptions, OpenDialogOptions, QuickPickItem, QuickPickOptions, Uri } from 'vscode';
import * as vscode from "vscode";

export enum TestInput {
    /**
     * Use the first entry in a quick pick or the default value (if it's defined) for an input box. In all other cases, throw an error
     */
    UseDefaultValue,

    /**
     * Simulates the user hitting the back button in an AzureWizard.
     */
    BackButton
}

class GoBackError extends Error {
    constructor() {
        super('Go back.');
    }
}

export class UserInput {
    private readonly _vscode: typeof import('vscode');
    private _inputs: (string | RegExp | TestInput)[] = [];

    constructor(vscode: typeof import('vscode')) {
        this._vscode = vscode;
    }

    public async runWithInputs(inputs: (string | RegExp | TestInput)[], callback: () => Promise<void>): Promise<void> {
        this._inputs = <(string | RegExp | TestInput)[]>inputs;
        await callback();
        assert.equal(this._inputs.length, 0, `Not all inputs were used: ${this._inputs.toString()}`);
    }

    public async showQuickPick<T extends QuickPickItem>(items: T[] | Thenable<T[]>, options: QuickPickOptions): Promise<T> {
        const resolvedItems: T[] = await Promise.resolve(items);

        const input: string | RegExp | TestInput | undefined = this._inputs.shift();
        if (input === undefined) {
            throw new Error(`No more inputs left for call to showQuickPick. Placeholder: '${options.placeHolder}'`);
        } else if (input === TestInput.BackButton) {
            throw new GoBackError();
        } else {
            if (resolvedItems.length === 0) {
                throw new Error(`No quick pick items found. Placeholder: '${options.placeHolder}'`);
            } else if (input instanceof RegExp) {
                const resolvedItem: T | undefined = resolvedItems.find((qpi: T): boolean => {
                    if (qpi.label.match(input) || (qpi.description && qpi.description.match(input))) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (resolvedItem) {
                    return resolvedItem;
                } else {
                    throw new Error(`Did not find quick pick item matching '${input}'. Placeholder: '${options.placeHolder}'`);
                }
            } else if (typeof input === 'string') {
                const resolvedItem: T | undefined = resolvedItems.find((qpi: T) => qpi.label === input || qpi.description === input);
                if (resolvedItem) {
                    return resolvedItem;
                } else {
                    throw new Error(`Did not find quick pick item matching '${input}'. Placeholder: '${options.placeHolder}'`);
                }
            } else if (input === TestInput.UseDefaultValue) {
                return resolvedItems[0];
            } else {
                throw new Error(`Unexpected input '${input}' for showQuickPick.`);
            }
        }
    }

    public async showInputBox(options: InputBoxOptions): Promise<string> {
        const input: string | RegExp | TestInput | undefined = this._inputs.shift();
        if (input === undefined) {
            throw new Error(`No more inputs left for call to showInputBox. Placeholder: '${options.placeHolder}'. Prompt: '${options.prompt}'`);
        } else if (input === TestInput.BackButton) {
            throw new GoBackError();
        } else if (input === TestInput.UseDefaultValue) {
            if (!options.value) {
                throw new Error('Can\'t use default value because none was specified');
            } else {
                return options.value;
            }
        } else if (typeof input === 'string') {
            if (options.validateInput) {
                const msg: string | null | undefined = await Promise.resolve(options.validateInput(input));
                if (msg !== null && msg !== undefined) {
                    throw new Error(msg);
                }
            }
            return input;
        } else {
            throw new Error(`Unexpected input '${input}' for showInputBox.`);
        }
    }

    public showWarningMessage<T extends MessageItem>(message: string, ...items: T[]): Promise<T>;
    public showWarningMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Promise<MessageItem>;
    // tslint:disable-next-line:no-any
    public async showWarningMessage<T extends MessageItem>(message: string, ...args: any[]): Promise<T> {
        const input: string | RegExp | TestInput | undefined = this._inputs.shift();
        if (input === undefined) {
            throw new Error(`No more inputs left for call to showWarningMessage. Message: ${message}`);
        } else if (typeof input === 'string') {
            // tslint:disable-next-line:no-unsafe-any
            const matchingItem: T | undefined = args.find((item: T) => item.title === input);
            if (matchingItem) {
                return matchingItem;
            } else {
                throw new Error(`Did not find message item matching '${input}'. Message: '${message}'`);
            }
        } else {
            throw new Error(`Unexpected input '${input}' for showWarningMessage.`);
        }
    }

    public async showOpenDialog(options: OpenDialogOptions): Promise<Uri[]> {
        const input: string | RegExp | TestInput | undefined = this._inputs.shift();
        if (input === undefined) {
            throw new Error(`No more inputs left for call to showOpenDialog. Message: ${options.openLabel}`);
        } else if (typeof input === 'string') {
            return [this._vscode.Uri.file(input)];
        } else {
            throw new Error(`Unexpected input '${input}' for showOpenDialog.`);
        }
    }
}


export let ui: UserInput = new UserInput(vscode);