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
exports.Achievement = void 0;
var HtmlCompatActivity_1 = require("./core/HtmlCompatActivity");
var AchievementHelper_1 = require("./helper/AchievementHelper");
var SharedPreferences_1 = require("./core/SharedPreferences");
var Achievement = /** @class */ (function (_super) {
    __extends(Achievement, _super);
    function Achievement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.passed_count = 0;
        _this.failed_count = 0;
        return _this;
    }
    Achievement.prototype.onCreate = function () {
        var achievement = localStorage.getItem("cache.achievement");
        if (achievement != null) {
            AchievementHelper_1.AchievementHelper.parse(achievement, this);
        }
        else {
            this.getAchievement();
        }
    };
    Achievement.prototype.getAchievement = function () {
        var sp = SharedPreferences_1.SharedPreferences.getInterface("user");
        var school_year = sp.getString("school_year", "");
        var semester = sp.getNumber("semester", 0);
        new AchievementHelper_1.AchievementHelper().get(school_year, semester, this);
    };
    Achievement.prototype.onFailure = function (code, message, e) {
        // @ts-ignore
        mdui.snackbar({
            message: '课表获取失败，' + message + '(' + code.toString() + ')'
        });
    };
    Achievement.prototype.onReadFailed = function (data) {
        var failed = document.getElementById("achieve-failed-content");
        var failed_item = document.createElement('div');
        failed_item.classList.add('table-content', 'achieve-passed-column');
        var content_item = document.createElement('p');
        content_item.classList.add('table-item-title');
        content_item.textContent = data.name;
        failed_item.appendChild(content_item);
        content_item.classList.remove('table-item-title');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.mark;
        failed_item.appendChild(content_item);
        failed.appendChild(failed_item);
        this.failed_count++;
    };
    Achievement.prototype.onReadFinish = function () {
        Achievement.setVisibility(document.getElementById("achieve-passed-empty"), this.passed_count == 0);
        Achievement.setVisibility(document.getElementById("achieve-failed-empty"), this.failed_count == 0);
    };
    Achievement.prototype.onReadPassed = function (data) {
        var passed = document.getElementById("achieve-passed-content");
        var passed_item = document.createElement('div');
        passed_item.classList.add('table-content', 'achieve-passed-column', 'achieve-item');
        var content_item = document.createElement('p');
        content_item.classList.add('table-item-title');
        content_item.textContent = data.name;
        passed_item.appendChild(content_item);
        content_item.classList.remove('table-item-title');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.mark;
        passed_item.appendChild(content_item);
        content_item.textContent = data.retake;
        passed_item.appendChild(content_item);
        content_item.textContent = data.rebuild;
        passed_item.appendChild(content_item);
        content_item.textContent = data.credit;
        passed_item.appendChild(content_item);
        passed.appendChild(passed_item);
        this.passed_count++;
    };
    Achievement.prototype.onReadStart = function () {
        this.passed_count = 0;
        this.failed_count = 0;
        var items_passed = document
            .getElementsByClassName("achieve-item");
        for (var i = 0; i < items_passed.length; i++) {
            items_passed.item(i).remove();
        }
    };
    return Achievement;
}(HtmlCompatActivity_1.HtmlCompatActivity));
exports.Achievement = Achievement;
//# sourceMappingURL=Achievement.js.map