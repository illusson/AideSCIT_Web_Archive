import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {AchievementCallback, AchievementHelper} from "./helper/AchievementHelper";
import {CurlToolException} from "./core/CurlUnit";
import {FailedMarkData} from "./data/FailedMarkData";
import {PassedMarkData} from "./data/PassedMarkData";
import {SharedPreferences} from "./core/SharedPreferences";

export class Achievement extends HtmlCompatActivity implements AchievementCallback {
    private passed_count = 0;
    private failed_count = 0;

    public onCreate() {
        const achievement = localStorage.getItem("cache.achievement");
        if (achievement != null){
            AchievementHelper.parse(achievement, this);
        } else {
            this.getAchievement();
        }
    }

    private getAchievement(){
        const sp = SharedPreferences.getInterface("user");
        const school_year: string = sp.getString("school_year", "");
        const semester: number = sp.getNumber("semester", 0);
        new AchievementHelper().get(school_year, semester, this);
    }

    onFailure(code: number, message?: string, e?: CurlToolException) {
        // @ts-ignore
        mdui.snackbar({
            message: '课表获取失败，' + message + '(' + code.toString() + ')'
        })
    }

    onReadFailed(data: FailedMarkData) {
        const failed: Element = document.getElementById("achieve-failed-content");

        const failed_item: Element = document.createElement('div');
        failed_item.classList.add('table-content', 'achieve-passed-column');
        const content_item: Element = document.createElement('p');
        content_item.classList.add('table-item-title');
        content_item.textContent = data.name;
        failed_item.appendChild(content_item);

        content_item.classList.remove('table-item-title');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.mark;
        failed_item.appendChild(content_item);

        failed.appendChild(failed_item);

        this.failed_count++;
    }

    onReadFinish() {
        Achievement.setVisibility(document.getElementById("achieve-passed-empty"), this.passed_count == 0);
        Achievement.setVisibility(document.getElementById("achieve-failed-empty"), this.failed_count == 0);
    }

    onReadPassed(data: PassedMarkData) {
        const passed: Element = document.getElementById("achieve-passed-content");

        const passed_item: Element = document.createElement('div');
        passed_item.classList.add('table-content', 'achieve-passed-column', 'achieve-item');
        const content_item: Element = document.createElement('p');
        content_item.classList.add('table-item-title');
        content_item.textContent = data.name;
        passed_item.appendChild(content_item);

        content_item.classList.remove('table-item-title');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.mark;
        passed_item.appendChild(content_item);

        content_item.textContent = data.retake;
        passed_item.appendChild(content_item);

        content_item.textContent = data.rebuild;
        passed_item.appendChild(content_item);

        content_item.textContent = data.credit;
        passed_item.appendChild(content_item);

        passed.appendChild(passed_item);

        this.passed_count++;
    }

    onReadStart() {
        this.passed_count = 0;
        this.failed_count = 0;

        const items_passed: HTMLCollectionOf<Element> = document
            .getElementsByClassName("achieve-item");
        for (let i: number = 0; i < items_passed.length; i++){
            items_passed.item(i).remove();
        }
    }
}