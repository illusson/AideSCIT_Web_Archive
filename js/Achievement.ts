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
        const sp = SharedPreferences.getInterface("user");
        const school_year: string = sp.getString(
            "school_year_inquire",
            sp.getString("school_year", "2019-2020")
        );
        const semester: number = sp.getNumber(
            "semester_inquire",
            sp.getNumber("semester", 0)
        );
        const grade: number = sp.getNumber("grade", 2019);

        const achieve_year: Element = document.getElementById("achieve-year");
        const achieve_year_item: Element = document.createElement('option');
        for (let i: number = 0; i < 4; i++){
            const value = (grade + i).toString() + "-" + (grade + i + 1).toString();
            achieve_year_item.setAttribute("value", value);
            achieve_year_item.textContent = value;
            if (value == school_year){
                achieve_year_item.setAttribute("selected", null)
            }
            achieve_year.appendChild(achieve_year_item);
        }

        const achieve_semester: Element = document.getElementById("achieve-semester");
        const achieve_semester_item: Element = document.createElement('option');
        for (let i: number = 0; i < 2; i++){
            achieve_semester_item.setAttribute("value", i.toString());
            achieve_semester_item.textContent = (i + 1).toString();
            if (i == semester){
                achieve_semester_item.setAttribute("selected", null)
            }
            achieve_semester.appendChild(achieve_semester_item);
        }

        const achievement = localStorage.getItem("cache.achievement");
        if (achievement != null){
            AchievementHelper.parse(achievement, this);
        } else {
            this.getAchievement();
        }
    }

    public getAchievement(){
        const school_year_inquire: string = document.getElementById("achieve-year").nodeValue;
        const semester_inquire: number = parseInt(document.getElementById("achieve-semester").nodeValue);
        SharedPreferences.getInterface("user").edit()
            .putString("school_year_inquire", school_year_inquire)
            .putNumber("semester_inquire", semester_inquire)
            .apply();
        new AchievementHelper().get(school_year_inquire, semester_inquire, this);
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