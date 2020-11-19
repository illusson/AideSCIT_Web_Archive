"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MD5 = exports.CurlResponseReadException = exports.CurlUrlWrongFormatException = exports.CurlUrlNotSetException = exports.CurlToolException = exports.CurlResponse = exports.CurlCall = exports.FormBody = exports.FormBodyBuilder = exports.CurlRequest = exports.CurlRequestBuilder = exports.CurlClient = exports.CurlClientBuilder = void 0;
var Map_1 = require("./Map");
var CurlClientBuilder = /** @class */ (function () {
    function CurlClientBuilder() {
        this.follow_location = true;
        this.timeout = 30;
    }
    CurlClientBuilder.getInterface = function () {
        return new CurlClientBuilder();
    };
    CurlClientBuilder.prototype.followLocation = function (follow_location) {
        this.follow_location = follow_location;
        return this;
    };
    CurlClientBuilder.prototype.setTimeout = function (time) {
        this.timeout = time;
        return this;
    };
    CurlClientBuilder.prototype.build = function () {
        return new CurlClient(this.follow_location, this.timeout);
    };
    return CurlClientBuilder;
}());
exports.CurlClientBuilder = CurlClientBuilder;
var CurlClient = /** @class */ (function () {
    function CurlClient(follow_location, timeout) {
        this.follow_location = follow_location;
        this.timeout = timeout;
    }
    CurlClient.prototype.isFollowLocation = function () {
        return this.follow_location;
    };
    CurlClient.prototype.getTimeout = function () {
        return this.timeout;
    };
    CurlClient.prototype.newCall = function (request) {
        return new CurlCall(this, request);
    };
    return CurlClient;
}());
exports.CurlClient = CurlClient;
var CurlRequestBuilder = /** @class */ (function () {
    function CurlRequestBuilder() {
        this.url_string = "";
        this.headers = new Map_1.Map();
        this.body = null;
    }
    CurlRequestBuilder.prototype.url = function (url) {
        this.url_string = url;
        return this;
    };
    CurlRequestBuilder.prototype.addHeader = function (key, value) {
        this.headers[key] = value.toString();
        return this;
    };
    CurlRequestBuilder.prototype.addCookie = function (key, value) {
        if (this.headers.has("Cookie")) {
            this.headers.set("Cookie", "");
        }
        this.headers.set("Cookie", this.headers.get("Cookie")
            + key + "=" + value.toString() + "; ");
        return this;
    };
    CurlRequestBuilder.prototype.post = function (body) {
        this.body = body.getFormBody();
        return this;
    };
    CurlRequestBuilder.prototype.build = function () {
        return new CurlRequest(this.url_string, this.headers, this.body);
    };
    return CurlRequestBuilder;
}());
exports.CurlRequestBuilder = CurlRequestBuilder;
var CurlRequest = /** @class */ (function () {
    function CurlRequest(url, headers, body) {
        if (body === void 0) { body = null; }
        this.body = null;
        this.url = url;
        this.headers = headers;
        this.body = body;
    }
    CurlRequest.prototype.getUrl = function () {
        return this.url;
    };
    CurlRequest.prototype.getBody = function () {
        if (this.body == null) {
            return null;
        }
        else {
            return this.body;
        }
    };
    CurlRequest.prototype.getHeaders = function () {
        return this.headers;
    };
    return CurlRequest;
}());
exports.CurlRequest = CurlRequest;
var FormBodyBuilder = /** @class */ (function () {
    function FormBodyBuilder() {
        this.body = new Map_1.Map();
    }
    FormBodyBuilder.prototype.add = function (key, value) {
        if (value === void 0) { value = ""; }
        this.body[key] = value;
        return this;
    };
    FormBodyBuilder.prototype.build = function (app_secret) {
        if (app_secret === void 0) { app_secret = ""; }
        var form_string = "";
        var body_string = "";
        this.body.forEach(new /** @class */ (function () {
            function class_1() {
            }
            class_1.prototype.onEach = function (key, value, map) {
                if (form_string != "") {
                    form_string = form_string + "&";
                }
                form_string = form_string + key + "=" + value;
                if (body_string != "") {
                    body_string = body_string + "&";
                }
                if (key != "access_token") {
                    body_string = body_string + key + "=" + decodeURI(value);
                }
            };
            return class_1;
        }()));
        if (app_secret != "") {
            body_string = body_string + "&sign=" + MD5.getMD5(form_string + app_secret);
        }
        return new FormBody(body_string);
    };
    return FormBodyBuilder;
}());
exports.FormBodyBuilder = FormBodyBuilder;
var FormBody = /** @class */ (function () {
    function FormBody(form_array) {
        this.form_array = form_array;
    }
    FormBody.prototype.getFormBody = function () {
        return this.form_array;
    };
    return FormBody;
}());
exports.FormBody = FormBody;
var CurlCall = /** @class */ (function () {
    function CurlCall(client, request) {
        this.body = null;
        this.responseHeader = new Map_1.Map();
        this.method = "GET";
        if (request.getUrl() == "") {
            throw new CurlUrlNotSetException("The url of this client is not set.");
        }
        else {
            this.xmlRequest = new XMLHttpRequest();
            this.xmlRequest.timeout = client.getTimeout();
            this.url = request.getUrl();
            var this_CurlCall_1 = this;
            request.getHeaders().forEach(new /** @class */ (function () {
                function class_2() {
                }
                class_2.prototype.onEach = function (key, value, map) {
                    this_CurlCall_1.xmlRequest.setRequestHeader(key, value);
                };
                return class_2;
            }()));
            if (request.getBody() != null) {
                this.method = "POST";
                this.body = request.getBody();
            }
        }
    }
    CurlCall.prototype.enqueue = function (callback, requestId) {
        if (requestId === void 0) { requestId = 0; }
        var call_this = this;
        this.xmlRequest.onerror = function (e) {
            callback.onFailure(call_this, new CurlToolException(e.type), requestId);
        };
        this.xmlRequest.ontimeout = function (e) {
            callback.onFailure(call_this, new CurlToolException(e.type), requestId);
        };
        this.xmlRequest.onload = function (e) {
            callback.onResponse(call_this, new CurlResponse(call_this.xmlRequest.status, call_this.responseHeader, call_this.xmlRequest.responseText), requestId);
        };
        this.xmlRequest.open(this.method, this.url, true);
        this.xmlRequest.send(this.body);
        if (this.xmlRequest.getAllResponseHeaders() != "") {
            var header_array = this.xmlRequest.getAllResponseHeaders().split("\n");
            for (var _i = 0, header_array_1 = header_array; _i < header_array_1.length; _i++) {
                var header = header_array_1[_i];
                var header_item = header.split(": ");
                this.responseHeader[header_item[0]] = header_item[1];
            }
        }
    };
    CurlCall.prototype.execute = function () {
        this.xmlRequest.open(this.method, this.url, false);
        this.xmlRequest.send(this.body);
        var headers = new Map_1.Map();
        if (this.xmlRequest.getAllResponseHeaders() != "") {
            var header_array = this.xmlRequest.getAllResponseHeaders().split("\n");
            for (var _i = 0, header_array_2 = header_array; _i < header_array_2.length; _i++) {
                var header = header_array_2[_i];
                var header_item = header.split(": ");
                headers.set(header_item[0], header_item[1]);
            }
        }
        return new CurlResponse(this.xmlRequest.status, headers, this.xmlRequest.responseText);
    };
    return CurlCall;
}());
exports.CurlCall = CurlCall;
var CurlResponse = /** @class */ (function () {
    function CurlResponse(code, headers, body) {
        this.code_value = code;
        this.headers_array = headers;
        this.body_string = body;
    }
    CurlResponse.prototype.code = function () {
        return this.code_value;
    };
    CurlResponse.prototype.header = function (key) {
        return this.headers_array[key];
    };
    CurlResponse.prototype.headers = function () {
        return this.headers_array;
    };
    CurlResponse.prototype.body = function () {
        return this.body_string;
    };
    return CurlResponse;
}());
exports.CurlResponse = CurlResponse;
var CurlToolException = /** @class */ (function (_super) {
    __extends(CurlToolException, _super);
    function CurlToolException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CurlToolException;
}(DOMException));
exports.CurlToolException = CurlToolException;
var CurlUrlNotSetException = /** @class */ (function (_super) {
    __extends(CurlUrlNotSetException, _super);
    function CurlUrlNotSetException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CurlUrlNotSetException;
}(CurlToolException));
exports.CurlUrlNotSetException = CurlUrlNotSetException;
var CurlUrlWrongFormatException = /** @class */ (function (_super) {
    __extends(CurlUrlWrongFormatException, _super);
    function CurlUrlWrongFormatException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CurlUrlWrongFormatException;
}(CurlToolException));
exports.CurlUrlWrongFormatException = CurlUrlWrongFormatException;
var CurlResponseReadException = /** @class */ (function (_super) {
    __extends(CurlResponseReadException, _super);
    function CurlResponseReadException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CurlResponseReadException;
}(CurlToolException));
exports.CurlResponseReadException = CurlResponseReadException;
var MD5 = /** @class */ (function () {
    function MD5() {
    }
    MD5.getMD5 = function (s) {
        return MD5.rstr2hex(MD5.rstr_md5(MD5.str2rstr_utf8(s)));
    };
    MD5.rstr_md5 = function (s) {
        return MD5.binl2rstr(MD5.binl_md5(MD5.rstr2binl(s), s.length * 8));
    };
    MD5.rstr2hex = function (input) {
        var hex_tab = 0 ? "0123456789ABCDEF" : "0123456789abcdef";
        var output = "";
        var x;
        for (var i = 0; i < input.length; i++) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F)
                + hex_tab.charAt(x & 0x0F);
        }
        return output;
    };
    MD5.str2rstr_utf8 = function (input) {
        var output = "";
        var i = -1;
        var x, y;
        while (++i < input.length) {
            /* Decode utf-16 surrogate pairs */
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                i++;
            }
            /* Encode output as utf-8 */
            if (x <= 0x7F)
                output += String.fromCharCode(x);
            else if (x <= 0x7FF)
                output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F), 0x80 | (x & 0x3F));
            else if (x <= 0xFFFF)
                output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
            else if (x <= 0x1FFFFF)
                output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
        }
        return output;
    };
    MD5.rstr2binl = function (input) {
        var output = Array(input.length >> 2);
        for (var i = 0; i < output.length; i++)
            output[i] = 0;
        for (var i = 0; i < input.length * 8; i += 8)
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        return output;
    };
    MD5.binl2rstr = function (input) {
        var output = "";
        for (var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        return output;
    };
    MD5.binl_md5 = function (x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            a = MD5.md5_ff(a, b, c, d, x[i], 7, -680876936);
            d = MD5.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = MD5.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = MD5.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = MD5.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = MD5.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = MD5.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = MD5.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = MD5.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = MD5.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = MD5.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = MD5.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = MD5.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = MD5.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = MD5.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = MD5.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = MD5.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = MD5.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = MD5.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = MD5.md5_gg(b, c, d, a, x[i], 20, -373897302);
            a = MD5.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = MD5.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = MD5.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = MD5.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = MD5.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = MD5.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = MD5.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = MD5.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = MD5.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = MD5.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = MD5.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = MD5.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = MD5.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = MD5.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = MD5.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = MD5.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = MD5.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = MD5.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = MD5.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = MD5.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = MD5.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = MD5.md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = MD5.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = MD5.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = MD5.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = MD5.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = MD5.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = MD5.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = MD5.md5_ii(a, b, c, d, x[i], 6, -198630844);
            d = MD5.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = MD5.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = MD5.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = MD5.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = MD5.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = MD5.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = MD5.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = MD5.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = MD5.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = MD5.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = MD5.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = MD5.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = MD5.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = MD5.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = MD5.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = MD5.safe_add(a, olda);
            b = MD5.safe_add(b, oldb);
            c = MD5.safe_add(c, oldc);
            d = MD5.safe_add(d, oldd);
        }
        return [a, b, c, d];
    };
    MD5.md5_cmn = function (q, a, b, x, s, t) {
        return MD5.safe_add(MD5.bit_rol(MD5.safe_add(MD5.safe_add(a, q), MD5.safe_add(x, t)), s), b);
    };
    MD5.md5_ff = function (a, b, c, d, x, s, t) {
        return MD5.md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };
    MD5.md5_gg = function (a, b, c, d, x, s, t) {
        return MD5.md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };
    MD5.md5_hh = function (a, b, c, d, x, s, t) {
        return MD5.md5_cmn(b ^ c ^ d, a, b, x, s, t);
    };
    MD5.md5_ii = function (a, b, c, d, x, s, t) {
        return MD5.md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    };
    MD5.safe_add = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };
    MD5.bit_rol = function (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    };
    return MD5;
}());
exports.MD5 = MD5;
//# sourceMappingURL=CurlUnit.js.map