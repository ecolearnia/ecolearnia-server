/* lexical grammar */
/* http://stackoverflow.com/questions/8467150/how-to-get-abstract-syntax-tree-ast-out-of-jison-parser */
%lex
%%

\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b                return 'NUMBER'
'AND'                 return 'AND'
'OR'                  return 'OR'
'NOT'                 return 'NOT'
L?\"(\\.|[^\\"])*\"                    return 'STRING_LITERAL'
'('                   return 'LPAREN'
')'                   return 'RPAREN'
'='                   return 'EQ'
'!='                  return 'NEQ'
'>'                   return 'GT'
'>='                  return 'GEQT'
'<'                   return 'LT'
'<='                  return 'LEQT'
'IN'                  return 'IN'
','                   return 'COMMA'
[_a-zA-Z][_a-zA-Z0-9]{0,30}            return 'IDEN'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start start
%% /* language grammar */

start
    :  search_condition EOF
        {return $1;}
    ;

search_condition
    : search_condition OR boolean_term
        {$$ = {
        	'or': [ $1, $3 ]
        	};
        }
    | boolean_term
    ;

boolean_term
	: boolean_factor
	| boolean_term AND boolean_factor
		{$$ = {
        	'and': [ $1, $3 ]
        	};
        }
    ;

boolean_factor
	: boolean_test
	;

boolean_test
	: boolean_primary
	;

boolean_primary
	: predicate
	| LPAREN search_condition RPAREN
		{$$ = $2}
    ;

predicate
	: comparison_predicate
	| in_predicate
	;

comparison_predicate
	: IDEN comp_op value_expression
		{$$ = {
        	var: $1,
        	op: $2,
        	val: $3
        	};
        }
    ;

value_expression
	: NUMBER
	| STRING_LITERAL
	;

comp_op
	: EQ
	| NEQ
	| GT
	| GEQT
	| LT
	| LEQT
	;

in_predicate
	: IDEN IN in_predicate_value
	{$$ = {
        	in: $3
        	};
        }
    ;

in_predicate_value
	: LPAREN in_value_list RPAREN
	{$$ = [$2];}
    ;

in_value_list
	: in_value_list_element
		{$$ = []; $$.push($1); }
	| in_value_list COMMA in_value_list_element
		{$1.push($3); $$ = $1; }
	;

in_value_list_element
	: value_expression
		{$$ = $1;}
	;