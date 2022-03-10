const vscode = require('vscode')
// 引入vscode

function activate(context){
// 定义activate函数用于包裹需要注册的概念
	let FoldFunction = vscode.languages.registerFoldingRangeProvider('nonmem_cn', { 
        //代码折叠功能实现
		provideFoldingRanges(document, context, token) {
			// console.log('folding range invoked'); // comes here on every character edit
			let sectionStart = 0, FR = [], re = /^\$/;  // regex to detect start of region

			for (let i = 0; i < document.lineCount; i++) {

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


    let OutlineFunction =vscode.languages.registerDocumentSymbolProvider({ language: "nonmem_cn" }, {
        //大纲功能实现
        // new FooDocumentSymbolProvider()
        provideDocumentSymbols(document, token) {
            return new Promise(function (resolve, reject) {
                //定义全局变量
                var symbols = [];
                // console.log("document.lineCount=" +document.lineCount);
                for (var Start_i = 0; Start_i < document.lineCount; Start_i++) {
                    // 第一次逐行迭代，寻找折叠起始位置
                    // 定义迭代过程中的重要中间变量
                    // Start_i
                    let Start_line = document.lineAt(Start_i);
                    let Start_text = document.lineAt(Start_i).text;
                    let Start_pos = new vscode.Position(Start_i, 0); 
                    if (Start_text.startsWith("$")) {
                        // 确认是实在起始位置
                        // 定义迭代过程中的重要中间变量
                        let n_bracket = 1;
                        let SName =Start_text;
                        //预先声明一级大纲，用于为二级大纲提供相对位置
                        let indSymnol = new vscode.DocumentSymbol(
                            SName,"",vscode.SymbolKind.Field,
                            Start_line.range,Start_line.range
                        );

                        for(var End_i = Start_i; n_bracket > 0 && End_i <document.lineCount; End_i++){
                            //循环迭代，寻找下一个$符号，作为结尾
                            //特别注意，一旦上标越界，VScode不会输出报错，但也产生大纲
                            //document.lineCount的中的数量会比实际的多1个，比如有49行文本，则会显示为49，这是异常的，因为js的数组下标从0开始
                            let End_line=(End_i<document.lineCount-1)?document.lineAt(End_i+1):document.lineAt(End_i) 
                            //定义查找$符号的行，一般应比当前行+1，但为避免报错，最后一行时不+1
                            let End_text = End_line.text
                            if (End_text.startsWith("$")) {
                                //查找终止用的$符号，用于退出for循环，停止查找二级大纲
                                n_bracket=0
                            }else{
                                n_bracket=1
                            };
                            //声明用于查找二级大纲的一些变量
                            let End_up_line=document.lineAt(End_i)
                            let End_up_text = End_up_line.text
                            if(/;+[^;]*[a-zA-Z0-9\u4e00-\u9fa5]+/.test(End_up_text)){
                                //正则匹配注释，用于二级大纲
                                result=/;[^;]*[a-zA-Z0-9\u4e00-\u9fa5]+.*/.exec(End_up_text)
                                //设置二级大纲的具体位置
                                let End_up_pos_point1 = new vscode.Position(End_i, result.index);
                                let End_up_pos_point2 = new vscode.Position(End_i, End_up_line.range.end.character);
                                let End_up_pos_range = new vscode.Range(End_up_pos_point1, End_up_pos_point2);
                                //正则获取注释，用于名字
                                let mname = result[0].trim();
                                let m_details = ""
                                childrenSymbol =new vscode.DocumentSymbol(
                                    mname, 
                                    m_details,
                                    vscode.SymbolKind.Method,
                                    End_up_pos_range,
                                    End_up_pos_range
                                )
                                indSymnol.children.push(childrenSymbol)
                                //为当前的一级大纲增加二级大纲
                            };
                        };
                        //更新一级大纲的定义
                        let End_pos = new vscode.Position(End_i, 0);
                        let Srange = new vscode.Range(Start_pos, End_pos);
                        indSymnol.range=Srange
                        indSymnol.selectionRange=Srange
                        symbols.push(indSymnol);
                    };
                };
                resolve(symbols);
            });
        }
    });

    // let HoverFunction = vscode.languages.registerHoverProvider('nonmem_cn', {
    //     provideHover(document, position, token) {
    //         console.log(document);
    //         console.log(position);
    //         console.log(token);
    //         console.log("document.lineAt(position.line)")
    //         console.log(document.lineAt(position.line))
    //         const line = document.lineAt(position.line);
    //         return {
    //             contents: ['IPRED']
    //         };
    //     }
    //   })

	context.subscriptions.push(FoldFunction);
    context.subscriptions.push(OutlineFunction);
    // context.subscriptions.push(HoverFunction);
}

function deactivate(){}

exports.activate = activate;
exports.deactivate = deactivate;

module.exports = {
  activate,
  deactivate
}