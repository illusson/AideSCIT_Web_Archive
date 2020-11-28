import {CookieUnit} from "../core/CookieUnit";
import {APIHelper} from "./APIHelper";
import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "../core/CurlUnit";
import {FailedMarkData} from "../data/FailedMarkData";
import {PassedMarkData} from "../data/PassedMarkData";

export class AchievementHelper {
    private readonly access_token: string;

    constructor() {
        let access_token: string[] = [""];
        CookieUnit.get("access_token", access_token)
        this.access_token = access_token[0];
    }

    public get(school_year: string, semester: number, callback: AchievementCallback){
        const call: CurlCall = new APIHelper(this.access_token).getAchievementCall(school_year, semester);
        call.enqueue(new class implements CurlCallback {
            onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
                if (response.code() == 200){
                    const result = JSON.parse(response.body());
                    if (result["code"] == 200){
                        localStorage.setItem("cache.achievement", response.body());
                        AchievementHelper.parse(response.body(), callback);
                    } else {
                        callback.onFailure(-104, result["message"]);
                    }
                } else {
                    callback.onFailure(-105, "服务器内部出错");
                }
            }

            onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
                callback.onFailure(-111, "网络请求失败", exception)
            }
        })
    }

    public static parse(response: string, callback: AchievementCallback){
        callback.onReadStart();
        const result: any = JSON.parse(response);
        const passed: any = result["passed"];
        if (passed["count"] > 0){
            const data: any = passed["data"];
            for (let i = 0; i < data.length; i++){
                const data_index = data[i];
                callback.onReadPassed(new PassedMarkData(
                    data_index["name"],
                    data_index["mark"],
                    data_index["retake"],
                    data_index["rebuild"],
                    data_index["credit"]
                ))
            }
        }
        const failed: any = result["failed"];
        if (failed["count"] > 0){
            const data: any = failed["data"];
            for (let i = 0; i < data.length; i++){
                const data_index = data[i];
                callback.onReadFailed(new FailedMarkData(
                    data_index["name"],
                    data_index["mark"]
                ))
            }
        }
        callback.onReadFinish()
    }
}

export interface AchievementCallback {
    onFailure(code: number, message?: string, e?: CurlToolException)
    onReadStart()
    onReadPassed(data: PassedMarkData)
    onReadFailed(data: FailedMarkData)
    onReadFinish()
}