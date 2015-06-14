// declaração das funções
var f 	 = {AND : function(a,b){return a&&b    }, // E
			OR  : function(a,b){return a||b    }, // OU
			IMP : function(a,b){return a?b:true}, // IMPLICAÇÃO 
			BI  : function(a,b){return a==b    }, // BI IMPLICAÇÃO
			EQ  : function(a,b){return a==b    }, // EQUIVALÊNCIA
			ADD : function(a,b){return a+b     }, // ADIÇÃO 
			SUB : function(a,b){return a-b     }, // SUBTRAÇÃO 
			EXP : function(a,b){return Math.pow(a,b) },  // EXPONENCIAÇÃO 
			MUL : function(a,b){return a*b 	   },  // MULTIPLICAÇÃO 
			DIV : function(a,b){return a/b     }  // DIVISÃO 
		   };

// hierarquia de execução e relacionamento de símbolos com operação
var operacao = [ 
				 // Operadores lógicos
				 [String.fromCharCode(8743)  , 'AND'] , // '∧'
				 [String.fromCharCode(923 )  , 'AND'] , // 'Λ'		
				 [String.fromCharCode(8744)  , 'OR' ] , // '∨'
				 [String.fromCharCode(8594)  , 'IMP'] , // '→'
				 [String.fromCharCode(8596)  , 'BI' ] , // '↔'
				 ['='  						 , 'EQ' ] ,
				 // operadores aritméticos
				 ['^'  				         , 'EXP'] ,
				 ['*' 	 					 , 'MUL'] ,
				 ['/' 	 					 , 'DIV'] , 
				 ['+' 	 					 , 'ADD'] ,
				 ['-'  						 , 'SUB'] 
				   
			   ];

// irá substituir na fórmula pelo valor especificado abaixo
var especiais = [
				  [String.fromCharCode(172)/*'¬'*/, ' '],
				  ['!'							  , '' ]
				];

// separadores de blocos prioritários
var grupo = ['{[(', '}])'];
var reservado = ["true", "false"];

// obtém o array de argumentos separados por operações
function f_Expr(expr){
	// quebra a expressão em operadores	
	var op;
	for (op in operacao){
		expr = expr.split(operacao[op][0]).join('|'+operacao[op][0]+'|');
	}

	expr = expr.split('|');
	expr = expr.filter(function(e){return e!=''}); // evita erros de execução
	// irá parar a recursividade quando não houver operador com parâmetros a tratar
	var aux;
	aux = expr.slice();
	for (op in operacao){ // não considera os operadores de extremidado como operador a tratar
		if (aux[0] == operacao[op][0]) {
			aux[0] = '';
		};
		if (aux[aux.length-1] == operacao[op][0]){
			aux[aux.length-1] = '';
		}
	}
	
	aux = aux.filter(function(e){return e!=''});
	// é o fim da recursividade
	if (aux.length<=1){
		return expr.join('');
	}

	// percorre do operador maior prioritário até o menor separando as duplas de argumentos
	var x, esq, dir;
	for (op in operacao){
		for (x=0; x<expr.length; x++){
			// é um operador
			if (expr[x]==operacao[op][0]){
				// só irá extrair os 2 parametros se o argumento não for extremidade
				if ((x!=0)&&(x!=(expr.length-1) )) {
					// pega o operando da esquerda e direita
					esq = expr[x - 1];
					dir = expr[x + 1];
					// substitui o operador pela chamada de função passando os parametros
					expr[x] = 'f.'+operacao[op][1]+'('+esq+','+dir+')';	
					// limpa os operandos. (para poder concatenar depois)
					expr[x - 1] = '';
					expr[x + 1] = '';
				}
			}
			// elimina os espaços vazios para concatenar os elementos
			expr = expr.filter(function(e){return e!=''});
		}
	}

	return f_Expr(expr.join(''));
}

// extrai as expressões de dentro de parênteses, etc.
function f_Extract(expr, substituir){
	// substitui os símbolos especiais
	if (substituir==null){ // este parâmetro serve para que não seja executado a cada laço da recursividade a operação de substituir os símbolos especiais
		substituir = true;	
	}
	if (substituir){
		var j;
		for (j=0; j<especiais[0].length; j++){
			expr = expr.split(especiais[0][j]).join(especiais[1][j]);
		}
	}
	var obj = []; // este argumento não é obrigatório, auxiliar para recursividade
	if ((expr||'')=='') return {};
	// procura o inicio de um bloco.
	var i, ini, fim=-1, ocorrencia, search, separador;
	for (i=0; i<expr.length; i++){
		separador = grupo[0].indexOf(expr[i]);
		// verifica se encontrou o início de um bloco
		if (separador>0){
			
			var s = expr.substring(fim+1, i);
			if ((s||'')!=''){
				var o = obj.length;
				obj[o] = f_Expr(s);
			}

			ini = i+1;
			ocorrencia = 0; // procura o próximo separador
			for (search = i+1; search<expr.length; search++){
				// conta os separadores internos e ignora até achar o separador finalizador
				ocorrencia += (grupo[0].indexOf(expr[search])>0?1:0) - (grupo[1].indexOf(expr[search])>0?1:0);		
				if (ocorrencia<0) {
					break;
				}
			}
			fim = search; 
			var o = obj.length;
			obj[o] = [];
			var s = expr.substring(ini, fim); // corta do início do bloco até o fim

			obj[o] = f_Extract(s, false);  // procura sub-blocos
			
			i = search; // pula até o fim do bloco
		}

	}
	// bloco fora de parênteses
	var s = expr.substring(fim+1, i);
	if ((s||'')!=''){
		var o = obj.length;
		obj[o] = f_Expr(s);	
	}

	return f_Expr(obj.join(''));
}

// Retorna todos os separadores
function f_GetSeparadores(){
	return grupo.join('')+especiais.join('');
}
// Obtém as variáveis de uma expressão
function f_GetVars(expr){
	var op;
	// separa por operação
	for (op in operacao){
		expr = expr.split(operacao[op][0]).join('|');
	}
	// separa por símbolos 
	var s = f_GetSeparadores();
	var c;
	for (c=0; c<s.length; c++){
		expr = expr.split(s[c]).join('|');
	}
	expr = expr.split('|').filter(function(a){return reservado.indexOf(a)<0&&a!=''&&isNaN(Number(a))}).reduce(function(a,b){
    if (a.indexOf(b) < 0 ) a.push(b);
    return a;
  },[]).sort(function(a, b){
	  return b.length - a.length; // ASC -> a - b; DESC -> b - a
	});;;
	return expr;
}

// gera as N possibilidades para as variáveis da fórmula
function f_Possibilidades(n){
    var ret = [];
    for(y=0; y<Math.pow(2,n); y++){
        var c = [];
        for(x=0; x<n; x++){
            c.push(1==((y >> x) & 1));
        }
        ret.push(c);
    }
    return ret;
}

// obtém a tabela verdade de uma expressão
function f_TabelaVerdade(expr){
	// extrai as variaveis
	var l_vars = f_GetVars(expr);
	var l_val  = f_Possibilidades(l_vars.length);
	var l_p, l_i, l_ret=[];
	// percorre cada combinação possível
	for (l_i in l_val){
		var obj = {};
		// define o valor de cada variavel
		for (l_p in l_vars){
			eval(l_vars[l_p]+'='+l_val[l_i][l_p]);
			obj[l_vars[l_p]] = l_val[l_i][l_p];
		}
		
		// executa a expressão
		obj.resultado=ex(expr);
		
		l_ret.push(obj);
	}
	return l_ret;
}

// executa uma expressão
function ex(expressao){
	return eval(f_Extract(expressao));
}
