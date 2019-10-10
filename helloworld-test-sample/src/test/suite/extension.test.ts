import * as assert from 'assert';
import * as sinon from 'sinon';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../extension';
import { ui } from '../../userinput';
import { ext } from '../../extensionVariables';

// The root workspace folder that vscode is opened against for tests
let testRootFolder: string;


suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	vscode.commands.executeCommand('extension.helloWorld');
	ext.ui = ui;

	test('showInputBox - default value on Enter', async function () {
		
	 	await ui.runWithInputs(['test'], async () => {
			let input = await vscode.commands.executeCommand('samples.quickInput');
			assert.equal(input, "test");
	 	});
	});

	 test('default value on Enter', async function () {
		await ui.runWithInputs(['some input'], async () => {
			let input = await ext.ui.showInputBox({ value: 'farboo' });
			assert.equal(input, "some input");
		});
	});
});
