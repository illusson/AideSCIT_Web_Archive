import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {CookieUnit} from "./core/CookieUnit";
import {LoginHelper, SpringboardCallback} from "./helper/LoginHelper";
import {CurlToolException} from "./core/CurlUnit";
import {SharedPreferences} from "./core/SharedPreferences";

export class Mine extends HtmlCompatActivity {
    protected readonly title: string = "我的";

    protected onActivityCreate() { }

    protected onViewSetup() {
        const sp: SharedPreferences = SharedPreferences.getInterface("user");
        document.getElementById("mine-name").textContent = sp
            .getString("name", "某位不愿意透露姓名的") + " 同学";
        document.getElementById("user-info-faculty").textContent = sp
            .getString("faculty", "某个牛逼的学院");
        document.getElementById("user-info-specialty").textContent = sp
            .getString("specialty", "某个牛逼的专业");
        document.getElementById("user-info-grade").textContent = sp
            .getNumber("grade", 2077).toString() + " 级";
        document.getElementById("user-info-class").textContent = sp
            .getString("userClass", "某个牛逼的班级");
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
        if (!this.loadState){
            this.setOnLoadState(true);
            let access: string = CookieUnit.get("access_token");
            if (access != null){
                const this_Mine = this;
                new LoginHelper().springboard(access[0], new class implements SpringboardCallback {
                    onFailure(code: number, message?: string, e?: CurlToolException) {
                        this_Mine.setOnLoadState(false);
                        window.open('http://218.6.163.95:18080/zfca?yhlx=student&login=0122579031373493708&url=xs_main.aspx');
                    }

                    onResult(location: string) {
                        this_Mine.setOnLoadState(false);
                        window.open(location);
                    }
                })
            } else {
                window.open('http://218.6.163.95:18080/zfca?yhlx=student&login=0122579031373493708&url=xs_main.aspx');
            }
        }
    }
}