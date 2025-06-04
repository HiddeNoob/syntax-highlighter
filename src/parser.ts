const dataTypes = [
  // Signed integer types 
    "signed char",
    "signed short int",
    "signed int",
    "signed long int",
    "signed long long int",

    // Unsigned integer types
    "unsigned char",
    "unsigned short int",
    "unsigned int",
    "unsigned long int",
    "unsigned long long int",

    // Implicit signed types 
    "char",
    "short int",
    "int",
    "long int",
    "long long int",

    // Floating point types
    "float",
    "double",
    "long double"
]

const tokenSpecs: Record<string, { regex: RegExp; ignore?: boolean }> = {
  keyword: { regex: new RegExp(`\\b(${dataTypes.join("|")})\\b`) },
  number: { regex: /\b\d+(\.\d+)?\b/ },
  identifier: { regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
  operator: { regex: /[=+\-*/]/ },
  punctuation: { regex: /[;(){}]/ },
  whitespace: { regex: /\s+/, ignore: true },
};

export interface Token {
  type: string;
  value: string;
}

export function tokenize(input: string): Token[] {
  let tokens: Token[] = [];
  let i = 0;
  const specEntries = Object.entries(tokenSpecs);
  while (i < input.length) {
    let matched = false;
    for (const [type, spec] of specEntries) {
      const regex = new RegExp("^" + spec.regex.source);
      const result = regex.exec(input.slice(i));
      if (result) {
        matched = true;
        if (!spec.ignore) {
          tokens.push({ type, value: result[0] });
        }
        i += result[0].length;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "error", value: input[i] });
      throw new Error(`Lexer Error: Unexpected character '${input[i]}' at position ${i}`);
    }
  }
  return tokens;
}
// ---

interface StackItem {
  type: string;
  value?: string;
}

export function bottomUpParse(tokens: Token[]): boolean {
  const stack: StackItem[] = [{ type: "$", value: "" }]; // Başlangıç sembolü
  let inputPointer = 0;

  const peek = (offset: number = 0): Token | undefined => {
    return tokens[inputPointer + offset];
  };

  const getStackTopType = (): string => {
    return stack[stack.length - 1].type;
  };

  const getStackTypes = (): string[] => {
    return stack.map(item => item.type);
  };

  const reduce = (): boolean => {
    const stackTypes = getStackTypes();
    const stackLength = stack.length;

    // Kural 1: stmt → keyword identifier operator expr punctuation
    // Örnek: let x = 10;
    // Yığın: [..., keyword, identifier, operator, expr, punctuation]
    if (stackLength >= 5 &&
        stackTypes[stackLength - 5] === "keyword" &&
        stackTypes[stackLength - 4] === "expr" && // Burası identifier olarak kalmalı
        stackTypes[stackLength - 3] === "operator" && stack[stackLength - 3].value === "=" &&
        stackTypes[stackLength - 2] === "expr" &&
        stackTypes[stackLength - 1] === "punctuation" && stack[stackLength - 1].value === ";") {
      stack.splice(stackLength - 5, 5);
      stack.push({ type: "stmt" });
      console.log("Reduced: stmt <- keyword identifier operator expr punctuation", getStackTypes().join(" "));
      return true;
    }

    if(stackLength >= 2 &&
      stackTypes[stackLength - 1] == 'stmt' &&
      stackTypes[stackLength - 2] == 'stmt' 
    ){
      stack.splice(stackLength - 2,2)
      stack.push({type : "stmt"});
      console.log("Reduced: stmt <- stmt stmt", getStackTypes().join(" "));

    } 

    // Kural 2: expr → number
    // Örnek: 10
    // Yığın: [..., number]
    if (stackTypes[stackLength - 1] === "number") {
      stack.pop(); // number çıkar
      stack.push({ type: "expr" }); // yerine expr koy
      console.log("Reduced: expr <- number", getStackTypes().join(" "));
      return true;
    }

    // Kural 3: expr → identifier (ifade içinde kullanılan tanımlayıcı)
    // Örnek: y = x + 5 (buradaki x)
    // Yığın: [..., identifier]
    if (stackTypes[stackLength - 1] === "identifier") {
      stack.pop(); // identifier çıkar
      stack.push({ type: "expr" }); // yerine expr koy
      console.log("Reduced: expr <- identifier", getStackTypes().join(" "));
      return true;
    }

    // Kural 4: expr → expr operator expr
    // Örnek: 10 + 5, a * b
    // Yığın: [..., expr, operator, expr]
    if (stackLength >= 3 &&
        stackTypes[stackLength - 3] === "expr" &&
        stackTypes[stackLength - 2] === "operator" && stack[stackLength - 2].value != "=" &&
        stackTypes[stackLength - 1] === "expr") {
      stack.splice(stackLength - 3, 3); // expr, operator, expr çıkar
      stack.push({ type: "expr" }); // yerine tek bir expr koy
      console.log("Reduced: expr <- expr operator expr", getStackTypes().join(" "));
      return true;
    }

    // Kural 5: expr → ( expr )
    // Örnek: (2 + 3)
    // Yığın: [..., punctuation '(', expr, punctuation ')']
    if (stackLength >= 3 &&
        stackTypes[stackLength - 3] === "punctuation" && stack[stackLength - 3].value === "(" &&
        stackTypes[stackLength - 2] === "expr" &&
        stackTypes[stackLength - 1] === "punctuation" && stack[stackLength - 1].value === ")") {
      stack.splice(stackLength - 3, 3); // (, expr, ) çıkar
      stack.push({ type: "expr" }); // yerine expr koy
      console.log("Reduced: expr <- ( expr )", getStackTypes().join(" "));
      return true;
    }

    return false; // Hiçbir kural eşleşmedi
  };

  while (true) {
    const currentToken = peek();
    const stackTypes = getStackTypes(); // Her döngüde stackTypes'ı güncelleyelim

    console.log(`\nStack: [${stackTypes.join(", ")}]`, `Input: ${currentToken ? currentToken.type + " (" + currentToken.value + ")" : "EOF"}`);

    // Kabul durumu: Yığınımızda sadece başlangıç sembolü ($) ve ayrıştırılan ana ifade (stmt) varsa
    if (stack.length === 2 && stack[0].type === "$" && getStackTopType() === "stmt" && !currentToken) {
      console.log("Parse Successful!");
      return true;
    }

    let didReduce = false;
    do {
      didReduce = reduce();
      // Eğer azaltma olduysa, kabul durumunu tekrar kontrol et (yığın değişmiş olabilir)
      if (stack.length === 2 && stack[0].type === "$" && getStackTopType() === "stmt" && !currentToken) {
          console.log("Parse Successful!");
          return true;
      }
    } while (didReduce);

    // Eğer daha fazla girdi yoksa ve hiçbir azaltma yapılamıyorsa, hata durumu
    if (!currentToken && !didReduce) {
      console.error("Parse Error: No more input and no reduction possible, input might be incomplete or malformed.");
      return false;
    }

    // Azaltma yapılamadıysa ve hala girdi varsa, kaydırma yap (shift)
    if (currentToken) {
      console.log(`Shifting: ${currentToken.type} (${currentToken.value})`);
      stack.push(currentToken);
      inputPointer++;
    } else {
        // Bu noktaya gelinmemesi gerekir, yukarıdaki kontrol yeterli olmalı
        console.error("Parse Error: Unexpected state during parsing.");
        return false;
    }
  }
}

