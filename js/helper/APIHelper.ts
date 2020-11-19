import {CurlCall, CurlClientBuilder, CurlRequestBuilder, FormBodyBuilder} from "../core/CurlUnit";
import {Map, MapForEachCallback} from "../core/Map";

export class APIHelper {
    private static readonly debug: boolean = false;

    private static readonly API_HOST: String = "https://tool.eclass.sgpublic.xyz/api"
    public static readonly METHOD_GET: number = 0
    public static readonly METHOD_POST: number = 1

    private access_token: string = "";
    private refresh_token: string = "";

    constructor(access_token: string = "", refresh_token: string = "") {
        this.access_token = access_token;
        this.refresh_token = refresh_token;
    }

    public getLoginCall(username: string, password: string): CurlCall {
        const args = new Map<String, any>()
            .set("password", password)
            .set("ts", APIHelper.getTS())
            .set("username", username);
        return this.onReturn("login.php", args)
    }

    public getRefreshTokenRequest(): CurlCall {
        const url = "token.php"
        const argArray: Map<string, any> = new Map<string, any>()
            .set("access_token", this.access_token)
            .set("refresh_token", this.refresh_token)
            .set("ts", APIHelper.getTS());
        return this.onReturn(url, argArray)
    }

    public getSentenceRequest(): CurlCall {
        const url = "hitokoto.php"
        const argArray: Map<string, any> = new Map<string, any>()
            .set("access_token", this.access_token)
            .set("ts", APIHelper.getTS());
        return this.onReturn(url, argArray)
    }

    public getDayRequest(): CurlCall {
        return this.onReturn("day.php")
    }

    public getInfoRequest(): CurlCall {
        const url = "info.php"
        const argArray: Map<string, any> = new Map<string, any>()
            .set("access_token", this.access_token)
            .set("ts", APIHelper.getTS());
        return this.onReturn(url, argArray)
    }

    public getTableRequest(year: string, semester: number): CurlCall {
        const url = "table.php"
        const argArray: Map<string, any> = new Map<string, any>()
            .set("access_token", this.access_token)
            .set("semester", semester)
            .set("ts", APIHelper.getTS())
            .set("year", year);
        return this.onReturn(url, argArray)
    }

    public getExamRequest(): CurlCall {
        const url = "exam.php"
        const argArray: Map<string, any> = new Map<string, any>()
            .set("access_token", this.access_token)
            .set("ts", APIHelper.getTS());
        return this.onReturn(url, argArray)
    }

    public getAchievementRequest(year: string, semester: number): CurlCall {
        const url = "achievement.php"
        const argArray: Map<string, any> = new Map<string, any>()
            .set("access_token", this.access_token)
            .set("semester", semester)
            .set("ts", APIHelper.getTS())
            .set("year", year);
        return this.onReturn(url, argArray)
    }

    public getUpdateRequest(version: string): CurlCall {
        const url = "https://tool.eclass.sgpublic.xyz/update/index.php"
        const argArray: Map<string, any> = new Map<string, any>()
            .set("version", version);
        return this.onReturn(url, argArray, APIHelper.METHOD_GET, false)
    }

    private onReturn(url: string, argArray: Map<string, any> = null, method: number = APIHelper.METHOD_POST, withSign: Boolean = true): CurlCall {
        let url_final;
        if (url.substr(0, 4) == "http"){
            url_final = url;
        } else {
            url_final = APIHelper.API_HOST + "/" + (APIHelper.debug ? "v2" : "v1") + "/" + url;
        }
        const form_builder = new FormBodyBuilder();
        argArray.forEach(new class implements MapForEachCallback<string, any> {
            onEach(key: string, value: any, map: Map<string, any>) {
                form_builder.add(key.toString(), value);
            }
        })
        let form;
        if (withSign){
            form = form_builder.build("Vwm86Wo5JEyu0Om0uGHpp1UJbhyC1V1F");
        } else {
            form = form_builder.build();
        }

        const client = new CurlClientBuilder()
            .followLocation(false)
            .setTimeout(30)
            .build();
        const request_builder = new CurlRequestBuilder();
        if (method == APIHelper.METHOD_POST){
            request_builder.url(url_final);
            request_builder.post(form);
        } else {
            request_builder.url(url_final + "?" + form.getFormBody());
        }
        const request = request_builder.build();
        return client.newCall(request);
    }

    public static getTS(){
        return Date.parse(new Date().toTimeString()) / 1000;
    }
}