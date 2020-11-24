"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementHelper = void 0;
var CookieUnit_1 = require("../core/CookieUnit");
var APIHelper_1 = require("./APIHelper");
var FailedMarkData_1 = require("../data/FailedMarkData");
var PassedMarkData_1 = require("../data/PassedMarkData");
var AchievementHelper = /** @class */ (function () {
    function AchievementHelper() {
        var access_token = [""];
        CookieUnit_1.CookieUnit.get("access_token", access_token);
        this.access_token = access_token[0];
    }
    AchievementHelper.prototype.get = function (school_year, semester, callback) {
        var call = new APIHelper_1.APIHelper(this.access_token).getAchievementRequest(school_year, semester);
        call.enqueue(new /** @class */ (function () {
            function class_1() {
            }
            class_1.prototype.onResponse = function (call, response, requestId) {
                if (response.code() == 200) {
                    var result = JSON.parse(response.body());
                    if (result["code"] == 200) {
                        localStorage.setItem("cache.achievement", response.body());
                        AchievementHelper.parse(response.body(), callback);
                    }
                    else {
                        callback.onFailure(-104, result["message"]);
                    }
                }
                else {
                    callback.onFailure(-105, "服务器内部出错");
                }
            };
            class_1.prototype.onFailure = function (call, exception, requestId) {
                callback.onFailure(-111, "网络请求失败", exception);
            };
            return class_1;
        }()));
    };
    AchievementHelper.parse = function (response, callback) {
        callback.onReadStart();
        var result = JSON.parse(response);
        var passed = result["passed"];
        if (passed["count"] > 0) {
            var data = passed["data"];
            for (var i = 0; i < data.length; i++) {
                var data_index = data[i];
                callback.onReadPassed(new PassedMarkData_1.PassedMarkData(data_index["name"], data_index["mark"], data_index["retake"], data_index["rebuild"], data_index["credit"]));
            }
        }
        var failed = result["failed"];
        if (failed["count"] > 0) {
            var data = failed["data"];
            for (var i = 0; i < data.length; i++) {
                var data_index = data[i];
                callback.onReadFailed(new FailedMarkData_1.FailedMarkData(data_index["name"], data_index["mark"]));
            }
        }
        callback.onReadFinish();
    };
    return AchievementHelper;
}());
exports.AchievementHelper = AchievementHelper;
//# sourceMappingURL=AchievementHelper.js.map