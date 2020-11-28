import {CookieUnit} from "./core/CookieUnit";
import {LoginCallback, LoginHelper, SpringboardCallback} from "./helper/LoginHelper";
import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "./core/CurlUnit";
import {SharedPreferences} from "./core/SharedPreferences";
import {APIHelper} from "./helper/APIHelper";
import {Map} from "./core/Map";
import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {Home} from "./Home";
import {Exam} from "./Exam";
import {Login} from "./Login";
import {Achievement} from "./Achievement";

export class Controller {
    public static drawer_index_now: number = -1;
    public static total_count = 3;
    public static is_finished: boolean[] = [];
    public static is_login: boolean = true;

    public static readonly Login: Login = new Login();
    public static readonly Home: Home = new Home();
    public static readonly Achievement: Achievement = new Achievement();
    public static readonly Exam: Exam = new Exam();

    public static setup() {
        document.getElementById("login-button").onclick = function() {
            onLoginAction();
        }
        document.getElementById("clear-cache").onclick = function() {
            clearCache();
        }
        document.getElementById("mine-logout").onclick = function() {
            logout();
        }
        document.getElementById("login-jump-button").onclick = function() {
            window.open('http://218.6.163.95:18080/zfca?yhlx=student&login=0122579031373493708&url=xs_main.aspx');
        }
        document.getElementById("jump-button").onclick = function() {
            springboard();
        }
        document.getElementById("achieve-inquire").onclick = function() {
            onAchieveInquire();
        }
        const pages: HTMLCollectionOf<Element> = document
            .getElementsByClassName("drawer-list");
        for (let i = 0; i < pages.length; i++) {
            pages.item(i).addEventListener("click", function () {
                onDrawerListItemClick(i);
            })
        }
    }

    public static finish(value: boolean): void {
        Controller.is_finished.push(value);
        if (Controller.is_finished.length >= Controller.total_count){
            let page: Element;
            if (Controller.is_login){
                let finished = true;
                this.is_finished.forEach(function (value, index, array) {
                    finished = finished && value;
                })
                if (finished){
                    onDrawerListItemClick(0);
                } else {
                    // @ts-ignore
                    mdui.snackbar({
                        message: '网页初始化失败，请尝试刷新网页'
                    })
                }
                onDrawerListItemClick(0);
                page = document.getElementById("index-fragment");
            } else {
                page = document.getElementById("login-fragment");
            }
            HtmlCompatActivity.setVisibility(document
                .getElementById("welcome-fragment"), false);
            HtmlCompatActivity.setVisibility(page, true);
        }
    }
}

export function onDrawerListItemClick(index: number): void {
    const activity_list: any[] = [Controller.Home, Controller.Achievement, Controller.Exam];
    if (index < 3){
        activity_list[index].onCreate();
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
            try {
                const result = JSON.parse(response.body());
                SharedPreferences.getInterface("user").edit()
                    .putString("sentence", result["string"])
                    .putString("from", result["from"])
                    .apply();
                Controller.finish(true);
            } catch (e){
                Controller.finish(false);
            }
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
            Controller.total_count = 4;
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

export function onLoginAction(){
    Controller.Login.onLoginAction();
}

export function onAchieveInquire(){
    Controller.Achievement.getAchievement();
}

export function onExamInquire(){
    Controller.Exam.getExam();
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

export function springboard(): void {
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
    Controller.setup();

    getSentence();
    getWeek();
    checkLogin();
}