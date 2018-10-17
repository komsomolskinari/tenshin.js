const TokenType = {
    OPERATOR: 'OPERATOR',
    INT: 'INTEGER',
    DOUBLE: 'DECIMAL',
    VAR: 'VARIABLE'
}

const operator_list = {
    '+': 0, '-': 0, '*': 0, '/': 0, '%': 0,
    '&': 0, '|': 0, '^': 0, '**': 0, '<': 0, '>': 0, '~': 0, '(': 0, ')': 0
}

class Token {
    constructor(value, tag) {
        this.value = value;
        this.tag = tag;
    }
}

class Reader {
    constructor(input_data) {
        this.seq = input_data;
        this.cursor = 0;
        this.urng = input_data.length;
    }
    next() {
        return this.seq[this.cursor++];
    }
    cursor_data() {
        return this.seq[this.cursor]
    }
    has_next() {
        return this.cursor < this.urng;
    }
    peek() {
        return this.seq[this.cursor + 1];
    }
}

var reader;

class Lexer {
    constructor(input_expreesion) {
        reader = new Reader(input_expreesion);
    }
    parse() {
        var token_list = [];
        let last_token = () => { return token_list[token_list.length - 1] };
        let is_digit = (x) => { return x >= '0' && x <= '9' };
        let is_escape = (x) => { return x === ' ' || x === '\n' || x === '\t' };
        function readNum() {
            var ans = {
                v: '', t: TokenType.INT
            };
            while (reader.has_next() && (is_digit(reader.cursor_data()) || reader.cursor_data() === '.' || is_escape(reader.cursor_data()))) {
                if (is_escape(reader.cursor_data())) continue;
                ans.v += reader.next();
            }
            if (reader.has_next() && reader.cursor_data() === 'e' && (reader.peek() === '-' || reader.peek() === '+')) {
                ans.v += reader.next() + reader.next();
                while (reader.has_next() && is_digit(reader.cursor_data())) {
                    ans.v += reader.next();
                }
            }
            if (ans.v.search('.') !== -1 || ans.v.search('e-') !== -1) {
                ans.t = TokenType.DOUBLE;
            }
            return ans;
        }
        while (reader.has_next()) {
            var cur = reader.next();
            if (is_escape(cur)) continue;
            if (is_digit(cur)) {
                var ret = readNum();
                token_list.push(new Token(cur + ret.v, ret.t));
            } else if (cur in operator_list) {
                var prev = last_token();
                if (typeof prev !== 'undefined') prev = prev.tag;
                if (cur === '-') {
                    if (typeof prev !== 'undefined' && (prev === TokenType.INT || prev === TokenType.DOUBLE)) {
                        token_list.push(new Token(cur, TokenType.OPERATOR));
                    } else {
                        var ret = readNum();
                        cur += ret.v;
                        token_list.push(new Token(cur, ret.t));
                    }
                } else if (cur === '~') {
                    var ret = readNum();
                    token_list.push(new Token(cur + ret.v, TokenType.INT));
                } else if ((cur === '*' || cur === '<' || cur === '>') && reader.has_next() && reader.cursor_data() === cur) {
                    cur += reader.next()
                    token_list.push(new Token(cur, TokenType.OPERATOR));
                } else {
                    token_list.push(new Token(cur, TokenType.OPERATOR));
                }
            } else {
                throw "Error character @ " + (reader.cursor - 1) + " " + cur;
            }
        }
        return token_list;
    }
}

class OperatorNode {
    constructor(op, fi, se) {
        this.op = op;
        this.fi = fi;
        this.se = se;
    }
    eval() {
        switch (this.op) {
            case '+':
                return this.fi.eval() + this.se.eval();
            case '-':
                return this.fi.eval() - this.se.eval();
            case '*':
                return this.fi.eval() * this.se.eval();
            case '/':
                return this.fi.eval() / this.se.eval();
            case '%':
                return this.fi.eval() % this.se.eval();
            case '**':
                return this.fi.eval() ** this.se.eval();
            case '<<':
                return this.fi.eval() << this.se.eval();
            case '>>':
                return this.fi.eval() >> this.se.eval();
            case '&':
                return this.fi.eval() & this.se.eval();
            case '|':
                return this.fi.eval() | this.se.eval();
            case '^':
                return this.fi.eval() ^ this.se.eval();
            default:
                break;
        }
    }
}

class ConstNode {
    constructor(v) {
        this.value = v;
    }
    eval() {
        return this.value;
    }
}

class ExpressionTreeConstructor {
    constructor(tokenList) {
        reader = new Reader(tokenList);
        this.operator = [];
        this.num = [];
    }
    addNode() {
        var se = this.num.pop();
        var fi = new ConstNode(0);
        if (this.num.length !== 0) {
            fi = this.num.pop();
        }
        var op = this.operator.pop();
        this.num.push(new OperatorNode(op, fi, se));
    }
    get opTop() {
        return this.operator[this.operator.length - 1]
    }
    build_tree() {
        while (reader.has_next()) {
            var cur = reader.next();
            switch (cur.tag) {
                case TokenType.INT:
                    if (cur.value.startsWith('~')) {
                        this.num.push(new ConstNode(~parseInt(cur.value.slice(1))));
                    } else {
                        this.num.push(new ConstNode(parseInt(cur.value)));
                    }
                    break;
                case TokenType.DOUBLE:
                    if (cur.value.startsWith('~')) {
                        this.num.push(new ConstNode(~parseFloat(cur.value.slice(1))));
                    } else {
                        this.num.push(new ConstNode(parseFloat(cur.value)));
                    }
                    break;
                case TokenType.OPERATOR:
                    switch (cur.value) {
                        case '(':
                            this.operator.push('(');
                            break;
                        case ')':
                            while (this.operator.length && this.opTop !== '(') {
                                this.addNode();
                            }
                            this.operator.pop();
                            break;
                        case '%':
                        case '**':
                            while (this.operator.length && this.opTop === cur.value) {
                                this.addNode();
                            }
                            this.operator.push(cur.value);
                            break;
                        case '*':
                        case '/':
                            while (this.operator.length && (this.opTop === '*' || this.opTop === '/')) {
                                this.addNode();
                            }
                            this.operator.push(cur.value);
                            break;
                        case '+':
                        case '-':
                            while (this.operator.length && this.opTop !== '(' && this.opTop !== '|' && this.opTop !== '&' && this.opTop !== '^') {
                                this.addNode();
                            }
                            this.operator.push(cur.value);
                            break;
                        case '|':
                        case '&':
                        case '^':
                        case '<<':
                        case '>>':
                            while (this.operator.length && this.opTop !== '(') {
                                this.addNode();
                            }
                            this.operator.push(cur.value);
                            break;
                        default:
                            throw "Error Operator " + cur.value;
                    }
                default:
                    break;
            }
        }
        while (this.operator.length) {
            this.addNode();
        }
        return this.num[0];
    }
}
var tokens = new Lexer('(1.25+3e-2+1e+3)*5').parse();
console.log(tokens);
console.log(new ExpressionTreeConstructor(tokens).build_tree().eval())