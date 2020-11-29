import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {CookieUnit} from "./core/CookieUnit";
import {LoginHelper, SpringboardCallback} from "./helper/LoginHelper";
import {CurlToolException} from "./core/CurlUnit";

export class Mine extends HtmlCompatActivity {
    public onCreate() {

    }

    public logout(): void {
        CookieUnit.remove("access_token");
        CookieUnit.remove("refresh_token");

        HtmlCompatActivity.setVisibility(document
            .getElementById("index-fragment"), false);
        HtmlCompatActivity.setVisibility(document
            .getElementById("login-fragment"), true);
    }

    public springboard(): void {
        let access: string = CookieUnit.get("access_token");
        if (access != null){
            new LoginHelper().springboard(access[0], new class implements SpringboardCallback {
                onFailure(code: number, message?: string, e?: CurlToolException) {
                    window.open('http://218.6.163.95:18080/zfca?yhlx=student&login=0122579031373493708&url=xs_main.aspx');
                }

                onResult(location: string) {
                    window.open(location);
                }
            })
        } else {
            window.open('http://218.6.163.95:18080/zfca?yhlx=student&login=0122579031373493708&url=xs_main.aspx');
        }
    }
}