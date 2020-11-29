import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {LoginCallback, LoginHelper} from "./helper/LoginHelper";
import {CookieUnit} from "./core/CookieUnit";
import {CurlToolException} from "./core/CurlUnit";
import {UserInfoCallback, UserInfoHelper} from "./helper/UserInfoHelper";
import {SharedPreferences} from "./core/SharedPreferences";
import {Controller} from "./Main";
import {APIHelper} from "./helper/APIHelper";

export class Login extends HtmlCompatActivity implements UserInfoCallback {
    public onCreate() {

    }

    public onLoginAction(): void {
        const username: HTMLInputElement = document.getElementById("login-username") as HTMLInputElement;
        const password: HTMLInputElement = document.getElementById("login-password") as HTMLInputElement;

        if (username.value == "" || password.value == ""){
            // @ts-ignore
            mdui.snackbar({
                message: '账号或密码为空'
            })
        } else {
            const this_Login: Login = this;
            new LoginHelper().login(username.value, password.value, new class implements LoginCallback {
                onFailure(code: number, message?: string, e?: CurlToolException) {
                    // @ts-ignore
                    mdui.snackbar({
                        message: '登录失败，' + message + '(' + code.toString() + ')'
                    })
                }

                onResult(access: string, refresh: string) {
                    Login.onLoginResult(access, refresh);

                    new UserInfoHelper().getUserInfo(this_Login);
                }
            })
        }
    }

    static onLoginResult(access: string, refresh: string){
        const date_1 = new Date();
        date_1.setDate(date_1.getDate() + 30);
        SharedPreferences.getInterface("user").edit()
            .putNumber("token_expired", APIHelper.getTS() + 2592000)
            .apply();

        CookieUnit.set("access_token", access, date_1, "/");

        const date_2 = new Date();
        date_2.setFullYear(date_2.getFullYear() + 4);
        CookieUnit.set("refresh_token", refresh, date_2, "/");
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

        Controller.Home.onCreate();
        HtmlCompatActivity.setVisibility(document
            .getElementById("index-fragment"), true);
        HtmlCompatActivity.setVisibility(document
            .getElementById("login-fragment"), false);
    }
}