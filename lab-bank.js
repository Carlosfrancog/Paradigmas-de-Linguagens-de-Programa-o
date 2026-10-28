/* Parameterized, traceable practice generators: 8 modules x 112 questions. */
window.PLP_LAB_MODULES=[
 {id:'imperativo',name:'Imperativo',families:[
 (n)=>({code:`int x = ${n}; x += ${n+2}; printf("%d",x);`,q:'Qual valor será impresso?',ans:String(n*2+2),wrong:[String(n),String(n+2)],why:'A atribuição composta soma ao valor anterior: x = n + (n + 2).'}),
 (n)=>({code:`int total=0; for(int i=0;i<${n};i++) total+=i; printf("%d",total);`,q:'Qual é a soma exibida?',ans:String(n*(n-1)/2),wrong:[String(n*n),String(n)],why:'O laço percorre de 0 a n−1, cuja soma é n(n−1)/2.'}),
 (n)=>({code:`int x=${n}; if(x%2==0) x+=3; else x-=2; printf("%d",x);`,q:'Qual será a saída?',ans:String(n%2===0?n+3:n-2),wrong:[String(n),String(n%2===0?n-2:n+3)],why:'A condição escolhe um único ramo conforme a paridade de x.'}),
 (n)=>({code:`int x=${n}; while(x>0) x-=2; printf("%d",x);`,q:'Qual será o valor final?',ans:String(n%2===0?0:-1),wrong:[String(1),String(n)],why:'O while reduz de dois em dois até deixar de satisfazer x > 0.'}),
 (n)=>({code:`int a=${n},b=${n+1}; int t=a;a=b;b=t; printf("%d",a);`,q:'O que é impresso após a troca?',ans:String(n+1),wrong:[String(n),String(2*n+1)],why:'Uma variável temporária permite trocar os conteúdos de a e b.'}),
 (n)=>({code:`int x=${n}; x=x*2; x=x-1; printf("%d",x);`,q:'Qual valor será exibido?',ans:String(n*2-1),wrong:[String(n*2),String(n-1)],why:'As atribuições são sequenciais e usam o valor atualizado da variável.'}),
 (n)=>({code:`int count=0; for(int i=1;i<=${n};i++) count++; printf("%d",count);`,q:'Quantas iterações ocorrem?',ans:String(n),wrong:[String(n-1),String(n+1)],why:'O laço inclusivo executa de 1 até n, exatamente n vezes.'}),
 (n)=>({code:`int a=${n}; int b=${n+3}; printf("%d",a<b);`,q:'Qual o resultado booleano numérico em C?',ans:'1',wrong:['0',String(n)],why:'A comparação verdadeira em C produz 1 ao ser impressa com %d.'})
 ]},
 {id:'ponteiros',name:'Ponteiros',families:[
 (n)=>({code:`int x=${n}; int *p=&x; *p+=2; printf("%d",x);`,q:'Qual a saída?',ans:String(n+2),wrong:[String(n),'2'],why:'*p acessa diretamente a memória de x e altera seu conteúdo.'}),
 (n)=>({code:`int x=${n}; int *p=&x; printf("%d",*p);`,q:'Qual valor é acessado por *p?',ans:String(n),wrong:[String(n+1),'0'],why:'O operador de desreferência obtém o valor da variável apontada.'}),
 (n)=>({code:`int a=${n},b=${n+1}; int *p=&a; p=&b; printf("%d",*p);`,q:'Qual valor é impresso?',ans:String(n+1),wrong:[String(n),'0'],why:'O ponteiro passa a apontar para b após a segunda atribuição.'}),
 (n)=>({code:`int x=${n}; int *p=&x; int y=*p+5; printf("%d",y);`,q:'Qual o valor de y?',ans:String(n+5),wrong:[String(n),'5'],why:'O valor referenciado por p é somado a 5.'}),
 (n)=>({code:`int x=${n}; int *p=&x; (*p)++; printf("%d",x);`,q:'Qual a saída?',ans:String(n+1),wrong:[String(n),'1'],why:'O incremento aplica-se ao conteúdo apontado e atualiza x.'}),
 (n)=>({code:`int a=${n},b=${n+2}; int *p=&a; *p=b; printf("%d",a);`,q:'Qual valor recebe a?',ans:String(n+2),wrong:[String(n),'0'],why:'Atribuir a *p modifica o objeto apontado (a).'}),
 (n)=>({code:`int x=${n}; int *p=&x; int **pp=&p; printf("%d",**pp);`,q:'Qual é a saída?',ans:String(n),wrong:['0',String(n+1)],why:'Uma dupla desreferência percorre pp → p → x.'}),
 (n)=>({code:`int x=${n}; int *p=&x; *p=*p*2; printf("%d",x);`,q:'Qual valor final de x?',ans:String(n*2),wrong:[String(n),String(n+2)],why:'O conteúdo apontado é multiplicado por 2 e armazenado na mesma posição.'})
 ]},
 {id:'escopo',name:'Escopo e semântica',families:[
 (n)=>({code:`int x=${n}; { int x=${n+2}; printf("%d",x); }`,q:'Qual x será exibido?',ans:String(n+2),wrong:[String(n),'0'],why:'O x local sombreia o x externo dentro do bloco.'}),
 (n)=>({code:`int x=${n}; { int x=${n+2}; } printf("%d",x);`,q:'Qual x é exibido após o bloco?',ans:String(n),wrong:[String(n+2),'0'],why:'Fora do bloco, o identificador local não está no escopo.'}),
 (n)=>({code:`int a=${n}; int b=a+4; printf("%d",b);`,q:'Qual o valor de b?',ans:String(n+4),wrong:[String(n),'4'],why:'A inicialização de b lê o valor atual de a.'}),
 (n)=>({code:`int x=${n}; { x+=2; } printf("%d",x);`,q:'Qual será o valor final?',ans:String(n+2),wrong:[String(n),'2'],why:'Sem nova declaração, o bloco interno altera a variável externa.'}),
 (n)=>({code:`int x=${n}; int y=x; x++; printf("%d",y);`,q:'O que imprime y?',ans:String(n),wrong:[String(n+1),'0'],why:'y recebeu a cópia do valor de x antes do incremento.'}),
 (n)=>({code:`int x=${n}; int y=${n+1}; { int y=${n+3}; } printf("%d",y);`,q:'Qual o y visível fora do bloco?',ans:String(n+1),wrong:[String(n+3),String(n)],why:'O y declarado no bloco não altera o y externo.'}),
 (n)=>({code:`int x=${n}; { x=x+3; } printf("%d",x);`,q:'Qual valor é exibido?',ans:String(n+3),wrong:[String(n),'3'],why:'A variável externa permanece acessível no bloco filho.'}),
 (n)=>({code:`int a=${n}; int b=${n+2}; int c=a+b; printf("%d",c);`,q:'Qual resultado?',ans:String(2*n+2),wrong:[String(n),String(n+2)],why:'c recebe a soma dos valores, e não seus endereços.'})
 ]},
 {id:'tipos',name:'Sistema de tipos',families:[
 (n)=>({code:`int a=${n}; double b=2.0; double c=a+b;`,q:'Qual o tipo declarado da variável c?',ans:'double',wrong:['int','char'],why:'A declaração explicita double e a soma envolve operando de ponto flutuante.'}),
 (n)=>({code:`int x=${n}; x=x+1;`,q:'Em linguagem C, qual o tipo de x após a operação?',ans:'int',wrong:['float','string'],why:'Uma atribuição não altera o tipo declarado de x.'}),
 (n)=>({code:`double x=${n}.5; int y=(int)x;`,q:'Qual o valor de y?',ans:String(n),wrong:[`${n}.5`,String(n+1)],why:'O cast de double para int descarta a parte fracionária nesse caso.'}),
 (n)=>({code:`int a=${n}; double b=(double)a;`,q:'Que conversão aparece no código?',ans:'Explícita',wrong:['Nenhuma','Conversão de texto'],why:'O cast (double) solicita explicitamente conversão para ponto flutuante.'}),
 (n)=>({code:`enum Status { NOVO, ATIVO, FIM }; Status s=ATIVO;`,q:'Qual conceito é empregado?',ans:'Enumeração',wrong:['Ponteiro','Recursão'],why:'Enum reúne um conjunto de constantes nomeadas.'}),
 (n)=>({code:`int dados[${n}];`,q:'Quantos elementos o vetor pode armazenar?',ans:String(n),wrong:[String(n-1),String(n+1)],why:'O número entre colchetes determina a quantidade de elementos do array.'}),
 (n)=>({code:`int x=${n}; double y=${n}.5;`,q:'Qual variável é declarada como ponto flutuante?',ans:'y',wrong:['x','ambas'],why:'double declara tipo real; int representa inteiros.'}),
 (n)=>({code:`int nums[${n}];`,q:'Qual o último índice válido em C?',ans:String(n-1),wrong:[String(n),'1'],why:'Arrays em C usam índices de 0 a N−1.'})
 ]},
 {id:'subprogramas',name:'Subprogramas',families:[
 (n)=>({code:`void muda(int v){v+=3;} int x=${n}; muda(x); printf("%d",x);`,q:'Qual a saída?',ans:String(n),wrong:[String(n+3),'3'],why:'O parâmetro int é passado por valor; a variável original não muda.'}),
 (n)=>({code:`int soma(int a,int b){return a+b;} printf("%d",soma(${n},2));`,q:'Qual será a saída?',ans:String(n+2),wrong:[String(n),'2'],why:'A função soma retorna a soma dos argumentos.'}),
 (n)=>({code:`int dobro(int x){return x*2;} printf("%d",dobro(${n}));`,q:'Qual resultado?',ans:String(n*2),wrong:[String(n),String(n+2)],why:'A função devolve x*2 pelo return.'}),
 (n)=>({code:`void muda(int *v){*v+=4;} int x=${n}; muda(&x); printf("%d",x);`,q:'Qual saída?',ans:String(n+4),wrong:[String(n),'4'],why:'O endereço de x é passado à função, que altera o valor por indireção.'}),
 (n)=>({code:`int f(int a){return a+1;} int g(int x){return f(x)*2;} printf("%d",g(${n}));`,q:'Qual a saída?',ans:String((n+1)*2),wrong:[String(n*2),String(n+1)],why:'g chama f, recebe n+1 e multiplica o resultado por 2.'}),
 (n)=>({code:`int quadrado(int x){return x*x;} printf("%d",quadrado(${n}));`,q:'Qual o retorno?',ans:String(n*n),wrong:[String(n*2),String(n)],why:'A função multiplica o parâmetro por si mesmo.'}),
 (n)=>({code:`void add(int *p){*p+=1;} int a=${n}; add(&a);`,q:'Qual valor final de a?',ans:String(n+1),wrong:[String(n),'1'],why:'A função modifica o argumento original através de ponteiro.'}),
 (n)=>({code:`int f(int a,int b){return a-b;} printf("%d",f(${n+3},${n}));`,q:'Qual a saída?',ans:'3',wrong:[String(n),'0'],why:'Os argumentos formais recebem os valores na ordem posicional.'})
 ]},
 {id:'oo',name:'Orientação a objetos',families:[
 (n)=>({code:`class Conta { private int saldo=${n}; public int getSaldo(){return saldo;} }`,q:'Como outro objeto deve ler saldo?',ans:'getSaldo()',wrong:['Acessar saldo diretamente','Usar goto'],why:'private oculta o atributo; um método público pode expor leitura controlada.'}),
 (n)=>({code:`class Base { int valor(){return ${n};} } class Filha extends Base { int valor(){return ${n+1};} }`,q:'Qual conceito aparece na redefinição do método?',ans:'Sobrescrita',wrong:['Sobrecarga','Encadeamento goto'],why:'A subclasse redefine o método herdado mantendo a assinatura.'}),
 (n)=>({code:`class A { int f(){return ${n};} } class B extends A { int f(){return ${n+2};} } A x=new B();`,q:'Com despacho dinâmico, qual seria x.f()?',ans:String(n+2),wrong:[String(n),'0'],why:'O método da instância real B é escolhido em tempo de execução.'}),
 (n)=>({code:`class Pessoa { String nome; Pessoa(String x){nome=x;} }`,q:'Qual o papel de Pessoa(String x)?',ans:'Construtor',wrong:['Destrutor','Interface'],why:'O construtor inicializa o estado do objeto criado.'}),
 (n)=>({code:`class Animal {} class Gato extends Animal {}`,q:'Qual relação é representada?',ans:'Herança',wrong:['Composição numérica','Passagem por valor'],why:'extends indica que Gato é subclasse de Animal.'}),
 (n)=>({code:`class X { private int a=${n}; public int ver(){return a;} }`,q:'Qual modificador controla a visibilidade do campo a?',ans:'private',wrong:['public','static'],why:'private restringe acesso externo ao atributo.'}),
 (n)=>({code:`abstract class Forma { abstract int area(); }`,q:'Forma pode ser instanciada diretamente?',ans:'Não',wrong:['Sim','Somente com goto'],why:'Uma classe abstrata não pode ser instanciada diretamente.'}),
 (n)=>({code:`interface Gravavel { void salvar(); } class Arquivo implements Gravavel { public void salvar(){} }`,q:'O que implements expressa?',ans:'Implementação de interface',wrong:['Herança múltipla de classes','Conversão numérica'],why:'A classe implementa o contrato definido pela interface.'})
 ]},
 {id:'sintaxe',name:'Sintaxe e léxico',families:[
 (n)=>({code:`int valor${n} = ${n};`,q:'Qual a classificação de valor'+n+'?',ans:'Identificador',wrong:['Palavra reservada','Operador'],why:'valor'+n+' nomeia uma variável e corresponde à categoria identificador.'}),
 (n)=>({code:`int x = ${n} + 2;`,q:'Qual dos itens é operador?',ans:'+',wrong:['int',String(n)],why:'O símbolo + realiza operação aritmética.'}),
 (n)=>({code:`int x = ${n};`,q:'O que é int no léxico de C?',ans:'Palavra reservada',wrong:['Identificador de usuário','Literal'],why:'int é uma palavra reservada que indica tipo.'}),
 (n)=>({code:`if (x > ${n}) { x++; }`,q:'O que é if?',ans:'Palavra reservada',wrong:['Nome de variável','Constante'],why:'if é um token de palavra reservada usado na seleção.'}),
 (n)=>({code:`int x = (${n} + 1;`,q:'Qual problema há no trecho?',ans:'Parêntese não fechado',wrong:['Falta de variável global','Obrigatório usar goto'],why:'O agrupamento de tokens viola a estrutura sintática ao deixar parêntese aberto.'}),
 (n)=>({code:`float x = ${n}.5;`,q:'O que representa '+n+'.5?',ans:'Literal numérico',wrong:['Identificador','Modificador de acesso'],why:'A sequência numérica é um literal; seu token classifica a constante.'}),
 (n)=>({code:`int indice_${n}=0;`,q:'Como classificar indice_'+n+'?',ans:'Identificador',wrong:['Palavra-chave','Operador'],why:'É um nome válido de variável, não um símbolo de operação.'}),
 (n)=>({code:`int x=${n}; // comentário`,q:'Qual item é separador de instruções em C?',ans:';',wrong:['int','x'],why:'O ponto e vírgula delimita o término da instrução.'})
 ]},
 {id:'paradigmas',name:'Paradigmas',families:[
 (n)=>({code:`int x=${n}; x=x+1;`,q:'Qual paradigma se destaca pelas atribuições e mudança de estado?',ans:'Imperativo',wrong:['Lógico','Funcional puro'],why:'O paradigma imperativo modela execução como sequências de comandos que modificam estado.'}),
 (n)=>({code:`dobro x = x * 2`,q:'Qual paradigma enfatiza composição de funções?',ans:'Funcional',wrong:['Assembly','Procedural com goto'],why:'O paradigma funcional modela cálculo por avaliação e composição de funções.'}),
 (n)=>({code:`pai(ana, bia).\nmae(bia, carlos).`,q:'Qual paradigma utiliza fatos e regras para inferir soluções?',ans:'Lógico',wrong:['Imperativo','Orientado a objetos'],why:'A programação lógica descreve relações e usa inferência.'}),
 (n)=>({code:`class Pessoa { nome; falar(){} }`,q:'Qual paradigma enfatiza objetos e mensagens?',ans:'Orientado a objetos',wrong:['Lógico','Máquina'],why:'O paradigma OO reúne dados e comportamentos em objetos.'}),
 (n)=>({code:`int soma=0; for(int i=0;i<${n};i++) soma+=i;`,q:'O laço e a atribuição são característicos de qual paradigma?',ans:'Imperativo',wrong:['Lógico','Funcional puro'],why:'Sequenciamento, repetição e atribuição são elementos centrais da programação imperativa.'}),
 (n)=>({code:`map(dobro, [1,2,3])`,q:'Qual paradigma favorece aplicar funções a coleções?',ans:'Funcional',wrong:['Lógico baseado em fatos','Imperativo com goto'],why:'Funções como valores e transformação de listas são comuns no estilo funcional.'}),
 (n)=>({code:`regra(X) :- fato(X).`,q:'Qual é o modelo dessa sintaxe de regra?',ans:'Lógico',wrong:['Orientado a objetos','Assembly'],why:'A regra declara uma relação derivada de fatos, típica de Prolog.'}),
 (n)=>({code:`objeto.metodo();`,q:'O envio de mensagens é especialmente associado ao paradigma...',ans:'Orientado a objetos',wrong:['Lógico puro','Máquina'],why:'Objetos encapsulam estado e comportamento acessados por métodos.'})
 ]}
];
const mix=(a,s)=>{const b=[...a];let x=s*1103515245+12345>>>0;for(let i=b.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b};
window.PLP_LAB_BANK={};
for(const module of window.PLP_LAB_MODULES){
 window.PLP_LAB_BANK[module.id]=[];
 for(let i=0;i<112;i++){
  const n=3+Math.floor(i/8);
  const question=module.families[i%8](n);
  const choices=[question.ans,...question.wrong].filter((v,index,arr)=>arr.indexOf(v)===index);
  while(choices.length<3)choices.push('Alternativa extra '+choices.length);
  const options=mix(choices,i+n);
  window.PLP_LAB_BANK[module.id].push({...question,id:module.id+'-'+(i+1),topic:module.name,options,answer:options.indexOf(question.ans)});
 }
}
