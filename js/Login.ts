import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {LoginCallback, LoginHelper} from "./helper/LoginHelper";
import {CookieUnit} from "./core/CookieUnit";
import {CurlToolException} from "./core/CurlUnit";
import {UserInfoCallback, UserInfoHelper} from "./helper/UserInfoHelper";
import {SharedPreferences} from "./core/SharedPreferences";
import {Controller} from "./Main";

export class Login extends HtmlCompatActivity implements UserInfoCallback {
    public onCreate() {

    }

    public onLoginAction(): void {
        const username: HTMLElement = document.getElementById("login-username");
        const password: HTMLElement = document.getElementById("login-password");

        const error: HTMLElement = document.getElementById("login-error");
        error.textContent = "test";

        new LoginHelper().login(username.nodeValue, password.nodeValue, new class implements LoginCallback {
            onFailure(code: number, message?: string, e?: CurlToolException) {
                // @ts-ignore
                mdui.snackbar({
                    message: '登录失败，' + message + '(' + code.toString() + ')'
                })
            }

            onResult(access: string, refresh: string) {
                CookieUnit.set("access_token", access);
                CookieUnit.set("refresh_token", refresh);

                new UserInfoHelper().getUserInfo(this);
            }
        })
    }

    onFailure(code: number, message?: string, e?: CurlToolException) {
        // @ts-ignore
        mdui.snackbar({
            message: '用户信息获取失败，' + message + '(' + code.toString() + ')'
        })
    }

    onResult(name: string, faculty: string, specialty: string, userClass: string, grade: number) {
        SharedPreferences.getInterface("user").edit()
            .putString("name", name)
            .putString("faculty", faculty)
            .putString("specialty", specialty)
            .putString("userClass", userClass)
            .putNumber("grade", grade)
            .apply();

        Controller.getActivity("Home").onCreate();
        HtmlCompatActivity.setVisibility(document
            .getElementById("index-fragment"), true);
        HtmlCompatActivity.setVisibility(document
            .getElementById("login-fragment"), false);
    }
}