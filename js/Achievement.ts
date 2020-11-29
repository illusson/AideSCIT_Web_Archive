import {HtmlCompatActivity} from "./core/HtmlCompatActivity";
import {AchievementCallback, AchievementHelper} from "./helper/AchievementHelper";
import {CurlToolException} from "./core/CurlUnit";
import {FailedMarkData} from "./data/FailedMarkData";
import {PassedMarkData} from "./data/PassedMarkData";
import {SharedPreferences} from "./core/SharedPreferences";
import {Log} from "./core/Log";

export class Achievement extends HtmlCompatActivity implements AchievementCallback {
    protected readonly title: string = "成绩单";

    private passed_count = 0;
    private failed_count = 0;

    //@ts-ignore
    private static readonly achieve_year_inst = new mdui.Select("#achieve-year", {
        position: 'bottom'
    });
    //@ts-ignore
    private static readonly achieve_semester_inst = new mdui.Select("#achieve-semester", {
        position: 'bottom'
    });

    protected onActivityCreate() {
        const achievement = localStorage.getItem("cache.achievement");
        if (achievement != null){
            AchievementHelper.parse(achievement, this);
        }
        this.getAchievement();
    }

    protected onViewSetup() {
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
        Log.d("achievement", "school_year: " + school_year + ", semester: " + semester);

        const achieve_year: Element = document
            .getElementById("achieve-year") as HTMLSelectElement;
        achieve_year.innerHTML = "";
        for (let i: number = 0; i < 4; i++){
            const achieve_year_item: Element = document.createElement('option')
            const value: string = (grade + i).toString() + "-" + (grade + i + 1).toString();
            achieve_year_item.setAttribute("value", value);
            achieve_year_item.textContent = value;
            if (value == school_year){
                achieve_year_item.setAttribute("selected", "selected")
            }
            achieve_year.appendChild(achieve_year_item);
        }
        Achievement.achieve_year_inst.handleUpdate();

        const achieve_semester: Element = document
            .getElementById("achieve-semester") as HTMLSelectElement;
        achieve_semester.innerHTML = "";
        for (let i: number = 1; i < 3; i++){
            const achieve_semester_item: Element = document.createElement('option');
            achieve_semester_item.setAttribute("value", i.toString());
            achieve_semester_item.textContent = i.toString();
            if (i == semester){
                achieve_semester_item.setAttribute("selected", null)
            }
            achieve_semester.appendChild(achieve_semester_item);
        }
        Achievement.achieve_semester_inst.handleUpdate();
    }

    public getAchievement(){
        const school_year_inquire: HTMLSelectElement = document
            .getElementById("achieve-year") as HTMLSelectElement;
        const semester_inquire: HTMLSelectElement = document
            .getElementById("achieve-semester") as HTMLSelectElement;
        SharedPreferences.getInterface("user").edit()
            .putString("school_year_inquire", school_year_inquire.value)
            .putNumber("semester_inquire", parseInt(semester_inquire.value))
            .apply();
        new AchievementHelper().get(school_year_inquire.value, parseInt(semester_inquire.value), this);
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

        let content_item: Element = document.createElement('p');
        content_item.classList.add('table-item-first');
        content_item.textContent = data.name;
        failed_item.appendChild(content_item);

        content_item = document.createElement('p');
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

        let content_item: Element = document.createElement('p');
        content_item.classList.add('table-item-first');
        content_item.textContent = data.name;
        passed_item.appendChild(content_item);

        content_item = document.createElement('p');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.mark;
        passed_item.appendChild(content_item);

        content_item = document.createElement('p');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.retake;
        passed_item.appendChild(content_item);

        content_item = document.createElement('p');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.rebuild;
        passed_item.appendChild(content_item);

        content_item = document.createElement('p');
        content_item.classList.add('table-item-content');
        content_item.textContent = data.credit;
        passed_item.appendChild(content_item);

        passed.appendChild(passed_item);

        this.passed_count++;
    }

    onReadStart() {
        this.passed_count = 0;
        this.failed_count = 0;

        document.getElementById("achieve-passed-content").innerHTML = "";
        document.getElementById("achieve-failed-content").innerHTML = "";
    }
}