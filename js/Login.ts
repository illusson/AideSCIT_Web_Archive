import {CurlToolException} from "./core/CurlUnit";
import {LoginCallback, LoginHelper} from "./helper/LoginHelper";
import {SharedPreferences} from "./core/SharedPreferences";

export function onLoginAction() {
    const username: HTMLElement = document.getElementById("login-username");
    const password: HTMLElement = document.getElementById("login-password");

    const error: HTMLElement = document.getElementById("login-error");
    error.nodeValue = "test";

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
    SharedPreferences.getInterface("user").edit()
        .putString("access_token", access)
        .putString("refresh_token", refresh)
        .apply();
}

function onLoginFailed(code: number, message: string){
    const error: HTMLElement = document.getElementById("login-error");
    error.innerText = message + " (" + code + ")";
}

export function jumpToSCITEdu(){
    window.open("http://218.6.163.95:8081/");
}