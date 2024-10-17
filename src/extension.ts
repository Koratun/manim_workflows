// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function getCommand(): string | null {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return null;
	}

	const document = editor.document;
	const filePath = document.fileName;

	// Get all lines of the document
	const allLines = document.getText().split('\n');

	// Find lines that define classes
	const classLines: Array<{ lineText: string; lineNumber: number }> = [];
	const classRegex = /^class\s+(\w+)\s*\((.*?)\):/;

	allLines.forEach((lineText, index) => {
		if (classRegex.test(lineText)) {
			classLines.push({ lineText, lineNumber: index });
		}
	});

	// Get the cursor position
	const cursorPosition = editor.selection.active;
	const cursorLineNumber = cursorPosition.line;

	// Find the first class defined before the cursor
	let matchingClass: { lineText: string; lineNumber: number } | undefined;
	for (let i = classLines.length - 1; i >= 0; i--) {
		if (classLines[i].lineNumber <= cursorLineNumber) {
			matchingClass = classLines[i];
			break;
		}
	}

	if (!matchingClass) {
		vscode.window.showErrorMessage('No matching classes found before the cursor.');
		return null;
	}

	// Extract the scene name
	const match = classRegex.exec(matchingClass.lineText);
	if (!match) {
		return null;
	}
	const sceneName = match[1];

	const cmds = ['manim', '--renderer opengl', filePath, sceneName];
	// let enter = false;

	// if (cursorLineNumber !== matchingClass.lineNumber) {
	// 	// cmds.push(`-s -n ${cursorLineNumber + 1}`);
	// 	enter = true;
	// }

	return cmds.join(' ');
}

function sendCommandToTerminal(command: string) {
	let terminal = vscode.window.activeTerminal;

	if (!terminal) {
		terminal = vscode.window.createTerminal('Manim Terminal');
	}

	terminal.show();

	// Send the command to the terminal
	terminal.sendText(command);
}

function checkpointPaste(argStr: string = '') {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	// Copy selected text to clipboard
	const selection = editor.selection;
	let selectedText = editor.document.getText(selection);

	if (!selectedText) {
		vscode.window.showInformationMessage('No text selected.');
		return;
	}

	vscode.env.clipboard.writeText(selectedText);

	// Prepare the command
	const lines = selectedText.split('\n');
	const firstLine = lines[0].trim();
	const startsWithComment = firstLine.startsWith('#');

	let command: string;
	if (lines.length === 1 && !startsWithComment) {
		command = selectedText;
	} else {
		const comment = startsWithComment ? firstLine : '#';
		command = `checkpoint_paste(${argStr}) ${comment} (${lines.length} lines)`;
	}

	sendCommandToTerminal(command);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let runSceneCommand = vscode.commands.registerCommand('manim-workflows.runManimScene', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found.');
			return;
		}

		// Save the current file
		editor.document.save();

		const command = getCommand();
		if (!command) {
			return;
		}

		// Optionally copy the command to the clipboard
		// const commandWithOptions = result.command + ' --renderer=opengl -w';
		// vscode.env.clipboard.writeText(commandWithOptions);

		sendCommandToTerminal(command);
	});

	let exitManimCommand = vscode.commands.registerCommand('extension.exitManim', () => {
		sendCommandToTerminal('\x03quit');
	});

	// Commands for different variations
	let checkpointPasteCommand = vscode.commands.registerCommand('extension.checkpointPaste', () => {
		checkpointPaste();
	});

	let recordedCheckpointPasteCommand = vscode.commands.registerCommand('extension.recordedCheckpointPaste', () => {
		checkpointPaste('record=True');
	});

	let skippedCheckpointPasteCommand = vscode.commands.registerCommand('extension.skippedCheckpointPaste', () => {
		checkpointPaste('skip=True');
	});

	context.subscriptions.push(
		runSceneCommand,
		exitManimCommand,
		checkpointPasteCommand,
		recordedCheckpointPasteCommand,
		skippedCheckpointPasteCommand
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
