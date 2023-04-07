// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as util from 'util';

export function activate(context: vscode.ExtensionContext) {

	const chmodMakeExecutable = vscode.commands.registerCommand('chmod2.makeExecutable', (res: any) => {
		chmod(res && res.resourceUri || res, true)
			.catch(reason => vscode.window.showErrorMessage(reason.message))
	});

	context.subscriptions.push(chmodMakeExecutable);
}

export function deactivate() { }

const fsStat = util.promisify(fs.stat);
const fsChmod = util.promisify(fs.chmod);

async function chmod(res: vscode.Uri, enable: boolean): Promise<void> {
	let fileName: string;
	if (!res) {
		if (vscode.window.activeTextEditor === undefined) {
			throw new Error('No document selected.');
		}
		fileName = vscode.window.activeTextEditor.document.fileName;
	}

	const stat = await fsStat(res.path);
	let mode = stat.mode & 0xFFFF;
	const x = fs.constants.S_IXUSR | fs.constants.S_IXGRP | fs.constants.S_IXOTH;
	if (enable) {
		mode |= x;
	} else {
		mode &= ~x;
	}
	await fsChmod(res.path, mode);
}