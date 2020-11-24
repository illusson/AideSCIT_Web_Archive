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
exports.Home = void 0;
var SharedPreferences_1 = require("./core/SharedPreferences");
var TableHelper_1 = require("./helper/TableHelper");
var HtmlCompatActivity_1 = require("./core/HtmlCompatActivity");
var Home = /** @class */ (function (_super) {
    __extends(Home, _super);
    function Home() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Home.prototype.onCreate = function () {
        document.getElementById("home-welcome").textContent = Home.getHeaderInfo();
        document.getElementById("home-soup-content").textContent = Home.getSentenceString();
        document.getElementById("home-soup-author").textContent = Home.getSentenceFrom();
        var sp = SharedPreferences_1.SharedPreferences.getInterface("user");
        this.week = sp.getNumber("week", 0);
        var table = localStorage.getItem("cache.table");
        if (table != null) {
            TableHelper_1.TableHelper.parse(table, this.week, this);
        }
        else {
            this.getTable();
        }
    };
    Home.prototype.getTable = function () {
        var sp = SharedPreferences_1.SharedPreferences.getInterface("user");
        var school_year = sp.getString("school_year", "");
        var semester = sp.getNumber("semester", 0);
        var helper = new TableHelper_1.TableHelper(this.week);
        helper.getTable(school_year, semester, this);
    };
    Home.getHeaderInfo = function () {
        var week = SharedPreferences_1.SharedPreferences.getInterface("user").getNumber("week", 0);
        var time;
        var hours = new Date().getHours();
        if (hours < 8) {
            time = "早上";
        }
        else if (hours < 11) {
            time = "上午";
        }
        else if (hours < 13) {
            time = "中午";
        }
        else if (hours < 18) {
            time = "下午";
        }
        else {
            time = "晚上";
        }
        if (week == 0) {
            return time + "好，祝你假期快乐~";
        }
        else {
            var day = ["日", "一", "二", "三", "四", "五", "六"][new Date().getDay()];
            return time + "好，今天是第" + week.toString() + "周星期" + day;
        }
    };
    Home.getSentenceString = function () {
        return SharedPreferences_1.SharedPreferences.getInterface("user")
            .getString("string", "");
    };
    Home.getSentenceFrom = function () {
        return SharedPreferences_1.SharedPreferences.getInterface("user")
            .getString("from", "");
    };
    Home.prototype.onFailure = function (code, message, e) {
        // @ts-ignore
        mdui.snackbar({
            message: '课表获取失败，' + message + '(' + code.toString() + ')'
        });
    };
    Home.prototype.onRead = function (dayIndex, classIndex, data) {
        if (data != null) {
            var table = document.getElementById("schedule-content");
            var schedule_item = document.createElement('div');
            schedule_item.setAttribute("style", "grid-column: " + dayIndex + "; grid-row: " + classIndex + ";");
            schedule_item.classList.add('schedule-item', 'mdui-card', 'mdui-ripple');
            var table_item = document.createElement('div');
            table_item.classList.add('mdui-cars-content', 'table-item-title');
            table_item.textContent = data.name;
            schedule_item.appendChild(table_item);
            table_item.classList.remove('table-item-title');
            table_item.classList.add('table-item-content');
            table_item.textContent = data.room;
            schedule_item.appendChild(table_item);
            table_item.textContent = data.teacher;
            schedule_item.appendChild(table_item);
            table.appendChild(schedule_item);
        }
    };
    Home.prototype.onReadFinish = function (isEmpty) {
        Home.setVisibility(document.getElementById("schedule-item-base"), !isEmpty);
        Home.setVisibility(document.getElementById("schedule-empty"), isEmpty);
    };
    Home.prototype.onReadStart = function () {
        var items = document
            .getElementsByClassName("schedule-item-base");
        for (var i = 0; i < items.length; i++) {
            items.item(i).remove();
        }
    };
    return Home;
}(HtmlCompatActivity_1.HtmlCompatActivity));
exports.Home = Home;
//# sourceMappingURL=Home.js.map