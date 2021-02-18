const vscode = require('vscode')
// 引入vscode

function activate(context){
// 定义activate函数用于包裹需要注册的概念
	let disposable = vscode.languages.registerFoldingRangeProvider('nonmem_cn', { //定义一个disposable用于储存注册的内容
		provideFoldingRanges(document, context, token) {
			// console.log('folding range invoked'); // comes here on every character edit
			let sectionStart = 0, FR = [], re = /^\$/;  // regex to detect start of region

			for (let i = 0; i < document.lineCount; i++) {
				let ls1=document.lineAt(i).text
				console.log(ls1)

				if (re.test(document.lineAt(i).text)) {
					if (sectionStart >= 0) {
						FR.push(new vscode.FoldingRange(sectionStart, i - 1, vscode.FoldingRangeKind.Region));
					}
					sectionStart = i;
				}
			}
			if (sectionStart > 0) { FR.push(new vscode.FoldingRange(sectionStart, document.lineCount - 1, vscode.FoldingRangeKind.Region)); }

			return FR;
		}
	});
	context.subscriptions.push(disposable);
}

function deactivate(){}

exports.activate = activate;
exports.deactivate = deactivate;

module.exports = {
  activate,
  deactivate
}