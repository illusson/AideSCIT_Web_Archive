import {CookieUnit} from "./core/CookieUnit";
import {LoginCallback, LoginHelper, SpringboardCallback} from "./helper/LoginHelper";
import {CurlToolException} from "./core/CurlUnit";
import {TableCallback, TableHelper} from "./helper/TableHelper";
import {SharedPreferences} from "./core/SharedPreferences";
import {TableData} from "./data/TableData";
import {APIHelper} from "./helper/APIHelper";

class Controller {
    public static drawer_index_now: number = 1;
    public static is_finished: boolean[] = [];

    public static finish(value: boolean){
        this.is_finished.push(value);
    }
}

export function onDrawerListItemClick(index: number): void {
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
            active_item.setAttribute("style", "display: none;")
        }
        let active_item: Element = page_list.item(index);
        if (active_item.hasAttribute("style")) {
            active_item.removeAttribute("style");
        }
    }
    Controller.drawer_index_now = index;
}

export function getHeaderInfo(): void {

}

export function onLoginAction() {
    const username: HTMLElement = document.getElementById("login-username");
    const password: HTMLElement = document.getElementById("login-password");

    const error: HTMLElement = document.getElementById("login-error");
    error.textContent = "test";

    new LoginHelper().login(username.nodeValue, password.nodeValue, new class implements LoginCallback {
        onFailure(code: number, message: string, e: CurlToolException) {
            onLoginFailed(code, message);
        }

        onResult(access: string, refresh: string) {
            onLoginResult(access, refresh)
        }
    })
}

function onLoginResult(access: string, refresh: string){
    CookieUnit.set("access_token", access);
    CookieUnit.set("refresh_token", refresh);
}

function onLoginFailed(code: number, message: string){
    const error: HTMLElement = document.getElementById("login-error");
    error.innerText = message + " (" + code + ")";
}

export function checkLogin(): boolean {
    const sp: SharedPreferences = SharedPreferences.getInterface("user");
    let access: string[] = [];
    CookieUnit.get("access_token", access);
    if (access != null){
        const expire = sp.getNumber("token_expired", 0);
        if (expire < APIHelper.getTS()){
            const refresh = sp.getString("refresh_token", "");
            new LoginHelper().refreshToken(access[0], refresh, new class implements LoginCallback {
                onResult(access: string, refresh: string) {
                    onLoginResult(access, refresh);
                }

                onFailure(code: number, message?: string, e?: CurlToolException) {
                    mdui.snackbar({
                        message: '登录状态失效，请重新登录'
                    })
                }
            })
        }
    } else {
        return false;
    }
}

export function getTable(): void {
    const sp = SharedPreferences.getInterface("user");
    const week: number = sp.getNumber("week", 0)
    const school_year: string = sp.getString("school_year", "")
    const semester: number = sp.getNumber("semester", 0)
    const helper = new TableHelper(week)
    helper.getTable(school_year, semester, new class implements TableCallback {
        onFailure(code: number, message: string, e?: CurlToolException) {
            mdui.snackbar({
                message: '课表获取失败，' + message + '(' + code.toString() + ')'
            })
        }

        onReadStart() {
            const items: HTMLCollectionOf<Element> = document
                .getElementsByClassName("schedule-item-base");
            for (let i: number = 0; i < items.length; i++){
                items.item(i).remove();
            }
        }

        onRead(dayIndex: number, classIndex: number, data?: TableData) {
            if (data != null){
                const table: Element = document.getElementById("schedule-content");

                const schedule_item: Element = document.createElement('div');
                schedule_item.setAttribute(
                    "style",
                    "grid-column: "+dayIndex+"; grid-row: "+classIndex+";"
                )
                schedule_item.classList.add('schedule-item', 'mdui-card', 'mdui-ripple');
                const table_item: Element = document.createElement('div');
                table_item.id = 'table-item-title';
                table_item.classList.add('mdui-cars-content', 'table-item-title');
                table_item.textContent = data.name;
                schedule_item.appendChild(table_item);

                table_item.id = 'table-item-room';
                table_item.classList.remove('table-item-title');
                table_item.classList.add('table-item-content');
                table_item.textContent = data.room;
                schedule_item.appendChild(table_item);

                table_item.id = 'table-item-teacher';
                table_item.textContent = data.teacher;
                schedule_item.appendChild(table_item);

                table.appendChild(schedule_item);
            }
        }

        onReadFinish(isEmpty: Boolean) {

        }
    })
}

export function logout(): void {
    CookieUnit.remove("access_token");
    CookieUnit.remove("refresh_token");
}

export function clearCache(): void {
    localStorage.clear()
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