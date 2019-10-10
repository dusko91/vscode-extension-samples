import { window } from 'vscode';
import { ext } from './extensionVariables';
/**
 * Shows an input box using window.showInputBox().
 */
export async function showInputBox() {
	const result = await ext.ui.showInputBox({
		value: 'abcdef',
		valueSelection: [2, 4],
		placeHolder: 'For example: fedcba. But not: 123',
		validateInput: text => {
			window.showInformationMessage(`Validating: ${text}`);
			return text === '123' ? 'Not 123!' : null;
		}
	});
	window.showInformationMessage(`Got: ${result}`);
	return result;
}