import {ExamData} from "../data/ExamData";
import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "../core/CurlUnit";
import {APIHelper} from "./APIHelper";

export class ExamHelper {
    private readonly access_token: string;

    constructor(access_token: string) {
        this.access_token = access_token;
    }

    public getExamInfo(callback: ExamCallback){
        const call = new APIHelper(this.access_token).getExamRequest();
        call.enqueue(new class implements CurlCallback {
            onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
                callback.onFailure(-111, "网络请求失败", exception)
            }

            onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
                if (response.code() == 200){
                    const result = JSON.parse(response.body());
                    if (result["code"] == 200){
                        ExamHelper.parse(response, callback);
                    } else {
                        callback.onFailure(-104, result["message"]);
                    }
                } else {
                    callback.onFailure(-105, "服务器内部出错");
                }
            }
        })
    }

    private static parse(response: any, callback: ExamCallback) {
        callback.onReadStart();
        const result: any = JSON.parse(response.body());
        const examObject: any = result["exam"];
        if (result["count"] > 0){
            for (let index = 0; index < examObject.length; index++) {
                const examData: any = examObject[index];
                callback.onReadData(new ExamData(
                    examData["name"], examData["time"], examData["location"], examData["sit_num"]
                ))
            }
        }
        callback.onReadFinish();
    }
}

export interface ExamCallback {
    onFailure(code: number, message?: string, e?: CurlToolException)
    onReadStart();
    onReadData(data: ExamData);
    onReadFinish();
}