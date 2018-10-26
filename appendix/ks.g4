// FAKE!!

grammar ks;

ks: (commands)*;
commands: command | LINE;
command: '[' identifier (arg)? ']';
arg: SP identifier (SP? '=' SP? value)?;
identifier: IDENTCH*;
value: STRING | identifier;

SP: '\S';
LINE: '[~\r\n]'+;
IDENTCH: '\p{L}';
STRING: '"' .? '"' | '\'' .? '\'';