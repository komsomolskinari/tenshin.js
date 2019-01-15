// FAKE!
grammar sli;

SP: '[ \t]+' -> skip;

Line: LineType '{' KeyValue+ '}';
LineType: 'Link' | 'Label';
KeyValue: Mark '=' Mark;
Mark: [0-9A-Za-z]+;