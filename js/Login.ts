import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {LoginCallback, LoginHelper} from "./helper/LoginHelper";
import {CookieUnit} from "./core/CookieUnit";

export class Login extends HtmlCompatActivity implements LoginCallback {
    public onCreate() {

    }

    public onLoginAction(): void {
        const username: HTMLElement = document.getElementById("login-username");
        const password: HTMLElement = document.getElementById("login-password");

        const error: HTMLElement = document.getElementById("login-error");
        error.textContent = "test";

        new LoginHelper().login(username.nodeValue, password.nodeValue, this)
    }

    onResult(access: string, refresh: string): void {
        CookieUnit.set("access_token", access);
        CookieUnit.set("refresh_token", refresh);
    }

    onFailure(code: number, message: string): void {
        const error: HTMLElement = document.getElementById("login-error");
        error.innerText = message + " (" + code + ")";
    }
}