# 🧠 Real-Time Grammar-Based Syntax Highlighter

Gerçek zamanlı çalışan, C benzeri ifadeleri analiz edebilen bir **Syntax Highlighter + Bottom-Up Parser** uygulaması. React ile geliştirilmiş, yazdığınız kodu hem renklendirir hem de sözdizimi açısından geçerli olup olmadığını anında kontrol eder.

* [📄 Makale](./article.pdf)
* [🎥 Video](https://www.youtube.com/watch?v=ldsRcJCwo-E)

---

## Özellikler

* Gerçek zamanlı sözdizimi kontrolü
* Shift-reduce (bottom-up) parser
* Tokenization (lexical analiz)
* Lexer hatalarında uyarı
* React tabanlı kullanıcı arayüzü
* Syntax vurgulama (highlighting)

---

## Kurulum

```bash
git clone https://github.com/hiddenoob/syntax-highlighter.git
cd syntax-highlighter
npm install
npm run start
```

> Tarayıcıda `http://localhost:3000` adresinden açılır.

---

## Kullanım

Kod kutusuna C benzeri bir ifade yazın:

```c
int x = (3 + 2) * 5;
```

### Sonuçlar:

* Geçerliyse: `Valid Statement` mesajı görünür.
* Sözdizimi hatalıysa: `Invalid Statement` uyarısı verilir.
* Tanınmayan karakter varsa: lexer hatası görüntülenir.

---

## Dil Kuralları

### 1. Bildirim (Declaration)

```
decl → keyword identifier
```

Örnek:

```c
int a;
```

---

### 2. Atama (Assignment)

```
assign → decl = expr
```

Örnek:

```c
int a = 5;
```

---

### 3. İfade (Expression)

```
expr → number
     | identifier
     | ( expr )
     | expr operator expr
```

Örnekler:

```c
5
a
(2 + 3)
x * (y + 1)
```

---

### 4. Cümle (Statement)

```
stmt → decl ;
     | assign ;
     | stmt stmt
```

Örnekler:

```c
int a;
int b = 5;
int c = a + b;
```

---

## Teknik Detaylar

### Dil ve Dilbilgisi Seçimi

Kullanılan dil, C benzeri temel bir sözdizimine sahiptir. Desteklenen veri tipleri:

* `int`, `signed`, `unsigned`, `float`
  Dil; değişken bildirimi, atama ve temel aritmetik işlemleri kapsar.

---

### Sözdizimi Analizi

Girdi:

1. **Tokenize** edilir (sözcüksel analiz).
2. **Shift-reduce** yöntemiyle parse edilir.

Bir yığın (stack) üzerinde çalışılır; tokenlar kurallara göre azaltılarak geçerli/ geçersiz karar verilir.

---

### Sözcüksel Analiz

Tanımlanan token tipleri:

* **Keyword**: `int`, `signed`, `unsigned`, `float`, `long`, `double`
* **Identifier**: `a`, `my_var`
* **Number**: `42`, `3.14`
* **Operator**: `+`, `-`, `*`, `/`, `=`
* **Punctuation**: `;`, `(`, `)`

Regex kullanılır. Boşluklar yok sayılır. Tanımlanamayan karakterlerde lexer hatası verilir.

---

### Vurgulama (Highlighting)

Token türlerine göre renkler atanır:

| Token Türü      | Renk    |
| --------------- | ------- |
| **Keyword**     | Mavi    |
| **Number**      | Yeşil   |
| **Identifier**  | Mor     |
| **Operator**    | Kırmızı |
| **Punctuation** | Gri     |

---

## GUI Arayüzü

React ile geliştirilen arayüz, yazılan kodu anlık olarak:

* Token'lara ayırır
* Renklendirir
* Doğrulama mesajı gösterir (valid / invalid / lexer error)

---

## Proje Yapısı

```bash
src/
├── App.tsx               # Ana bileşen
├── SyntaxHighlighter.tsx # Tokenizer + Parser + Highlight bileşeni
└── styles.css            # Renkler ve tema
```