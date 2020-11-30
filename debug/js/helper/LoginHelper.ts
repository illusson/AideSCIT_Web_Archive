import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "../core/CurlUnit";
import {APIHelper} from "./APIHelper";
import {RSAStaticUnit} from "../core/RSAStaticUnit";

export class LoginHelper {
    public login(username: string, password: string, callback: LoginCallback) {
        const password_encrypted: string = RSAStaticUnit.encrypted(password);
        const call: CurlCall = new APIHelper().getLoginCall(username, password_encrypted);
        call.enqueue(new class implements CurlCallback {
            onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
                callback.onFailure(-101, "网络请求失败", exception)
            }

            onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
                LoginHelper.parse(response, callback)
            }
        })
    }

    public springboard(access: string, callback: SpringboardCallback){
        const call = new APIHelper(access).getSpringboardCall()
        call.enqueue(new class implements CurlCallback {
            onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
                callback.onFailure(-101, "网络请求失败", exception)
            }

            onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
                if (response.code() == 200){
                    const result = JSON.parse(response.body());
                    if (result["code"] == 200){
                        callback.onResult(result["location"]);
                    } else {
                        callback.onFailure(-114, result["message"]);
                    }
                } else {
                    callback.onFailure(-115, "服务器内部出错");
                }
            }
        })
    }

    public refreshToken(access_token: string, refresh_token: string, callback: LoginCallback){
        const call = new APIHelper(access_token, refresh_token).getRefreshTokenCall();
        call.enqueue(new class implements CurlCallback {
            onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
                callback.onFailure(-111, "网络请求失败", exception)
            }

            onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
                LoginHelper.parse(response, callback)
            }
        })
    }

    private static parse(response: CurlResponse, callback: LoginCallback) {
        if (response.code() == 200){
            const result = JSON.parse(response.body());
            if (result["code"] == 200){
                callback.onResult(result["access_token"], result["refresh_token"]);
            } else {
                callback.onFailure(-104, result["message"]);
            }
        } else {
            callback.onFailure(-105, "服务器内部出错");
        }
    }
}

export interface LoginCallback {
    onFailure(code: number, message?: string, e?: CurlToolException)
    onResult(access: string, refresh: string)
}

export interface SpringboardCallback {
    onFailure(code: number, message?: string, e?: CurlToolException)
    onResult(location: string)
}