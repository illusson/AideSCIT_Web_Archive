import {CookieUnit} from "./core/CookieUnit";
import {LoginCallback, LoginHelper, SpringboardCallback} from "./helper/LoginHelper";
import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "./core/CurlUnit";
import {SharedPreferences} from "./core/SharedPreferences";
import {APIHelper} from "./helper/APIHelper";
import {ExamHelper} from "./helper/ExamHelper";
import {AchievementHelper} from "./helper/AchievementHelper";
import {Map} from "./core/Map";
import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {Home} from "./Home";
import {Exam} from "./Exam";
import {Login} from "./Login";
import {Achievement} from "./Achievement";

export class Controller {
    public static drawer_index_now: number = -1;
    private static readonly total_count = 3;
    public static is_finished: boolean[] = [];
    public static is_login: boolean = true;

    private static activities: Map<string, HtmlCompatActivity> = new Map<string, HtmlCompatActivity>();

    public static setup() {
        Controller.activities.set("Home", new Home());
        Controller.activities.set("Exam", new Exam());
        Controller.activities.set("Login", new Login());
        Controller.activities.set("Achievement", new Achievement());
    }

    public static getActivity(key: string): HtmlCompatActivity {
        if (this.activities.has(key)){
            return this.activities.get(key);
        } else {
            return new class extends HtmlCompatActivity {
                onCreate() {}
            }
        }
    }

    public static finish(value: boolean): void {
        Controller.is_finished.push(value);
        if (Controller.is_finished.length >= Controller.total_count){
            let finished = true;
            this.is_finished.forEach(function (value, index, array) {
                finished = finished && value;
            })
            if (finished){
                HtmlCompatActivity.setVisibility(document
                    .getElementById("welcome-fragment"), false);
                let page: Element;
                if (Controller.is_login){
                    onDrawerListItemClick(0);
                    page = document.getElementById("index-fragment");
                } else {
                    this.getActivity("Login").onCreate();
                    page = document.getElementById("login-fragment");
                }
                HtmlCompatActivity.setVisibility(page, true);
            } else {
                // @ts-ignore
                mdui.snackbar({
                    message: '网页初始化失败，请尝试刷新网页'
                })
            }
        }
    }
}

export function onDrawerListItemClick(index: number): void {
    const activity_list: string[] = ["Home", "Achievement", "Exam"];
    if (index < 3){
        Controller.getActivity(activity_list[index]).onCreate();
    }

    const active_list: HTMLCollectionOf<Element> = document.getElementsByClassName("mdui-list-item-active");
    for (let active_index = 0; active_index < active_list.length; active_index++){
        const active_item: Element = active_list.item(active_index);
        active_item.classList.remove("mdui-list-item-active");
    }
    const drawer_list: HTMLCollectionOf<Element> = document.getElementsByClassName("drawer-list");
    let active: Element = drawer_list.item(index);
    active.classList.add("mdui-list-item-active");
    if (index != Controller.drawer_index_now) {
        const page_list: HTMLCollectionOf<Element> = document.getElementsByClassName("index-page");
        for (let active_index = 0; active_index < page_list.length; active_index++){
            const active_item: Element = page_list.item(active_index);
            HtmlCompatActivity.setVisibility(active_item, false);
        }
        let active_item: Element = page_list.item(index);
        HtmlCompatActivity.setVisibility(active_item, true);
    }
    Controller.drawer_index_now = index;
}

function getWeek(): void {
    new APIHelper().getDayRequest().enqueue(new class implements CurlCallback {
        onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
            Controller.finish(false);
        }

        onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
            if (response.code() == 200){
                const result = JSON.parse(response.body());
                if (result["code"] == 200){
                    if (result['direct'] == '+'){
                        let day_count: number = result['day_count'];
                        if (day_count % 7 == 0){
                            day_count = day_count / 7;
                        } else {
                            day_count = day_count / 7 + 1;
                        }
                        if (day_count > 18){
                            day_count = 0;
                        } else if (day_count == 18 && new Date().getDay() == 0){
                            day_count = 0;
                        }
                        SharedPreferences.getInterface('user').edit()
                            .putNumber("week", day_count)
                            .putNumber("semester", result['semester'])
                            .putNumber("school_year", result['school_year'])
                            .apply();
                        Controller.finish(true);
                        return;
                    }
                }
            }
            Controller.finish(false);
        }
    })
}

function getSentence(): void {
    let access: string[] = [];
    CookieUnit.get("access_token", access);
    new APIHelper(access[0]).getSentenceRequest().enqueue(new class implements CurlCallback {
        onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
            Controller.finish(false);
        }

        onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
            const result = JSON.parse(response.body());
            SharedPreferences.getInterface("user").edit()
                .putString("sentence", result["string"])
                .putString("from", result["from"])
                .apply();
        }
    })
}

function checkLogin(): void {
    const sp: SharedPreferences = SharedPreferences.getInterface("user");
    let access: string[] = [];
    CookieUnit.get("access_token", access);
    if (access.length > 0){
        const expire = sp.getNumber("token_expired", 0);
        if (expire < APIHelper.getTS()){
            const refresh: string[] = [];
            CookieUnit.get("refresh_token", refresh);
            new LoginHelper().refreshToken(access[0], refresh[0], new class implements LoginCallback {
                onResult(access: string, refresh: string) {
                    CookieUnit.set("access_token", access);
                    CookieUnit.set("refresh_token", refresh);
                    Controller.finish(true);
                }

                onFailure(code: number, message?: string, e?: CurlToolException) {
                    // @ts-ignore
                    mdui.snackbar({
                        message: '登录状态失效，请重新登录'
                    })
                    Controller.is_login = false;
                    Controller.finish(false);
                }
            })
        }
    } else {
        Controller.is_login = false;
    }
    Controller.finish(true);
}

export function logout(): void {
    CookieUnit.remove("access_token");
    CookieUnit.remove("refresh_token");

    HtmlCompatActivity.setVisibility(document
        .getElementById("index-fragment"), false);
    HtmlCompatActivity.setVisibility(document
        .getElementById("login-fragment"), true);
}

export function clearCache(): void {
    localStorage.removeItem("cache.table");
    localStorage.removeItem("cache.achievement");
    localStorage.removeItem("cache.exam");
}

export function springboard(): void  {
    let access: string[] = [];
    if (CookieUnit.get("access_token", access) == 1){
        new LoginHelper().springboard(access[0], new class implements SpringboardCallback {
            onFailure(code: number, message?: string, e?: CurlToolException) {
                window.open('http://218.6.163.95:18080/zfca?yhlx=student&login=0122579031373493708&url=xs_main.aspx');
            }

            onResult(location: string) {
                window.open(location);
            }
        })
    }
}

window.onload = function() {
    getSentence();
    getWeek();
    checkLogin();
}