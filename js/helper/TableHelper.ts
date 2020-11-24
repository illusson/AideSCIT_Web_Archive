import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "../core/CurlUnit";
import {TableData} from "../data/TableData";
import {APIHelper} from "./APIHelper";
import {CookieUnit} from "../core/CookieUnit";

export class TableHelper {
    private readonly access_token: string;
    private readonly week: number;

    constructor(week: number) {
        let access_token: string[] = [""];
        CookieUnit.get("access_token", access_token)
        this.access_token = access_token[0];
        this.week = week;
    }

    public getTable(school_year: string, semester: number, callback: TableCallback) {
        const this_TableHelper = this;
        const call = new APIHelper(this.access_token).getTableRequest(school_year, semester);
        call.enqueue(new class implements CurlCallback {
            onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
                callback.onFailure(-401, "网络请求失败", exception)
            }

            onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
                if (response.code() == 200){
                    const result = JSON.parse(response.body());
                    if (result["code"] == 200){
                        TableHelper.parse(response, this_TableHelper.week, callback);
                    } else {
                        callback.onFailure(-404, result["message"]);
                    }
                } else {
                    callback.onFailure(-405, "服务器内部出错");
                }
            }
        })
    }

    private static parse(response: CurlResponse, week: number, callback: TableCallback) {
        callback.onReadStart();
        let isEmpty = 0;
        const result: any = JSON.parse(response.body());
        const tableObject = result["table"];
        for (let dayIndex = 0; dayIndex < tableObject.length; dayIndex++){
            const dayObject: any = tableObject[dayIndex];
            for (let classIndex = 0; classIndex < dayObject.length; classIndex++){
                const classObject: any = dayObject[classIndex];
                const classCount: number = classObject["count"];
                if (classCount > 0){
                    const indexArray: any = classObject["data"];
                    for (let index = 0; index < classCount; index++){
                        const indexObject: any = indexArray[index];
                        const rangeObject: number[] = indexObject["range"];
                        let rangeJudge: boolean = false;
                        for (let indexRange = 0; indexRange < rangeObject.length; indexRange++){
                            rangeJudge = rangeJudge || (rangeObject[indexRange] == week);
                        }
                        if (rangeJudge){
                            const day_column = dayIndex + 1;
                            const class_column = classIndex + parseInt((classIndex / 2).toString()) + 1;
                            callback.onRead(day_column, class_column, new TableData(
                                indexObject["name"],
                                indexObject["teacher"],
                                indexObject["room"]
                            ));
                            isEmpty++;
                        }
                    }
                    continue;
                }
                callback.onRead(dayIndex, classIndex);
            }
        }
        callback.onReadFinish(isEmpty == 0);
    }
}

export interface TableCallback {
    onFailure(code: number, message: string, e?: CurlToolException);
    onReadStart();
    onRead(dayIndex: number, classIndex: number, data?: TableData);
    onReadFinish(isEmpty: Boolean);
}