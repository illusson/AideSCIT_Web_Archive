"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exam = void 0;
var HtmlCompatActivity_1 = require("./core/HtmlCompatActivity");
var ExamHelper_1 = require("./helper/ExamHelper");
var Exam = /** @class */ (function (_super) {
    __extends(Exam, _super);
    function Exam() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Exam.prototype.onCreate = function () {
        var exam = localStorage.getItem("cache.exam");
        if (exam != null) {
            ExamHelper_1.ExamHelper.parse(exam, this);
        }
        else {
            this.getExam();
        }
    };
    Exam.prototype.getExam = function () {
        new ExamHelper_1.ExamHelper().getExamInfo(this);
    };
    Exam.prototype.onReadStart = function () {
        var items = document
            .getElementsByClassName("exam-item");
        for (var i = 0; i < items.length; i++) {
            items.item(i).remove();
        }
    };
    Exam.prototype.onFailure = function (code, message, e) {
        // @ts-ignore
        mdui.snackbar({
            message: '考试座位安排获取失败，' + message + '(' + code.toString() + ')'
        });
    };
    Exam.prototype.onReadData = function (data) {
        var exam = document.getElementById("exam-content");
        var exam_item = document.createElement('div');
        exam_item.classList.add('table-content', 'exam-column', 'exam-item');
        var content_item = document.createElement('p');
        content_item.classList.add('table-item-title');
        content_item.textContent = data.name;
        exam_item.appendChild(content_item);
        content_item.classList.remove('table-item-title');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.time;
        exam_item.appendChild(content_item);
        content_item.textContent = data.location;
        exam_item.appendChild(content_item);
        content_item.textContent = data.set;
        exam_item.appendChild(content_item);
        exam.appendChild(exam_item);
    };
    Exam.prototype.onReadFinish = function (isEmpty) {
        Exam.setVisibility(document.getElementById("exam-empty"), isEmpty);
    };
    return Exam;
}(HtmlCompatActivity_1.HtmlCompatActivity));
exports.Exam = Exam;
//# sourceMappingURL=Exam.js.map