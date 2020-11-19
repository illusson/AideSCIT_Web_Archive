import {ExamData} from "../data/ExamData";
import {CurlResponse, CurlToolException} from "../core/CurlUnit";

export class ExamHelper {
    private readonly access_token: string;

    constructor(access_token: string) {
        this.access_token = access_token;
    }

    public getExamInfo(callback: ExamCallback){

    }

    private static parse(response: any, callback: ExamCallback) {

    }
}

export interface ExamCallback {
    onFailure(code: number, message?: string, e?: CurlToolException)
    onReadStart();
    onReadData(data: ExamData);
    onReadFinish();
}