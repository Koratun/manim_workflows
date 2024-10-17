// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "manim-workflows" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('manim-workflows.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Manim Workflows!');
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('manim-workflows.copyToTerminal', async () => {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const selection = editor.selection;
			let text = editor.document.getText(selection);

			// If no text is selected, use the current line
			if (text.length === 0) {
				text = editor.document.lineAt(selection.active.line).text;
			}

			// Get the integrated terminal, create one if none exists
			let terminal = vscode.window.activeTerminal;
			if (!terminal) {
				terminal = vscode.window.createTerminal('Default Terminal');
			}

			terminal.show();

			// Send the text to the terminal and execute it
			terminal.sendText(text, true);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
