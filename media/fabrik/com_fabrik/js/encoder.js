/**
 * A Javascript object to encode and/or decode html characters using HTML or Numeric entities that handles double or partial encoding
 * Author: R Reid
 * documentation: http://www.strictly-software.com/htmlencode
 * source: http://www.strictly-software.com/scripts/downloads/encoder.js
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2011 Robert Reid - Strictly-Software.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Revision:
 *  2011-07-14, Jacques-Yves Bleau:
 *       - fixed conversion error with capitalized accentuated characters
 *       + converted arr1 and arr2 to object property to remove redundancy
 *
 * Revision:
 *  2011-11-10, Ce-Yi Hio:
 *       - fixed conversion error with a number of capitalized entity characters
 *
 * Revision:
 *  2011-11-10, Rob Reid:
 *    - changed array format
 *
 * Revision:
 *  2012-09-23, Alex Oss:
 *    - replaced string concatonation in numEncode with string builder, push and join for peformance with ammendments by Rob Reid
 */

/**
 * A Javascript object to encode and/or decode html characters using HTML or Numeric entities that handles double or partial encoding
 * Author: R Reid
 * Licenses: GPL, MIT
 * Copyright: (c) 2011 Robert Reid - Strictly-Software.com
 */

export class Encoder {
    constructor() {
        // When encoding do we convert characters into html or numerical entities
        this.EncodeType = "entity"; // "entity" OR "numerical"

        // Arrays for conversion from HTML Entities to Numerical values
        this.arr1 = ['&nbsp;', '&iexcl;', '&cent;', '&pound;', '&curren;', '&yen;', '&brvbar;', '&sect;', '&uml;', '&copy;', '&ordf;', '&laquo;', '&not;', '&shy;', '&reg;', '&macr;', '&deg;', '&plusmn;', '&sup2;', '&sup3;', '&acute;', '&micro;', '&para;', '&middot;', '&cedil;', '&sup1;', '&ordm;', '&raquo;', '&frac14;', '&frac12;', '&frac34;', '&iquest;', '&Agrave;', '&Aacute;', '&Acirc;', '&Atilde;', '&Auml;', '&Aring;', '&AElig;', '&Ccedil;', '&Egrave;', '&Eacute;', '&Ecirc;', '&Euml;', '&Igrave;', '&Iacute;', '&Icirc;', '&Iuml;', '&ETH;', '&Ntilde;', '&Ograve;', '&Oacute;', '&Ocirc;', '&Otilde;', '&Ouml;', '&times;', '&Oslash;', '&Ugrave;', '&Uacute;', '&Ucirc;', '&Uuml;', '&Yacute;', '&THORN;', '&szlig;', '&agrave;', '&aacute;', '&acirc;', '&atilde;', '&auml;', '&aring;', '&aelig;', '&ccedil;', '&egrave;', '&eacute;', '&ecirc;', '&euml;', '&igrave;', '&iacute;', '&icirc;', '&iuml;', '&eth;', '&ntilde;', '&ograve;', '&oacute;', '&ocirc;', '&otilde;', '&ouml;', '&divide;', '&oslash;', '&ugrave;', '&uacute;', '&ucirc;', '&uuml;', '&yacute;', '&thorn;', '&yuml;', '&quot;', '&amp;', '&lt;', '&gt;', '&OElig;', '&oelig;', '&Scaron;', '&scaron;', '&Yuml;', '&circ;', '&tilde;', '&ensp;', '&emsp;', '&thinsp;', '&zwnj;', '&zwj;', '&lrm;', '&rlm;', '&ndash;', '&mdash;', '&lsquo;', '&rsquo;', '&sbquo;', '&ldquo;', '&rdquo;', '&bdquo;', '&dagger;', '&Dagger;', '&permil;', '&lsaquo;', '&rsaquo;', '&euro;', '&fnof;', '&Alpha;', '&Beta;', '&Gamma;', '&Delta;', '&Epsilon;', '&Zeta;', '&Eta;', '&Theta;', '&Iota;', '&Kappa;', '&Lambda;', '&Mu;', '&Nu;', '&Xi;', '&Omicron;', '&Pi;', '&Rho;', '&Sigma;', '&Tau;', '&Upsilon;', '&Phi;', '&Chi;', '&Psi;', '&Omega;', '&alpha;', '&beta;', '&gamma;', '&delta;', '&epsilon;', '&zeta;', '&eta;', '&theta;', '&iota;', '&kappa;', '&lambda;', '&mu;', '&nu;', '&xi;', '&omicron;', '&pi;', '&rho;', '&sigmaf;', '&sigma;', '&tau;', '&upsilon;', '&phi;', '&chi;', '&psi;', '&omega;', '&thetasym;', '&upsih;', '&piv;', '&bull;', '&hellip;', '&prime;', '&Prime;', '&oline;', '&frasl;', '&weierp;', '&image;', '&real;', '&trade;', '&alefsym;', '&larr;', '&uarr;', '&rarr;', '&darr;', '&harr;', '&crarr;', '&lArr;', '&uArr;', '&rArr;', '&dArr;', '&hArr;', '&forall;', '&part;', '&exist;', '&empty;', '&nabla;', '&isin;', '&notin;', '&ni;', '&prod;', '&sum;', '&minus;', '&lowast;', '&radic;', '&prop;', '&infin;', '&ang;', '&and;', '&or;', '&cap;', '&cup;', '&int;', '&there4;', '&sim;', '&cong;', '&asymp;', '&ne;', '&equiv;', '&le;', '&ge;', '&sub;', '&sup;', '&nsub;', '&sube;', '&supe;', '&oplus;', '&otimes;', '&perp;', '&sdot;', '&lceil;', '&rceil;', '&lfloor;', '&rfloor;', '&lang;', '&rang;', '&loz;', '&spades;', '&clubs;', '&hearts;', '&diams;'];
        this.arr2 = this.arr1.map(entity => `&#${entity.charCodeAt(1)};`);
    }

    isEmpty(val) {
        return val === null || val.length === 0 || /^\s+$/.test(val);
    }

    HTML2Numerical(s) {
        return this.swapArrayVals(s, this.arr1, this.arr2);
    }

    NumericalToHTML(s) {
        return this.swapArrayVals(s, this.arr2, this.arr1);
    }

    numEncode(s) {
        if (this.isEmpty(s)) return "";

        return Array.from(s).map(c => (c < " " || c > "~") ? `&#${c.charCodeAt()};` : c).join("");
    }

    htmlDecode(s) {
        if (this.isEmpty(s)) return "";

        let d = this.HTML2Numerical(s);
        const arr = d.match(/&#[0-9]{1,5};/g);

        if (arr) {
            arr.forEach(m => {
                const c = m.substring(2, m.length - 1);
                d = d.replace(m, c >= -32768 && c <= 65535 ? String.fromCharCode(c) : "");
            });
        }

        return d;
    }

    htmlEncode(s, dbl = false) {
        if (this.isEmpty(s)) return "";

        if (dbl) {
            s = this.EncodeType === "numerical" ? s.replace(/&/g, "&#38;") : s.replace(/&/g, "&amp;");
        }

        s = this.XSSEncode(s, false);

        if (this.EncodeType === "numerical" || !dbl) {
            s = this.HTML2Numerical(s);
        }

        s = this.numEncode(s);

        if (!dbl) {
            s = s.replace(/&#/g, "##AMPHASH##");
            s = this.EncodeType === "numerical" ? s.replace(/&/g, "&#38;") : s.replace(/&/g, "&amp;");
            s = s.replace(/##AMPHASH##/g, "&#");
            s = this.correctEncoding(s);
        }

        if (this.EncodeType === "entity") {
            s = this.NumericalToHTML(s);
        }

        return s;
    }

    XSSEncode(s, en = true) {
        if (this.isEmpty(s)) return "";

        return en
            ? s.replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            : s.replace(/'/g, "&#39;").replace(/"/g, "&#34;").replace(/</g, "&#60;").replace(/>/g, "&#62;");
    }

    hasEncoded(s) {
        return /&#[0-9]{1,5};/g.test(s) || /&[A-Z]{2,6};/gi.test(s);
    }

    stripUnicode(s) {
        return s.replace(/[^         return s.replace(/[^\x20-~        return s.replace(/[^\x20-\x7E]/g, "");
    }

    correctEncoding(s) {
        return s.replace(/(&amp;)(amp;)+/, "$1");
    }

    swapArrayVals(s, arr1, arr2) {
        if (this.isEmpty(s)) return "";

        arr1.forEach((val, idx) => {
            s = s.replace(new RegExp(val, 'g'), arr2[idx]);
        });

        return s;
    }

    inArray(item, arr) {
        return arr.indexOf(item);
    }
}

window.Encoder = Encoder;
