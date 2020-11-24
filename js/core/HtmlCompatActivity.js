"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlCompatActivity = void 0;
var HtmlCompatActivity = /** @class */ (function () {
    function HtmlCompatActivity() {
    }
    HtmlCompatActivity.prototype.onFinish = function () {
    };
    HtmlCompatActivity.setVisibility = function (element, visible) {
        if (visible) {
            element.setAttribute("style", "display: none;");
        }
        else if (element.hasAttribute("style")) {
            element.removeAttribute("style");
        }
    };
    return HtmlCompatActivity;
}());
exports.HtmlCompatActivity = HtmlCompatActivity;
//# sourceMappingURL=HtmlCompatActivity.js.map