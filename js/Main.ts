import {CookieUnit} from "./core/CookieUnit";
import {LoginCallback, LoginHelper} from "./helper/LoginHelper";
import {CurlCall, CurlCallback, CurlResponse, CurlToolException} from "./core/CurlUnit";
import {SharedPreferences} from "./core/SharedPreferences";
import {APIHelper} from "./helper/APIHelper";
import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {Home} from "./Home";
import {Exam} from "./Exam";
import {Login} from "./Login";
import {Achievement} from "./Achievement";
import {Mine} from "./Mine";
import {About} from "./About";
import {Log} from "./core/Log";

export class Controller {
    public static drawer_index_now: number = -1;
    public static total_count = 3;
    public static is_finished: boolean[] = [];
    public static is_login: boolean = true;

    public static readonly Login: Login = new Login();
    public static readonly Home: Home = new Home();
    public static readonly Achievement: Achievement = new Achievement();
    public static readonly Exam: Exam = new Exam();
    public static readonly Mine: Mine = new Mine();
    public static readonly About: About = new About();

    public static setup() {
        const ua = navigator.userAgent;
        if (ua.indexOf("yiban_android") == -1 && !APIHelper.debug){
            window.location.href = "https://tool.eclass.sgpublic.xyz/"
        } else {
            document.getElementById("login-button").onclick = function() {
                Controller.Login.onLoginAction();
            }
            document.getElementById("clear-cache").onclick = function() {
                Controller.About.clearCache();
            }
            document.getElementById("mine-logout").onclick = function() {
                Controller.Mine.logout();
            }
            document.getElementById("login-jump-button").onclick = function() {
                window.open('http://218.6.163.95:18080/zfca?yhlx=student&login=0122579031373493708&url=xs_main.aspx');
            }
            document.getElementById("jump-button").onclick = function() {
                Controller.Mine.springboard();
            }
            document.getElementById("achieve-inquire").onclick = function() {
                Controller.Achievement.getAchievement();
            }
            const pages: HTMLCollectionOf<Element> = document
                .getElementsByClassName("drawer-list");
            for (let i = 0; i < pages.length; i++) {
                pages.item(i).addEventListener("click", function () {
                    onDrawerListItemClick(i);
                })
            }
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
                    return;
                }
                page = document.getElementById("index-fragment");
            } else {
                page = document.getElementById("login-fragment");
            }
            HtmlCompatActivity.setVisibility(document
                .getElementById("welcome-fragment"), false);
            HtmlCompatActivity.setVisibility(page, true);
        }
    }

    public static getActivity(id: number){
        switch (id) {
            case 0:
                return Controller.Home;
            case 1:
                return Controller.Achievement;
            case 2:
                return Controller.Exam;
            case 3:
                return Controller.Mine;
            default:
                return Controller.About;
        }
    }
}

function onDrawerListItemClick(index: number): void {
    Controller.getActivity(index).onCreate();

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
    new APIHelper().getDayCall().enqueue(new class implements CurlCallback {
        onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
            Log.e("getWeek.onFailure()", exception.message);
            Controller.finish(false);
        }

        onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
            if (response.code() == 200){
                const result = JSON.parse(response.body());
                if (result["code"] == 0){
                    let day_count: number = 0;
                    if (result['direct'] == '+'){
                        day_count = result['day_count'];
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
                    }
                    SharedPreferences.getInterface('user').edit()
                        .putNumber("week", day_count)
                        .putNumber("semester", result['semester'])
                        .putString("school_year", result['school_year'])
                        .apply();
                    Controller.finish(true);
                    return;
                }
            }
            Log.e("getWeek.onResponse()", response.code().toString());
            Controller.finish(false);
        }
    })
}

function getSentence(): void {
    const access: string = CookieUnit.get("access_token");
    new APIHelper(access).getSentenceCall().enqueue(new class implements CurlCallback {
        onFailure(call: CurlCall, exception: CurlToolException, requestId: number) {
            Log.e("getSentence.onFailure()", exception.message);
            Controller.finish(false);
        }

        onResponse(call: CurlCall, response: CurlResponse, requestId: number) {
            try {
                const result = JSON.parse(response.body());
                SharedPreferences.getInterface("user").edit()
                    .putString("sentence", result["string"])
                    .putString("from", result["from"])
                    .apply();
            } catch (e){
                Log.e("getSentence.onResponse()", e.message);
            }
            Controller.finish(true);
        }
    })
}

function checkLogin(): void {
    const sp: SharedPreferences = SharedPreferences.getInterface("user");
    let access: string = CookieUnit.get("access_token");
    if (access != null){
        const expire = sp.getNumber("token_expired", 0);
        if (expire < APIHelper.getTS()){
            Controller.total_count = 4;
            const refresh: string = CookieUnit.get("refresh_token");
            new LoginHelper().refreshToken(access, refresh, new class implements LoginCallback {
                onResult(access: string, refresh: string) {
                    Login.onLoginResult(access, refresh);
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

window.onload = function() {
    Controller.setup();

    getSentence();
    getWeek();
    checkLogin();
}