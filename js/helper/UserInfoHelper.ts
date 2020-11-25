import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "../core/CurlUnit";
import {APIHelper} from "./APIHelper";
import {CookieUnit} from "../core/CookieUnit";

export class UserInfoHelper {
    private readonly access_token: string;

    constructor() {
        let access_token: string[] = [""];
        CookieUnit.get("access_token", access_token)
        this.access_token = access_token[0];
    }

    public getUserInfo(callback: UserInfoCallback){
        const call = new APIHelper(this.access_token).getInfoRequest();
        call.enqueue(new class implements CurlCallback {
            onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
                callback.onFailure(-301, "网络请求失败", exception)
            }

            onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
                if (response.code() == 200){
                    const result: any = JSON.parse(response.body());
                    if (result["code"] == 200){
                        const info = result["info"];
                        callback.onResult(info["name"], info["faculty"],
                            info["specialty"], info["class"], info["grade"])
                    } else {
                        callback.onFailure(-304, result["message"]);
                    }
                } else {
                    callback.onFailure(-305, "服务器内部出错");
                }
            }
        })
    }
}

export interface UserInfoCallback {
    onFailure(code: number, message?: string, e?: CurlToolException)
    onResult(name: string, faculty: string, specialty: string, userClass: string, grade: number);
}