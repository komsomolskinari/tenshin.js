grammar TJSON;

tjson: value;
pair: STRING ('=>' | ':') value;
obj: '[' ((pair ',')* pair ','?)? ']';
array: '[' ((value ',')* value ','?)? ']';
value: STRING | obj | array;
STRING: STRINGD | STRINGS | SPSTRING;
STRINGD: '"' .? '"';
STRINGS: '\'' .? '\'';
SPSTRING: ' ' .+ ' ';