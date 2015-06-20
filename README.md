# expr.js
Interpretador de expressões lógicas e aritméticas. Feito com <3.

# Exemplos de uso
Analisando lógicamente uma expressão: <br>
<code> ex('¬(true→false)→true∧false↔false') </code> <br>
Expressões matemáticas: <br>
<code> ex('[(5+5*2)^3]') </code><br>
Obter a tabela verdade da expressão: <br>
<code> f_TabelaVerdade('(¬(P Λ Q) ↔ (¬P ∨ ¬Q)) Λ S')</code>
